import StatCard from "../components/StatCard";

const STATS = [
  { label: "Total Study Time", value: "142h", icon: "⏱️", color: "var(--cyan)"   },
  { label: "Books Completed",  value: "8",    icon: "✅", color: "var(--amber)"  },
  { label: "30-Day Streak",    value: "12d",  icon: "🔥", color: "var(--emerald)"},
  { label: "Avg Daily",        value: "47m",  icon: "📅", color: "var(--violet)" },
];

const BAR_DATA = [
  { label: "Jan", val: 60 },
  { label: "Feb", val: 80 },
  { label: "Mar", val: 55 },
  { label: "Apr", val: 90 },
  { label: "May", val: 75 },
  { label: "Jun", val: 95 },
];

const TOPICS = [
  { topic: "Deep Learning",  hours: 42, color: "var(--cyan)"   },
  { topic: "Python",         hours: 28, color: "var(--amber)"  },
  { topic: "Algorithms",     hours: 19, color: "var(--violet)" },
  { topic: "System Design",  hours: 15, color: "var(--emerald)"},
  { topic: "Clean Code",     hours: 11, color: "#ff6b6b"       },
];

const INSIGHTS = [
  {
    icon: "🎯",
    title: "Consistency Score",
    val: "87/100",
    desc: "You study most consistently on weekday evenings. Keep it up!",
    color: "var(--cyan)",
  },
  {
    icon: "📈",
    title: "Growth Trajectory",
    val: "+34%",
    desc: "Your reading speed increased 34% in the last month.",
    color: "var(--emerald)",
  },
  {
    icon: "⚡",
    title: "Focus Quality",
    val: "High",
    desc: "Average 47-minute uninterrupted sessions. Excellent depth.",
    color: "var(--amber)",
  },
  {
    icon: "🧠",
    title: "Concept Retention",
    val: "92%",
    desc: "Based on AI quiz performance across reviewed chapters.",
    color: "var(--violet)",
  },
];

// Generate heatmap data (182 cells, random values)
const FLAT_HEAT = Array.from({ length: 182 }, () => Math.random());

function heatColor(v) {
  if (v < 0.1)  return "var(--panel)";
  if (v < 0.3)  return "rgba(0,200,255,0.15)";
  if (v < 0.6)  return "rgba(0,200,255,0.4)";
  if (v < 0.85) return "rgba(0,200,255,0.7)";
  return "var(--cyan)";
}

export default function Analytics() {
  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="badge badge-violet" style={{ marginBottom: 12 }}>📈 ANALYTICS DASHBOARD</div>
        <h1 className="page-title">
          Learning <span className="gradient-text">Intelligence</span>
        </h1>
        <p className="page-subtitle">// Your knowledge growth, visualized</p>
      </div>

      {/* ── Stat cards (no sparklines on analytics page) ── */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <div key={i} className="glass stat-card" style={{ "--accent-color": s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Bar chart + Topic distribution ── */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Monthly bar chart */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ fontSize: 15 }}>Monthly Study Hours</div>
          <div className="bar-chart" style={{ height: 120 }}>
            {BAR_DATA.map((b, i) => (
              <div
                key={i}
                className="tooltip"
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
              >
                <div
                  className="bar"
                  style={{
                    height: `${b.val}%`,
                    background: "linear-gradient(to top, var(--cyan), #0066ff)",
                    width: "100%",
                  }}
                />
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {b.label}
                </div>
                <div className="tooltip-text">{b.val}h</div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic distribution */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ fontSize: 15 }}>Topic Distribution</div>
          {TOPICS.map((t, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5,
                }}
              >
                <span>{t.topic}</span>
                <span style={{ color: t.color, fontFamily: "var(--font-mono)" }}>{t.hours}h</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(t.hours / 42) * 100}%`,
                    background: t.color,
                    borderRadius: 3,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          Study Activity Heatmap (Last 6 months)
        </div>
        <div className="heatmap">
          {FLAT_HEAT.map((v, i) => (
            <div
              key={i}
              className="heatmap-cell"
              style={{ background: heatColor(v), border: "1px solid var(--border)" }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 12,
            fontSize: 11, color: "var(--text-muted)",
          }}
        >
          <span>Less</span>
          {[0.05, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <div
              key={i}
              style={{
                width: 14, height: 14, borderRadius: 2,
                background: `rgba(0,200,255,${v})`,
                border: "1px solid var(--border)",
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* ── AI Coach insights ── */}
      <div className="glass" style={{ padding: 24 }}>
        <div className="section-title" style={{ fontSize: 15 }}>AI Learning Coach Insights</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {INSIGHTS.map((ins, i) => (
            <div
              key={i}
              style={{
                padding: 16, background: "var(--panel)",
                borderRadius: 12, border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{ins.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ins.title}</div>
                  <div
                    style={{
                      fontSize: 20, fontWeight: 800,
                      color: ins.color, fontFamily: "var(--font-mono)",
                    }}
                  >
                    {ins.val}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {ins.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
