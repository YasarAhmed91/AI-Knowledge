// ── StatCard ──────────────────────────────────────────────────
// Reusable metric card with sparkline mini-chart.
// Props: label, value, icon, color, delay (animation delay index)

export default function StatCard({ label, value, icon, color, delay = 0 }) {
  const sparkHeights = [40, 60, 45, 80, 70, 90, 65, 75];

  return (
    <div
      className="glass stat-card fade-up"
      style={{ "--accent-color": color, animationDelay: `${delay * 0.1}s` }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="mini-chart" style={{ marginTop: 12 }}>
        {sparkHeights.map((h, i) => (
          <div
            key={i}
            className={`mini-bar ${i === sparkHeights.length - 1 ? "peak" : ""}`}
            style={{ height: `${h}%`, background: color }}
          />
        ))}
      </div>
    </div>
  );
}
