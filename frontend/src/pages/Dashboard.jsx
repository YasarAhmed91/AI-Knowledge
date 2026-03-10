import StatCard from "../components/StatCard";
import { BOOKS } from "../data/books";

const STATS = [
  { label: "Books Read",        value: "24",  icon: "📚", color: "var(--cyan)"   },
  { label: "AI Queries",        value: "318", icon: "💬", color: "var(--amber)"  },
  { label: "Study Hours",       value: "142", icon: "⏱️", color: "var(--emerald)"},
  { label: "Concepts Learned",  value: "890", icon: "🧠", color: "var(--violet)" },
];

const WEEK_BARS = [
  ["Mon", 60], ["Tue", 80], ["Wed", 45],
  ["Thu", 90], ["Fri", 75], ["Sat", 95], ["Sun", 70],
];

const INSIGHTS = [
  ["Top Topic",    "Deep Learning", "var(--cyan)"   ],
  ["Avg Session",  "47 min",        "var(--amber)"  ],
  ["This Week",    "5h 22m",        "var(--emerald)"],
];

export default function Dashboard() {
  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: 12 }}>⬡ DASHBOARD</div>
            <h1 className="page-title">
              Good morning, <span className="gradient-text">Alex.</span>
            </h1>
            <p className="page-subtitle">// You're on a 12-day streak · Last session: 2h 14m ago</p>
          </div>
          <button className="btn-primary" style={{ marginTop: 8 }}>+ Upload Book</button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        {STATS.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} icon={s.icon} color={s.color} delay={i} />
        ))}
      </div>

      {/* ── Two-column row ── */}
      <div className="two-col" style={{ marginBottom: 28 }}>
        {/* Continue Reading */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ fontSize: 15 }}>Continue Reading</div>
          {BOOKS.slice(0, 3).map((book) => (
            <div key={book.id} className="rec-card">
              <div className="rec-cover" style={{ background: book.color }}>
                {book.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{book.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  {book.author}
                </div>
                <div className="book-progress-bar">
                  <div
                    className="book-progress-fill"
                    style={{
                      width: `${book.progress}%`,
                      background: `linear-gradient(90deg, ${book.accent}, ${book.accent}88)`,
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Ch. {book.chapter}
                  </span>
                  <span style={{ fontSize: 11, color: book.accent, fontFamily: "var(--font-mono)" }}>
                    {book.progress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Activity */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ fontSize: 15 }}>Weekly Study Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {WEEK_BARS.map(([day, val]) => (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {day}
                </div>
                <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${val}%`,
                      background: "linear-gradient(90deg, var(--cyan), #0066ff)",
                      borderRadius: 4,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
                <div style={{ width: 32, fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", textAlign: "right" }}>
                  {val}m
                </div>
              </div>
            ))}
          </div>

          <div className="glow-sep" style={{ margin: "16px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {INSIGHTS.map(([label, value, color]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Insight ── */}
      <div className="glass" style={{ padding: 24 }}>
        <div className="section-title" style={{ fontSize: 15 }}>AI Insight of the Day</div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, var(--cyan), #0066ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              Based on your reading patterns, you spend{" "}
              <span style={{ color: "var(--amber)", fontWeight: 700 }}>73% of time</span> on AI/ML topics.
              Your next milestone is completing{" "}
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>
                Deep Learning Chapter 14 (Autoencoders)
              </span>
              . After that, I recommend <em>"Attention is All You Need"</em> paper to prepare you for
              Transformer architectures.
            </div>
            <div className="badge badge-cyan">💡 Personalized Insight</div>
          </div>
        </div>
      </div>
    </div>
  );
}
