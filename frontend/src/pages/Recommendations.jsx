const RECS = [
  {
    emoji: "🤗",
    title: "Transformers for NLP",
    author: "Lewis Tunstall et al.",
    reason: "Based on your Deep Learning progress",
    score: "99% match",
    color: "#0d1f3f",
    accent: "#00c8ff",
  },
  {
    emoji: "📈",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    reason: "You've read System Design content",
    score: "94% match",
    color: "#0d1f2d",
    accent: "#10d9a0",
  },
  {
    emoji: "🔬",
    title: "Pattern Recognition & Machine Learning",
    author: "Christopher Bishop",
    reason: "Complements your ML track",
    score: "91% match",
    color: "#1a0d2e",
    accent: "#8b5cf6",
  },
  {
    emoji: "⚙️",
    title: "Software Engineering at Google",
    author: "Titus Winters",
    reason: "Popular among similar users",
    score: "88% match",
    color: "#1a1000",
    accent: "#ffb800",
  },
];

const INTERESTS = [
  ["AI/ML",               87],
  ["Software Engineering",65],
  ["Data Science",        72],
  ["System Design",       58],
  ["Algorithms",          44],
];

export default function Recommendations() {
  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="badge badge-emerald" style={{ marginBottom: 12 }}>✨ AI RECOMMENDATIONS</div>
        <h1 className="page-title">
          Books You'll <span className="gradient-text">Love</span>
        </h1>
        <p className="page-subtitle">
          // Personalized via collaborative filtering + reading history + career goals
        </p>
      </div>

      {/* ── Profile + career goal ── */}
      <div className="two-col" style={{ marginBottom: 28 }}>
        {/* Interest profile */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ fontSize: 15 }}>Your Interest Profile</div>
          {INTERESTS.map(([topic, pct]) => (
            <div key={topic} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span>{topic}</span>
                <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, var(--cyan), #0066ff)",
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Career goal */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ fontSize: 15 }}>Career Goal</div>
          <div
            style={{
              padding: "12px 16px",
              background: "var(--cyan-dim)",
              border: "1px solid var(--cyan)",
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--cyan)" }}>AI/ML Engineer</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Target: Senior level in 18 months
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Your recommendations are optimized for the AI/ML engineering track. Books are sequenced to
            build skills progressively.
          </div>
          <button className="btn-ghost" style={{ marginTop: 16, width: "100%", fontSize: 13 }}>
            Change Career Goal →
          </button>
        </div>
      </div>

      {/* ── Recommended list ── */}
      <div className="section-title">Recommended For You</div>
      {RECS.map((r, i) => (
        <div
          key={i}
          className="glass"
          style={{ padding: 20, marginBottom: 14, cursor: "pointer", transition: "all 0.3s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-bright)";
            e.currentTarget.style.transform = "translateX(4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.transform = "";
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 56, height: 72, borderRadius: 10,
                background: `linear-gradient(135deg, ${r.color}, ${r.accent}33)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, flexShrink: 0,
              }}
            >
              {r.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{r.title}</div>
                <div className="badge badge-emerald">{r.score}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{r.author}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ color: r.accent }}>💡 </span>
                {r.reason}
              </div>
            </div>
            <button className="btn-primary" style={{ padding: "10px 20px", flexShrink: 0 }}>
              Add to Library
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
