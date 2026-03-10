// ── BookCard ──────────────────────────────────────────────────
// Displays a single book in the library grid.
// Props: book (object), onClick, delay (animation delay index)

export default function BookCard({ book, onClick, delay = 0 }) {
  return (
    <div
      className="glass book-card fade-up"
      style={{ animationDelay: `${delay * 0.07}s` }}
      onClick={() => onClick(book)}
    >
      <div
        className="book-cover"
        style={{
          background: `linear-gradient(135deg, ${book.color}, ${book.accent}22)`,
          border: `1px solid ${book.accent}33`,
        }}
      >
        <span style={{ fontSize: 52, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
          {book.emoji}
        </span>
      </div>

      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>

        <div className="book-progress-bar">
          <div
            className="book-progress-fill"
            style={{
              width: `${book.progress}%`,
              background: `linear-gradient(90deg, ${book.accent}, ${book.accent}88)`,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <span className="book-progress-text">{book.pages} pages</span>
          <span style={{ fontSize: 11, color: book.accent, fontFamily: "var(--font-mono)" }}>
            {book.progress === 100 ? "✓ Done" : `${book.progress}%`}
          </span>
        </div>

        <div style={{ marginTop: 10 }}>
          {book.tags.map((t) => (
            <span key={t} className="badge badge-cyan" style={{ fontSize: 9, marginRight: 4 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
