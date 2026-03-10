# AI Knowledge Navigator — Full-Stack Setup Guide

> AI-powered smart e-library with RAG chatbot, semantic search, PDF processing, and personalized recommendations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Next.js + Tailwind |
| Backend | Python FastAPI |
| Database | MongoDB (Motor async) |
| Vector DB | FAISS (per-book indexes) |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| PDF | pdfplumber / PyPDF2 |
| Auth | JWT (python-jose + bcrypt) |

---

## Project Structure

```
ai-knowledge-navigator/
├── backend/
│   ├── main.py                    ← FastAPI app entry point
│   ├── database.py                ← MongoDB connection
│   ├── models.py                  ← Pydantic schemas
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── routes/
│   │   ├── auth.py                ← Register, login, JWT
│   │   ├── books.py               ← Upload, list, summary, progress
│   │   ├── chat.py                ← RAG chatbot Q&A
│   │   ├── search.py              ← Semantic vector search
│   │   ├── analytics.py           ← Reading dashboard data
│   │   └── recommendations.py    ← Book & career recommendations
│   ├── services/
│   │   ├── pdf_processor.py       ← Extract + chunk PDF text
│   │   ├── embeddings.py          ← OpenAI/Gemini embeddings
│   │   ├── rag_pipeline.py        ← RAG Q&A logic
│   │   ├── ai_service.py          ← Summarization
│   │   └── recommendation.py     ← Recommendation engine
│   └── vector_store/
│       └── faiss_index.py         ← FAISS index manager
├── frontend/
│   └── src/
│       ├── App-integrated.jsx     ← Main app (UI + API wired)
│       ├── api/
│       │   └── client.js          ← API client (fetch wrapper)
│       ├── hooks/
│       │   └── index.js           ← React hooks (useBooks, useChat...)
│       └── context/
│           └── AuthContext.js     ← Global auth state
└── docker-compose.yml
```

---

## Step-by-Step Setup

### 1. Prerequisites

```bash
# Required
node >= 18
python >= 3.10
mongodb (local or Atlas)

# Optional
docker & docker-compose (for containerized setup)
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Linux/macOS
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=ai_knowledge_navigator
JWT_SECRET=your-strong-random-secret-here

AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your-key-here
LLM_MODEL=gpt-4o-mini
EMBED_MODEL=text-embedding-3-small

FRONTEND_URL=http://localhost:3000
```

```bash
# Start the backend
uvicorn main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**  
API docs at: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

# If using Create React App:
npx create-react-app . --template typescript
# Then replace src/App.tsx with App-integrated.jsx

# If using Vite:
npm create vite@latest . -- --template react
npm install

# Install dependencies
npm install

# Set environment variable
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
# OR for Vite:
echo "VITE_API_URL=http://localhost:8000" > .env

# Start frontend
npm run dev
```

Frontend will be live at: **http://localhost:3000**

---

### 4. Docker Setup (Recommended)

```bash
# Copy env file
cp backend/.env.example .env

# Edit .env with your API keys, then:
docker-compose up --build

# Services:
# Backend:  http://localhost:8000
# MongoDB:  localhost:27017
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books/` | List user's books |
| POST | `/api/books/upload` | Upload PDF (multipart) |
| GET | `/api/books/{id}` | Get book details |
| GET | `/api/books/{id}/summary` | AI summary + key points |
| PUT | `/api/books/{id}/progress` | Update reading progress |
| DELETE | `/api/books/{id}` | Delete book |

### Chat (RAG)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/{bookId}` | Ask a question (RAG) |
| GET | `/api/chat/{bookId}/history` | Get chat history |
| DELETE | `/api/chat/{bookId}/history` | Clear chat |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search/semantic` | Vector similarity search |
| GET | `/api/search/suggest?q=` | Autocomplete suggestions |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Full dashboard data |
| POST | `/api/analytics/log-session` | Log reading session |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/` | Personalized books |
| GET | `/api/recommendations/career-roadmap?career=` | Study roadmap |

---

## Example Request/Response

### POST /api/chat/{bookId}

**Request:**
```json
{
  "question": "Explain backpropagation simply"
}
```

**Response:**
```json
{
  "answer": "Backpropagation is the algorithm neural networks use to learn...\n\n**Key steps:**\n1. Forward pass: input → prediction\n2. Compute loss: how wrong was the prediction?\n3. Backward pass: trace error back through each layer\n\n*Source: Page 201, Chapter 6*",
  "sources": ["Page 201", "Page 214"],
  "session_id": "6657abc123..."
}
```

### POST /api/search/semantic

