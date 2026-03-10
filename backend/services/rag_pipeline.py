# ============================================================
# RAG Pipeline — Retrieval Augmented Generation
#
# Flow:
#   User Question
#   → Embed query
#   → FAISS similarity search
#   → Retrieve top-K chunks
#   → Build prompt with context
#   → Call LLM
#   → Return answer + source pages
# ============================================================

import os
from typing import List, Dict
import numpy as np

from services.embeddings import embed_query
from vector_store.faiss_index import search_book_chunks

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")

if AI_PROVIDER == "openai":
    from openai import AsyncOpenAI
    _llm = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
else:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    _gemini_model = genai.GenerativeModel("gemini-1.5-flash")


SYSTEM_PROMPT = """You are an expert AI study assistant embedded inside a smart e-library platform.

Your role:
- Answer questions based ONLY on the provided book context below
- Be clear, structured, and educational
- Use markdown formatting: **bold** for key terms, bullet points for lists
- Cite page numbers when available (e.g. *Source: Page 42*)
- If the context doesn't contain the answer, say so honestly — don't hallucinate
- Adjust complexity to the question (simple questions → simple answers)

Keep answers concise but complete. Aim for 150-300 words unless a longer explanation is genuinely needed."""


async def run_rag_query(
    question: str,
    book_id: str,
    chat_history: List[Dict] = None,
    top_k: int = 5,
) -> Dict:
    """
    Full RAG pipeline for a single question.

    Returns:
        {"answer": str, "sources": List[str]}
    """
    # 1. Embed the question
    query_vector = await embed_query(question)
    query_np = np.array([query_vector], dtype=np.float32)

    # 2. Retrieve top-K chunks from FAISS
    chunks = search_book_chunks(book_id, query_np, top_k=top_k)

    if not chunks:
        return {
            "answer": "I couldn't find relevant content in this book to answer your question. "
                      "The book may still be processing, or this topic may not be covered.",
            "sources": [],
        }

    # 3. Build context string
    context_parts = []
    source_pages = []
    for c in chunks:
        page_ref = f"[Page {c['page']}]" if c.get("page") else ""
        context_parts.append(f"{page_ref}\n{c['text']}")
        if c.get("page") and f"Page {c['page']}" not in source_pages:
            source_pages.append(f"Page {c['page']}")

    context = "\n\n---\n\n".join(context_parts)

    # 4. Build messages
    messages = _build_messages(question, context, chat_history or [])

    # 5. Call LLM
    if AI_PROVIDER == "openai":
        answer = await _call_openai(messages)
    else:
        answer = await _call_gemini(messages)

    return {"answer": answer, "sources": source_pages}


def _build_messages(question: str, context: str, history: List[Dict]) -> List[Dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Inject context as a system message
    messages.append({
        "role": "system",
        "content": f"RELEVANT BOOK CONTENT:\n\n{context}\n\n---\nAnswer the user's question using only the above content."
    })

    # Add recent history (alternating user/assistant)
    for h in history[-4:]:
        role = "assistant" if h["role"] == "ai" else "user"
        messages.append({"role": role, "content": h["content"]})

    # Current question
    messages.append({"role": "user", "content": question})
    return messages


async def _call_openai(messages: List[Dict]) -> str:
    response = await _llm.chat.completions.create(
        model=LLM_MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0.3,
    )
    return response.choices[0].message.content


async def _call_gemini(messages: List[Dict]) -> str:
    import asyncio
    # Flatten messages to a single prompt for Gemini
    full_prompt = "\n\n".join([
        f"{'SYSTEM' if m['role'] == 'system' else m['role'].upper()}: {m['content']}"
        for m in messages
    ])

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: _gemini_model.generate_content(full_prompt)
    )
    return response.text
