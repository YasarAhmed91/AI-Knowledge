# ============================================================
# FAISS Index Manager
#
# Strategy: One FAISS index per book, stored as .index files
# on disk. Metadata (chunk text + page refs) stored in JSON.
#
# Directory structure:
#   vector_store/indexes/
#     {book_id}.index        ← FAISS binary index
#     {book_id}_meta.json    ← chunk text + page numbers
# ============================================================

import os
import json
import numpy as np
from typing import List, Dict, Optional

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("⚠️  FAISS not installed — vector search will use fallback")

INDEX_DIR = os.path.join(os.path.dirname(__file__), "indexes")


def init_faiss_store():
    """Create indexes directory on startup."""
    os.makedirs(INDEX_DIR, exist_ok=True)
    print(f"📂 FAISS index directory: {INDEX_DIR}")


# ── Write ─────────────────────────────────────────────────────

def add_book_chunks(book_id: str, chunks: List[Dict], vectors: np.ndarray):
    """
    Store embeddings + metadata for a book.

    Args:
        book_id:  MongoDB book ID string
        chunks:   List of {chunk_id, text, page}
        vectors:  numpy array of shape (N, dim)
    """
    if not FAISS_AVAILABLE:
        _fallback_save(book_id, chunks, vectors)
        return

    dim = vectors.shape[1]
    # Inner product index (use normalized vectors for cosine similarity)
    faiss.normalize_L2(vectors)
    index = faiss.IndexFlatIP(dim)
    index.add(vectors)

    # Persist index
    index_path = _index_path(book_id)
    faiss.write_index(index, index_path)

    # Persist metadata
    meta = [{"chunk_id": c["chunk_id"], "text": c["text"], "page": c.get("page", 0)} for c in chunks]
    with open(_meta_path(book_id), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False)

    print(f"✅ FAISS: stored {len(chunks)} chunks for book {book_id}")


# ── Read ──────────────────────────────────────────────────────

def search_book_chunks(book_id: str, query_vector: np.ndarray, top_k: int = 5) -> List[Dict]:
    """
    Retrieve top-K most similar chunks for a given query vector.

    Returns list of {text, page, score}
    """
    if not FAISS_AVAILABLE:
        return _fallback_search(book_id, top_k)

    index_path = _index_path(book_id)
    meta_path  = _meta_path(book_id)

    if not os.path.exists(index_path):
        return []

    index = faiss.read_index(index_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    faiss.normalize_L2(query_vector)
    scores, indices = index.search(query_vector, min(top_k, index.ntotal))

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        chunk = meta[idx]
        results.append({
            "text":  chunk["text"],
            "page":  chunk["page"],
            "score": float(score),
        })
    return results


def search_all_user_books(
    query_vector: np.ndarray,
    book_ids: List[str],
    top_k: int = 5,
) -> List[Dict]:
    """
    Search across multiple books and merge results.
    Returns top_k results sorted by score.
    """
    all_results = []
    for book_id in book_ids:
        chunks = search_book_chunks(book_id, query_vector.copy(), top_k=3)
        for c in chunks:
            all_results.append({**c, "book_id": book_id})

    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results[:top_k]


# ── Delete ────────────────────────────────────────────────────

def delete_book_index(book_id: str):
    for path in [_index_path(book_id), _meta_path(book_id)]:
        if os.path.exists(path):
            os.remove(path)


# ── Helpers ───────────────────────────────────────────────────

def _index_path(book_id: str) -> str:
    return os.path.join(INDEX_DIR, f"{book_id}.index")

def _meta_path(book_id: str) -> str:
    return os.path.join(INDEX_DIR, f"{book_id}_meta.json")


# ── Fallback (no FAISS) ───────────────────────────────────────

def _fallback_save(book_id: str, chunks: List[Dict], vectors: np.ndarray):
    """Store raw numpy arrays as .npy when FAISS not available."""
    np.save(os.path.join(INDEX_DIR, f"{book_id}_vectors.npy"), vectors)
    with open(_meta_path(book_id), "w") as f:
        json.dump([{"chunk_id": c["chunk_id"], "text": c["text"], "page": c.get("page", 0)} for c in chunks], f)


def _fallback_search(book_id: str, top_k: int) -> List[Dict]:
    """Return first N chunks as fallback."""
    meta_path = _meta_path(book_id)
    if not os.path.exists(meta_path):
        return []
    with open(meta_path, "r") as f:
        meta = json.load(f)
    return [{"text": m["text"], "page": m["page"], "score": 0.5} for m in meta[:top_k]]
