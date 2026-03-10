# ============================================================
# Chat Routes — RAG-powered Q&A per book
# ============================================================

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from bson import ObjectId
from datetime import datetime
import json

from database import get_db
from routes.auth import get_current_user
from models import ChatRequest, ChatResponse, ChatMessage
from services.rag_pipeline import run_rag_query

router = APIRouter()


@router.post("/{book_id}", response_model=ChatResponse)
async def chat_with_book(
    book_id: str,
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    # Verify book belongs to user
    book = await db.books.find_one({
        "_id": ObjectId(book_id),
        "user_id": current_user["_id"],
    })
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if not book.get("is_processed"):
        raise HTTPException(status_code=202, detail="Book is still being processed. Please wait.")

    # Load chat history for context
    session = await db.chat_sessions.find_one({
        "user_id": current_user["_id"],
        "book_id": ObjectId(book_id),
    })
    history = session.get("messages", [])[-6:] if session else []   # last 3 turns

    # Run RAG pipeline
    result = await run_rag_query(
        question=payload.question,
        book_id=book_id,
        chat_history=history,
    )

    answer  = result["answer"]
    sources = result["sources"]

    # Persist to chat session
    new_messages = [
        {"role": "user",  "content": payload.question, "timestamp": datetime.utcnow()},
        {"role": "ai",    "content": answer, "sources": sources, "timestamp": datetime.utcnow()},
    ]

    if session:
        await db.chat_sessions.update_one(
            {"_id": session["_id"]},
            {"$push": {"messages": {"$each": new_messages}}}
        )
        session_id = str(session["_id"])
    else:
        res = await db.chat_sessions.insert_one({
            "user_id":    current_user["_id"],
            "book_id":    ObjectId(book_id),
            "messages":   new_messages,
            "created_at": datetime.utcnow(),
        })
        session_id = str(res.inserted_id)

    # Track query in analytics
    today = datetime.utcnow().date().isoformat()
    await db.analytics.update_one(
        {"user_id": current_user["_id"], "date": today},
        {"$inc": {"queries_made": 1},
         "$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True,
    )

    return {"answer": answer, "sources": sources, "session_id": session_id}


@router.get("/{book_id}/history")
async def get_chat_history(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    session = await db.chat_sessions.find_one({
        "user_id": current_user["_id"],
        "book_id": ObjectId(book_id),
    })
    if not session:
        return {"messages": [], "session_id": None}

    messages = []
    for m in session.get("messages", []):
        messages.append({
            "role":      m["role"],
            "content":   m["content"],
            "sources":   m.get("sources", []),
            "timestamp": m.get("timestamp"),
        })

    return {"messages": messages, "session_id": str(session["_id"])}


@router.delete("/{book_id}/history")
async def clear_chat_history(
    book_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    await db.chat_sessions.delete_one({
        "user_id": current_user["_id"],
        "book_id": ObjectId(book_id),
    })
    return {"message": "Chat history cleared"}
