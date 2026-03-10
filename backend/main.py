# ============================================================
# AI Knowledge Navigator — FastAPI Backend Entry Point
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import connect_db, disconnect_db
from routes import auth, books, chat, search, analytics, recommendations
from vector_store.faiss_index import init_faiss_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # Startup
    await connect_db()
    init_faiss_store()
    os.makedirs("uploads", exist_ok=True)
    print("✅ Database connected")
    print("✅ FAISS store initialized")
    print("✅ Upload directory ready")
    yield
    # Shutdown
    await disconnect_db()
    print("🔴 Database disconnected")


app = FastAPI(
    title="AI Knowledge Navigator API",
    description="AI-powered smart e-library backend",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev
        "http://localhost:5173",   # Vite dev
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving (uploaded PDFs) ───────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router,            prefix="/api/auth",            tags=["Auth"])
app.include_router(books.router,           prefix="/api/books",           tags=["Books"])
app.include_router(chat.router,            prefix="/api/chat",            tags=["Chat"])
app.include_router(search.router,          prefix="/api/search",          tags=["Search"])
app.include_router(analytics.router,       prefix="/api/analytics",       tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])


@app.get("/")
async def root():
    return {"status": "online", "service": "AI Knowledge Navigator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
