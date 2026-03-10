// ── Sidebar ───────────────────────────────────────────────────
// Fixed left navigation panel.
// Props: active (current page id), onNavigate (fn)

const NAV_ITEMS = [
  { id: "dashboard",      icon: "⬡",  label: "Dashboard",       group: "nav" },
  { id: "library",        icon: "📚", label: "Smart Library",    group: "nav" },
  { id: "reader",         icon: "📖", label: "Book Reader",      group: "nav" },
  { id: "chat",           icon: "💬", label: "AI Chat",          group: "nav" },
  { id: "search",         icon: "🔍", label: "Semantic Search",  group: "nav" },
  { id: "recommendations",icon: "✨", label: "Recommendations",  group: "discovery" },
  { id: "career",         icon: "🎯", label: "Career Path",      group: "discovery" },
  { id: "analytics",      icon: "📈", label: "Analytics",        group: "discovery" },
  { id: "architecture",   icon: "🏗️", label: "Architecture",     group: "system" },
];

export default function Sidebar({ active, onNavigate }) {
  const navItems      = NAV_ITEMS.filter((i) => i.group === "nav");
  const discoveryItems = NAV_ITEMS.filter((i) => i.group === "discovery");
  const systemItems   = NAV_ITEMS.filter((i) => i.group === "system");

  const renderItem = (item) => (
    <button
      key={item.id}
      className={`sidebar-item ${active === item.id ? "active" : ""}`}
      onClick={() => onNavigate(item.id)}
    >
      <span className="icon">{item.icon}</span>
      {item.label}
    </button>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-section">Navigation</div>
      {navItems.map(renderItem)}

      <div className="sidebar-section">Discovery</div>
      {discoveryItems.map(renderItem)}

      <div className="sidebar-section">System</div>
      {systemItems.map(renderItem)}

      {/* AI status pill */}
      <div style={{ marginTop: "auto", padding: "16px 12px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px",
            background: "rgba(0,200,255,0.06)",
            borderRadius: 10,
            border: "1px solid rgba(0,200,255,0.12)",
          }}
        >
          <div className="status-dot online" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>AI Online</div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              GPT-4o · RAG Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
