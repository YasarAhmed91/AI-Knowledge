import { useState } from "react";
import { ARCH_LAYERS, API_ENDPOINTS } from "../data/books";

const DB_SCHEMAS = [
  {
    name: "users",
    fields: [
      ["_id",          "ObjectId"],
      ["email",        "String"],
      ["password_hash","String"],
      ["name",         "String"],
      ["career_goal",  "String"],
      ["interests",    "Array<String>"],
      ["created_at",   "DateTime"],
      ["last_active",  "DateTime"],
    ],
  },
  {
    name: "books",
    fields: [
      ["_id",             "ObjectId"],
      ["user_id",         "ObjectId ref"],
      ["title",           "String"],
      ["author",          "String"],
      ["pdf_url",         "String (S3)"],
      ["vector_store_id", "String (FAISS)"],
      ["summary",         "String"],
      ["key_points",      "Array<String>"],
      ["chapters",        "Array<Object>"],
      ["progress",        "Number 0-100"],
      ["created_at",      "DateTime"],
    ],
  },
  {
    name: "chat_sessions",
    fields: [
      ["_id",       "ObjectId"],
      ["user_id",   "ObjectId ref"],
      ["book_id",   "ObjectId ref"],
      ["messages",  "Array<{role,content,sources}>"],
      ["created_at","DateTime"],
    ],
  },
  {
    name: "analytics",
    fields: [
      ["_id",             "ObjectId"],
      ["user_id",         "ObjectId ref"],
      ["date",            "Date"],
      ["study_minutes",   "Number"],
      ["books_accessed",  "Array<ObjectId>"],
      ["queries_made",    "Number"],
      ["concepts_tagged", "Array<String>"],
    ],
  },
];

const DIFFERENTIATORS = [
  "RAG-powered book Q&A with source attribution",
  "FAISS vector store for sub-100ms semantic search",
  "LangChain agent for multi-step reasoning",
  "Real-time streaming responses via WebSocket",
  "Career-aware recommendation engine",
  "PDF chunk extraction + embedding pipeline",
  "Personalized learning analytics with ML scoring",
];

const DEV_ROADMAP = [
  { ph: "Phase 1", label: "Core Platform",  weeks: "Weeks 1-2",  items: "Auth, Upload, Library"      },
  { ph: "Phase 2", label: "AI Integration", weeks: "Weeks 3-4",  items: "RAG, Summarization"         },
  { ph: "Phase 3", label: "Discovery",      weeks: "Weeks 5-6",  items: "Search, Recommendations"    },
  { ph: "Phase 4", label: "Analytics",      weeks: "Weeks 7-8",  items: "Dashboard, Career Path"     },
  { ph: "Phase 5", label: "Launch",         weeks: "Weeks 9-10", items: "Optimization, Deploy"       },
];

const PIPELINES = [
  {
    label: "PDF Processing Pipeline",
    nodes: ["PDF Upload","PyPDFLoader","Text Chunking (512 tok)","OpenAI Embeddings","FAISS Store","Metadata Index"],
    color: "var(--cyan)",
    borderColor: "rgba(0,200,255,0.3)",
  },
  {
    label: "RAG Query Pipeline",
    nodes: ["User Query","Query Embedding","FAISS Similarity Search","Top-K Chunks","LangChain Prompt","GPT-4o Generation","Streamed Response"],
    color: "var(--amber)",
    borderColor: "rgba(255,184,0,0.3)",
  },
  {
    label: "Recommendation Pipeline",
    nodes: ["Reading History","User Embeddings","Collaborative Filter","Content-Based Filter","Career Weight Boost","Ranked Results"],
    color: "var(--emerald)",
    borderColor: "rgba(16,217,160,0.3)",
  },
];

const FOLDER_TREE = [
  { indent: 0, type: "folder", name: "ai-knowledge-navigator/" },
  { indent: 1, type: "folder", name: "frontend/" },
  { indent: 2, type: "folder", name: "app/ (Next.js 14 App Router)" },
  { indent: 3, type: "folder", name: "dashboard/, library/, chat/, analytics/" },
  { indent: 2, type: "folder", name: "components/" },
  { indent: 3, type: "file",   name: "BookCard.tsx, ChatInterface.tsx, Sidebar.tsx" },
  { indent: 2, type: "folder", name: "lib/ (API clients, hooks, utils)" },
  { indent: 1, type: "folder", name: "backend/" },
  { indent: 2, type: "folder", name: "app/ (FastAPI)" },
  { indent: 3, type: "folder", name: "routers/ (auth, books, chat, search, analytics)" },
  { indent: 3, type: "folder", name: "models/ (Pydantic schemas)" },
  { indent: 3, type: "folder", name: "services/ (ai_service, pdf_service, rec_service)" },
  { indent: 2, type: "folder", name: "ai/" },
  { indent: 3, type: "file",   name: "rag_pipeline.py, embeddings.py, summarizer.py" },
  { indent: 3, type: "file",   name: "career_planner.py, recommender.py" },
  { indent: 2, type: "folder", name: "db/ (MongoDB + FAISS clients)" },
  { indent: 1, type: "folder", name: "infra/" },
  { indent: 2, type: "file",   name: "docker-compose.yml, Dockerfile, nginx.conf" },
  { indent: 2, type: "file",   name: ".env.example, README.md" },
];

