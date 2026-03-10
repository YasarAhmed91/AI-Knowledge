# ============================================================
# Books Routes — Upload, List, Detail, Summary, Progress
# ============================================================

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks, Form
from bson import ObjectId
from datetime import datetime
import os, shutil, uuid

from database import get_db
from routes.auth import get_current_user
from models import BookResponse, BookSummaryResponse, ProgressUpdate
from services.pdf_processor import extract_text_from_pdf
from services.embeddings import build_book_vector_store
from services.ai_service import generate_book_summary

router = APIRouter()

UPLOAD_DIR = "uploads"
BOOK_EMOJIS = ["📘", "📗", "📕", "📙", "🧠", "⚡", "🔬", "🏗️", "📐", "⚙️", "🔧", "📊"]
BOOK_COLORS = ["#0d1f3f", "#1a1000", "#0d1f2d", "#1a0d2e", "#0d2010", "#1f0d1a"]
BOOK_ACCENTS = ["#00c8ff", "#ffb800", "#10d9a0", "#8b5cf6", "#ff6b6b", "#00ff88"]


def serialize_book(b: dict) -> dict:
    return {
        "id":              str(b["_id"]),
        "title":           b["title"],
        "author":          b.get("author", "Unknown"),
        "tags":            b.get("tags", []),
        "progress":        b.get("progress", 0),
        "total_pages":     b.get("total_pages", 0),
        "current_chapter": b.get("current_chapter", 1),
        "emoji":           b.get("emoji", "📘"),
        "color":           b.get("color", "#0d1f3f"),
        "accent":          b.get("accent", "#00c8ff"),
        "is_processed":    b.get("is_processed", False),
        "summary":         b.get("summary"),
        "created_at":      b.get("created_at", datetime.utcnow()),
    }


# ── Background task: process PDF after upload ─────────────────

async def process_pdf_background(book_id: str, file_path: str, db):
    """Extract text → chunk → embed → store in FAISS. Update DB."""
    try:
        # 1. Extract text
        pages = extract_text_from_pdf(file_path)
        full_text = "\n\n".join([p["text"] for p in pages])

        # 2. Build vector store
        chunk_count = await build_book_vector_store(book_id, pages)

        # 3. Generate AI summary
        summary_data = await generate_book_summary(full_text[:8000], book_id)

        # 4. Update MongoDB
        await db.books.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": {
                "is_processed":       True,
                "total_pages":        len(pages),
                "chunk_count":        chunk_count,
                "summary":            summary_data.get("summary", ""),
                "key_points":         summary_data.get("key_points", []),
                "important_concepts": summary_data.get("important_concepts", []),
                "exam_questions":     summary_data.get("exam_questions", []),
                "processed_at":       datetime.utcnow(),
            }}
        )
        print(f"✅ Book {book_id} processed — {chunk_count} chunks embedded")
    except Exception as e:
        print(f"❌ Processing failed for {book_id}: {e}")
        await db.books.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": {"processing_error": str(e)}}
        )


# ── Routes ────────────────────────────────────────────────────

@router.post("/upload", status_code=201)
async def upload_book(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    author: str = Form("Unknown"),
    tags: str = Form(""),          # comma-separated
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Save file
    file_id = str(uuid.uuid4())
    user_dir = os.path.join(UPLOAD_DIR, str(current_user["_id"]))
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, f"{file_id}.pdf")

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Pick visual style
    idx = hash(title) % len(BOOK_EMOJIS)
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    # Insert into MongoDB
    book_doc = {
        "user_id":         current_user["_id"],
        "title":           title,
        "author":          author,
        "tags":            tag_list,
        "file_path":       file_path,
        "file_id":         file_id,
        "progress":        0,
        "current_chapter": 1,
        "total_pages":     0,
        "emoji":           BOOK_EMOJIS[idx % len(BOOK_EMOJIS)],
        "color":           BOOK_COLORS[idx % len(BOOK_COLORS)],
        "accent":          BOOK_ACCENTS[idx % len(BOOK_ACCENTS)],
        "is_processed":    False,
        "created_at":      datetime.utcnow(),
    }
    result = await db.books.insert_one(book_doc)
    book_id = str(result.inserted_id)

    # Queue background processing
    background_tasks.add_task(process_pdf_background, book_id, file_path, db)

    return {
        "id":      book_id,
        "message": "Book uploaded — AI processing started in background",
        "status":  "processing",
    }


@router.get("/")
async def list_books(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    cursor = db.books.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    books = await cursor.to_list(length=100)
    return [serialize_book(b) for b in books]


@router.get("/{book_id}")
async def get_book(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    book = await db.books.find_one({
        "_id": ObjectId(book_id),
        "user_id": current_user["_id"],
    })
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return serialize_book(book)


@router.get("/{book_id}/summary", response_model=BookSummaryResponse)
async def get_summary(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    book = await db.books.find_one({
        "_id": ObjectId(book_id),
        "user_id": current_user["_id"],
    })
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if not book.get("is_processed"):
        raise HTTPException(status_code=202, detail="Book is still being processed")

    return {
        "book_id":            book_id,
        "title":              book["title"],
        "summary":            book.get("summary", ""),
        "key_points":         book.get("key_points", []),
        "important_concepts": book.get("important_concepts", []),
        "exam_questions":     book.get("exam_questions", []),
    }


@router.put("/{book_id}/progress")
async def update_progress(
    book_id: str,
    payload: ProgressUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    book = await db.books.find_one({
        "_id": ObjectId(book_id),
        "user_id": current_user["_id"],
    })
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    await db.books.update_one(
        {"_id": ObjectId(book_id)},
        {"$set": {
            "progress":        payload.progress,
            "current_chapter": payload.current_chapter,
            "last_read_at":    datetime.utcnow(),
        }}
    )

    # Log to analytics
    today = datetime.utcnow().date().isoformat()
    await db.analytics.update_one(
        {"user_id": current_user["_id"], "date": today},
        {"$inc": {"study_minutes": payload.reading_time_minutes},
         "$addToSet": {"books_accessed": ObjectId(book_id)},
         "$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"message": "Progress updated"}


@router.delete("/{book_id}")
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    book = await db.books.find_one({
        "_id": ObjectId(book_id),
        "user_id": current_user["_id"],
    })
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Remove file
    if os.path.exists(book.get("file_path", "")):
        os.remove(book["file_path"])

    # Remove FAISS index for this book
    from vector_store.faiss_index import delete_book_index
    delete_book_index(book_id)

    await db.books.delete_one({"_id": ObjectId(book_id)})
    await db.chat_sessions.delete_many({"book_id": ObjectId(book_id)})
    return {"message": "Book deleted"}
