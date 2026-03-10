# ============================================================
# AI Service — Summarization, Key Points, Exam Questions
# ============================================================

import os, json, re
from typing import Dict

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")

if AI_PROVIDER == "openai":
    from openai import AsyncOpenAI
    _client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
else:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    _gemini = genai.GenerativeModel("gemini-1.5-flash")


SUMMARY_PROMPT = """You are an expert educational AI. Analyze the following book/document text and produce a structured learning summary.

Return ONLY a valid JSON object with exactly these keys:
{{
  "summary": "A clear 2-3 paragraph summary of the main content",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "important_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5", "Concept 6"],
  "exam_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?"
  ]
}}

Text to analyze:
{text}

Return ONLY the JSON. No preamble, no markdown fences, no explanation."""


async def generate_book_summary(text: str, book_id: str) -> Dict:
    """Generate summary, key points, concepts, and exam questions."""
    prompt = SUMMARY_PROMPT.format(text=text[:8000])   # token limit guard

    try:
        if AI_PROVIDER == "openai":
            raw = await _openai_complete(prompt)
        else:
            raw = await _gemini_complete(prompt)

        # Strip markdown fences if model adds them
        raw = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(raw)

        return {
            "summary":            data.get("summary", ""),
            "key_points":         data.get("key_points", []),
            "important_concepts": data.get("important_concepts", []),
            "exam_questions":     data.get("exam_questions", []),
        }
    except (json.JSONDecodeError, Exception) as e:
        print(f"⚠️  Summary generation failed for {book_id}: {e}")
        return _fallback_summary(text)


async def _openai_complete(prompt: str) -> str:
    response = await _client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2048,
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


async def _gemini_complete(prompt: str) -> str:
    import asyncio
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: _gemini.generate_content(prompt))
    return response.text


def _fallback_summary(text: str) -> Dict:
    """Basic fallback if AI fails."""
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 40]
    return {
        "summary":            " ".join(sentences[:6]) + ".",
        "key_points":         sentences[6:11] if len(sentences) > 6 else [],
        "important_concepts": [],
        "exam_questions":     [],
    }