const TABS = [
  { id: "arch",    label: "🏗️ Architecture" },
  { id: "api",     label: "⚡ API"          },
  { id: "schema",  label: "🗄️ Schema"       },
  { id: "pipeline",label: "🔄 AI Pipeline"  },
  { id: "folder",  label: "📁 Structure"    },
];

export default function Architecture() {
  const [activeTab, setActiveTab] = useState("arch");

  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="badge badge-amber" style={{ marginBottom: 12 }}>🏗️ ARCHITECTURE</div>
        <h1 className="page-title">
          System <span className="gradient-text">Blueprint</span>
        </h1>
        <p className="page-subtitle">// Full-stack AI platform architecture documentation</p>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Architecture ── */}
      {activeTab === "arch" && (
        <div className="fade-up">
          <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
            <div className="section-title">System Architecture Layers</div>
            {ARCH_LAYERS.map((layer, i) => (
              <div key={i} className="arch-layer">
                <div className="arch-layer-label" style={{ color: layer.color }}>
                  ◈ {layer.label}
                </div>
                <div className="arch-nodes">
                  {layer.nodes.map((node, j) => (
                    <div
                      key={j}
                      className="arch-node"
                      style={{
                        color: layer.color,
                        borderColor: `${layer.color}33`,
                        background: `${layer.color}0a`,
                      }}
                    >
                      {node}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="two-col">
            {/* Differentiators */}
            <div className="glass" style={{ padding: 24 }}>
              <div className="section-title" style={{ fontSize: 15 }}>Key Differentiators</div>
              {DIFFERENTIATORS.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 8,
                    padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13,
                  }}
                >
                  <span style={{ color: "var(--emerald)", flexShrink: 0 }}>✓</span>
                  <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Dev roadmap */}
            <div className="glass" style={{ padding: 24 }}>
              <div className="section-title" style={{ fontSize: 15 }}>Dev Roadmap</div>
              {DEV_ROADMAP.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 12,
                    padding: "10px 0", borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="badge badge-cyan" style={{ flexShrink: 0 }}>{p.ph}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {p.weeks} · {p.items}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── API ── */}
      {activeTab === "api" && (
        <div className="fade-up glass" style={{ padding: 24 }}>
          <div className="section-title">REST API Endpoints</div>
          {API_ENDPOINTS.map((ep, i) => (
            <div key={i} className="api-endpoint">
              <div
                className={`method-badge ${
                  ep.method === "GET" ? "method-get" : ep.method === "DELETE" ? "method-delete" : "method-post"
                }`}
              >
                {ep.method}
              </div>
              <div style={{ color: "var(--cyan)", flex: 1 }}>{ep.path}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ep.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Schema ── */}
      {activeTab === "schema" && (
        <div className="fade-up two-col">
          {DB_SCHEMAS.map((col, i) => (
            <div key={i} className="glass" style={{ padding: 20 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 14,
                  color: "var(--amber)", marginBottom: 14, fontWeight: 600,
                }}
              >
                🗄️ {col.name}
              </div>
              {col.fields.map(([name, type]) => (
                <div key={name} className="schema-field">
                  <span>{name}</span>
                  <span className="field-type">{type}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Pipeline ── */}
      {activeTab === "pipeline" && (
        <div className="fade-up">
          {PIPELINES.map((pl, i) => (
            <div key={i} className="glass" style={{ padding: 24, marginBottom: 20 }}>
              <div className="section-title">{pl.label}</div>
              <div className="pipeline">
                {pl.nodes.map((s, j) => (
                  <div key={j} className="pipeline-step">
                    <div
                      className="pipeline-node"
                      style={{ borderColor: pl.borderColor, color: pl.color }}
                    >
                      {s}
                    </div>
                    {j < pl.nodes.length - 1 && (
                      <div className="pipeline-arrow" style={{ color: pl.color }}>→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Folder structure ── */}
      {activeTab === "folder" && (
        <div className="fade-up glass" style={{ padding: 24, fontFamily: "var(--font-mono)" }}>
          <div className="section-title">Project Folder Structure</div>
          <div>
            {FOLDER_TREE.map((item, i) => (
              <div
                key={i}
                className="tree-item"
                style={{ paddingLeft: item.indent * 20 }}
              >
                <span>{item.type === "folder" ? "📁" : "📄"}</span>
                <span style={{ color: item.type === "folder" ? "var(--amber)" : "var(--text-secondary)" }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
