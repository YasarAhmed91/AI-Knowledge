import { useState } from "react";
import { BOOKS } from "../data/books";

const RESULTS = [
  {
    book: BOOKS[0],
    relevance: 98,
    snippet:
      "Chapter 6 provides comprehensive coverage of deep learning optimization, including momentum, Adam optimizer, and learning rate schedules — essential for mastering neural network training.",
  },
  {
    book: BOOKS[5],
    relevance: 87,
    snippet:
      "Chapter 4 covers NumPy operations and vectorized computations fundamental to efficient data preprocessing pipelines in machine learning workflows.",
  },
  {
    book: BOOKS[2],
    relevance: 74,
    snippet:
      "Chapter 12 discusses ML system design patterns, feature stores, and model serving architectures critical for production deployments.",
  },
];

const SUGGESTIONS = [
  "Python for data science",
  "How neural networks learn",
  "System design at scale",
  "Career in machine learning",
  "Algorithms and complexity",
];

export default function Search() {
  const [query, setQuery]     = useState("");
  const [searched, setSearched] = useState(false);

  const doSearch = (q) => {
    setQuery(q);
    setSearched(true);
  };

  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="badge badge-violet" style={{ marginBottom: 12 }}>🔍 SEMANTIC SEARCH</div>
        <h1 className="page-title">
          Search by <span className="gradient-text">Concept</span>
        </h1>
        <p className="page-subtitle">
          // Not keyword search — vector similarity across your entire library
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder='Try: "I want to learn Python for data science" or "How do transformers work?"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
          style={{ fontSize: 16, padding: "18px 20px 18px 52px" }}
        />
      </div>

      {/* ── Quick suggestion tags ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="tag" onClick={() => doSearch(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {!searched && (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔮</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Semantic Search Engine</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto" }}>
            Ask in natural language. We use FAISS vector embeddings to find the most conceptually
            relevant passages across your entire library.
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {searched && (
        <div className="fade-up">
          <div className="summary-block" style={{ marginBottom: 24 }}>
            <div className="summary-block-title">🔮 VECTOR SEARCH RESULTS</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Query embedded → Cosine similarity across {BOOKS.length * 400} chunks → Top 3 results
            </div>
          </div>

          {RESULTS.map((r, i) => (
            <div
              key={i}
              className="glass"
              style={{ padding: 20, marginBottom: 16, cursor: "pointer", transition: "all 0.3s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-bright)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.transform = "";
              }}
            >
              <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                <div
                  style={{
                    width: 44, height: 56, borderRadius: 8,
                    background: `linear-gradient(135deg, ${r.book.color}, ${r.book.accent}33)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, flexShrink: 0,
                  }}
                >
                  {r.book.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.book.title}</div>
                    <div className="badge badge-emerald">{r.relevance}% match</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.book.author}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
                "{r.snippet}"
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}>Open Book</button>
                <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}>Ask About This</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
