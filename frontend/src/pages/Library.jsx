import { useState } from "react";
import BookCard from "../components/BookCard";
import UploadZone from "../components/UploadZone";
import { BOOKS } from "../data/books";

const ALL_TAGS = ["All", "AI", "ML", "Software", "Python", "Data", "CS", "Systems"];

export default function Library({ onSelectBook }) {
  const [search, setSearch]     = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = BOOKS.filter(
    (b) =>
      (activeTag === "All" || b.tags.includes(activeTag)) &&
      b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="badge badge-amber" style={{ marginBottom: 12 }}>📚 SMART LIBRARY</div>
        <h1 className="page-title">Your Knowledge Vault</h1>
        <p className="page-subtitle">// {BOOKS.length} books · AI-indexed · Vector searchable</p>
      </div>

      {/* ── Search ── */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by concept, topic, or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tag filter ── */}
      <div style={{ marginBottom: 24 }}>
        {ALL_TAGS.map((t) => (
          <button
            key={t}
            className={`tag ${activeTag === t ? "selected" : ""}`}
            onClick={() => setActiveTag(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Book grid ── */}
      <div className="book-grid">
        {filtered.map((book, i) => (
          <BookCard key={book.id} book={book} onClick={onSelectBook} delay={i} />
        ))}
        <UploadZone />
      </div>
    </div>
  );
}
