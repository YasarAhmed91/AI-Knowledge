# ============================================================
# Models — Pydantic Schemas (Request / Response)
# ============================================================

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    career_goal: Optional[str] = "general"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    career_goal: str
    interests: List[str] = []


# ── Books ─────────────────────────────────────────────────────

class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    tags: List[str]
    progress: float
    total_pages: int
    current_chapter: int
    emoji: str
    color: str
    accent: str
    summary: Optional[str] = None
    is_processed: bool
    created_at: datetime

class BookSummaryResponse(BaseModel):
    book_id: str
    title: str
    summary: str
    key_points: List[str]
    important_concepts: List[str]
    exam_questions: List[str]

class ProgressUpdate(BaseModel):
    progress: float         # 0-100
    current_chapter: int
    reading_time_minutes: int = 0


# ── Chat ─────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str               # "user" | "ai"
    content: str
    sources: Optional[List[str]] = []
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    session_id: str


# ── Search ───────────────────────────────────────────────────

class SemanticSearchRequest(BaseModel):
    query: str
    top_k: int = 5

class SearchResult(BaseModel):
    book_id: str
    book_title: str
    book_author: str
    relevance_score: float
    snippet: str
    emoji: str


# ── Analytics ────────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    total_study_minutes: int
    books_completed: int
    current_streak_days: int
    avg_daily_minutes: float
    top_topics: List[dict]
    weekly_activity: List[dict]
    total_queries: int


# ── Recommendations ──────────────────────────────────────────

class RecommendationItem(BaseModel):
    book_id: Optional[str] = None
    title: str
    author: str
    reason: str
    match_score: float
    emoji: str
    tags: List[str]