**Request:**
```json
{
  "query": "I want to learn Python for data science",
  "top_k": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "book_id": "6657abc...",
      "book_title": "Python for Data Analysis",
      "book_author": "Wes McKinney",
      "relevance_score": 94.2,
      "snippet": "Chapter 4 covers NumPy arrays and pandas DataFrames...",
      "emoji": "📊"
    }
  ],
  "query": "I want to learn Python for data science",
  "total": 1
}
```

---

## RAG Pipeline (How It Works)

```
User Question
     │
     ▼
[Embed Query]  ←──  OpenAI text-embedding-3-small
     │
     ▼
[FAISS Search]  ←── Book's .index file on disk
     │
     ▼
[Top-5 Chunks]  ←── Most similar text passages
     │
     ▼
[Build Prompt]  ←── System prompt + context + history
     │
     ▼
[GPT-4o-mini]   ←── Generates grounded answer
     │
     ▼
[Return Answer + Source Pages]
```

---

## PDF Processing Pipeline

```
Upload PDF
     │
     ▼
[Save to /uploads/{user_id}/{uuid}.pdf]
     │
     ▼ (background task)
[pdfplumber.extract_text()]  ←── Per page
     │
     ▼
[chunk_text(size=512, overlap=64)]
     │
     ▼
[OpenAI embeddings] ←── Batch 100 chunks at a time
     │
     ▼
[faiss.IndexFlatIP] ←── Inner product (cosine similarity)
     │
     ▼
[Save .index + _meta.json]
     │
     ▼
[generate_book_summary()] ←── GPT-4o-mini
     │
     ▼
[Update MongoDB: is_processed=True]
```

---

## Database Schema (MongoDB)

### users
```json
{
  "_id": "ObjectId",
  "name": "Alex Chen",
  "email": "alex@example.com",
  "password_hash": "bcrypt...",
  "career_goal": "ai_engineer",
  "interests": ["AI", "ML"],
  "created_at": "ISODate",
  "last_active": "ISODate"
}
```

### books
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "Deep Learning",
  "author": "Goodfellow et al.",
  "file_path": "uploads/user_id/uuid.pdf",
  "tags": ["AI", "ML"],
  "progress": 68.0,
  "current_chapter": 12,
  "total_pages": 775,
  "is_processed": true,
  "summary": "...",
  "key_points": ["...", "..."],
  "important_concepts": ["Backpropagation", "CNN"],
  "exam_questions": ["What is...?"],
  "emoji": "🧠",
  "color": "#0d1f3f",
  "accent": "#00c8ff",
  "created_at": "ISODate",
  "processed_at": "ISODate"
}
```

### chat_sessions
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "book_id": "ObjectId",
  "messages": [
    { "role": "user", "content": "...", "timestamp": "ISODate" },
    { "role": "ai", "content": "...", "sources": ["Page 42"], "timestamp": "ISODate" }
  ],
  "created_at": "ISODate"
}
```

### analytics
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "date": "2025-01-15",
  "study_minutes": 47,
  "books_accessed": ["ObjectId"],
  "queries_made": 12,
  "created_at": "ISODate"
}
```

---

## Connecting Frontend to Backend

In `App-integrated.jsx`, the `BASE_URL` is set at the top:

```javascript
const BASE_URL = "http://localhost:8000";
```

For production, set via environment variable:
```javascript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

All API calls use the `apiFetch()` helper which:
- Automatically attaches `Authorization: Bearer <token>` header
- Handles 401 → auto logout
- Parses JSON responses
- Throws descriptive errors

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `DB_NAME` | ✅ | Database name |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `AI_PROVIDER` | ✅ | `openai` or `gemini` |
| `OPENAI_API_KEY` | If openai | Your OpenAI API key |
| `GEMINI_API_KEY` | If gemini | Your Google AI API key |
| `LLM_MODEL` | No | Default: `gpt-4o-mini` |
| `EMBED_MODEL` | No | Default: `text-embedding-3-small` |
| `FRONTEND_URL` | No | For CORS, default: `http://localhost:3000` |

---

## Run Commands Summary

```bash
# Backend (with hot reload)
cd backend && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# Both with Docker
docker-compose up --build

# View API docs
open http://localhost:8000/docs

# View app
open http://localhost:3000
```

---

## Cost Estimate (OpenAI)

| Operation | Model | ~Cost per book |
|-----------|-------|---------------|
| PDF embedding (500 chunks) | text-embedding-3-small | ~$0.01 |
| Summary generation | gpt-4o-mini | ~$0.003 |
| Per chat message | gpt-4o-mini | ~$0.001 |
| Semantic search query | text-embedding-3-small | ~$0.000001 |

A 300-page book costs approximately **$0.013** to fully process.
