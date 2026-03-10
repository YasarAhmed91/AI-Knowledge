# ============================================================
# Embeddings Service — Generate vectors for text chunks
# ============================================================

import os
import asyncio
from typing import List
import numpy as np

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")   # "openai" | "gemini"

# ── OpenAI ────────────────────────────────────────────────────
if AI_PROVIDER == "openai":
    from openai import AsyncOpenAI
    _client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
    EMBED_DIM   = 1536

# ── Google Gemini ─────────────────────────────────────────────
else:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    EMBED_MODEL = "models/text-embedding-004"
    EMBED_DIM   = 768


async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed a batch of texts. Returns list of float vectors."""
    if AI_PROVIDER == "openai":
        return await _embed_openai_batch(texts)
    else:
        return await _embed_gemini_batch(texts)


async def embed_query(query: str) -> List[float]:
    """Embed a single query string."""
    results = await embed_texts([query])
    return results[0]


# ── OpenAI implementation ─────────────────────────────────────

async def _embed_openai_batch(texts: List[str]) -> List[List[float]]:
    """Batch embedding with OpenAI — max 2048 items per request."""
    all_embeddings = []
    batch_size = 100

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        # Clean texts (API rejects empty strings)
        batch = [t.replace("\n", " ").strip() or "empty" for t in batch]

        response = await _client.embeddings.create(
            input=batch,
            model=EMBED_MODEL,
        )
        for item in response.data:
            all_embeddings.append(item.embedding)

    return all_embeddings


# ── Gemini implementation ─────────────────────────────────────

async def _embed_gemini_batch(texts: List[str]) -> List[List[float]]:
    loop = asyncio.get_event_loop()

    def _sync_embed(texts):
        results = []
        for text in texts:
            result = genai.embed_content(
                model=EMBED_MODEL,
                content=text,
                task_type="retrieval_document",
            )
            results.append(result["embedding"])
        return results

    return await loop.run_in_executor(None, _sync_embed, texts)


# ── Build vector store for a book ────────────────────────────

async def build_book_vector_store(book_id: str, pages: List[dict]) -> int:
    """
    Full pipeline: extract chunks → embed → store in FAISS.
    Returns number of chunks stored.
    """
    from services.pdf_processor import chunk_text
    from vector_store.faiss_index import add_book_chunks

    chunks = chunk_text(pages, chunk_size=512, overlap=64)
    if not chunks:
        return 0

    texts = [c["text"] for c in chunks]

    # Embed in batches
    vectors = await embed_texts(texts)
    vectors_np = np.array(vectors, dtype=np.float32)

    # Store in FAISS
    add_book_chunks(book_id, chunks, vectors_np)
    return len(chunks)
