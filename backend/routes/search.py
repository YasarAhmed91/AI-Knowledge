# ============================================================
# Search Routes — Semantic (vector) search
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database import get_db
from routes.auth import get_current_user
from models import SemanticSearchRequest, SearchResult
from services.embeddings import embed_query
from vector_store.faiss_index import search_all_user_books

router = APIRouter()


@router.post("/semantic")
async def semantic_search(
    payload: SemanticSearchRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Get all user's processed book IDs
    cursor = db.books.find(
        {"user_id": current_user["_id"], "is_processed": True},
        {"_id": 1, "title": 1, "author": 1, "emoji": 1}
    )
    user_books = await cursor.to_list(length=100)

    if not user_books:
        return {"results": [], "query": payload.query, "message": "No processed books found"}

    book_map = {str(b["_id"]): b for b in user_books}
    book_ids = list(book_map.keys())

    # Embed query and search FAISS
    query_vector = await embed_query(payload.query)
    raw_results = search_all_user_books(query_vector, book_ids, top_k=payload.top_k)

    # Enrich results with book metadata
    results = []
    seen_books = set()
    for r in raw_results:
        book_id = r["book_id"]
        if book_id in seen_books:
            continue
        seen_books.add(book_id)

        book_meta = book_map.get(book_id, {})
        results.append({
            "book_id":       book_id,
            "book_title":    book_meta.get("title", "Unknown"),
            "book_author":   book_meta.get("author", "Unknown"),
            "relevance_score": round(r["score"] * 100, 1),
            "snippet":       r["chunk_text"][:300] + "...",
            "emoji":         book_meta.get("emoji", "📘"),
        })

    return {"results": results, "query": payload.query, "total": len(results)}


@router.get("/suggest")
async def search_suggestions(
    q: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Quick tag/title suggestions for the search bar."""
    if len(q) < 2:
        return {"suggestions": []}

    cursor = db.books.find(
        {
            "user_id": current_user["_id"],
            "$or": [
                {"title":  {"$regex": q, "$options": "i"}},
                {"author": {"$regex": q, "$options": "i"}},
                {"tags":   {"$regex": q, "$options": "i"}},
            ]
        },
        {"title": 1, "author": 1, "emoji": 1}
    ).limit(5)

    books = await cursor.to_list(length=5)
    suggestions = [{"text": f"{b['emoji']} {b['title']} — {b['author']}", "type": "book"} for b in books]
    return {"suggestions": suggestions}
