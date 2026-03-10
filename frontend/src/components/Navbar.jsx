// ── Navbar ────────────────────────────────────────────────────
// Fixed top navigation bar used inside the app shell.
// Props: activePage, onNavigate, onLogoClick

const NAV_LINKS = [
  { id: "dashboard",    label: "Dashboard" },
  { id: "library",      label: "Library" },
  { id: "chat",         label: "AI Chat" },
  { id: "analytics",    label: "Analytics" },
  { id: "architecture", label: "Architecture" },
];

export default function Navbar({ activePage, onNavigate, onLogoClick }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <div className="logo" style={{ cursor: "pointer" }} onClick={onLogoClick}>
          <div className="logo-icon">⬡</div>
          Knowledge<span style={{ color: "var(--cyan)" }}>AI</span>
        </div>

        {/* Links */}
        <ul className="nav-links">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <button
                className={`nav-link ${activePage === id ? "active" : ""}`}
                onClick={() => onNavigate(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* User badge */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--amber), #ff6b00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            👤
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Alex Chen</div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Pro Plan
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
