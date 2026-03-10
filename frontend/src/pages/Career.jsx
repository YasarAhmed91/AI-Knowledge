import { useState } from "react";
import { CAREER_PATHS, ROADMAP_STEPS } from "../data/careerPaths";

const METRICS = [
  { value: "36", label: "weeks total",          color: "var(--amber)"  },
  { value: "6",  label: "phases",               color: "var(--cyan)"   },
  { value: "12", label: "recommended books",    color: "var(--emerald)"},
  { value: "3",  label: "portfolio projects",   color: "var(--violet)" },
];

export default function Career() {
  const [selected, setSelected] = useState("ai_engineer");
  const steps = ROADMAP_STEPS[selected] || ROADMAP_STEPS.ai_engineer;

  return (
    <div className="page fade-up">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="badge badge-amber" style={{ marginBottom: 12 }}>🎯 CAREER PATH GENERATOR</div>
        <h1 className="page-title">
          Your Learning <span className="gradient-text">Roadmap</span>
        </h1>
        <p className="page-subtitle">
          // AI-curated step-by-step curriculum with book recommendations
        </p>
      </div>

      {/* ── Career selector ── */}
      <div className="glass" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Select your career goal:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {CAREER_PATHS.map((cp) => (
            <button
              key={cp.id}
              className={`career-chip ${selected === cp.id ? "selected" : ""}`}
              onClick={() => setSelected(cp.id)}
            >
              {cp.icon} {cp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metrics row ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, alignItems: "center" }}>
        {METRICS.map(({ value, label, color }) => (
          <div key={label} className="glass" style={{ flex: 1, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Roadmap steps ── */}
      <div className="section-title">Step-by-Step Roadmap</div>
      <div style={{ paddingLeft: 8 }}>
        {steps.map((step, i) => (
          <div
            key={i}
            className="roadmap-step fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="step-number">{i + 1}</div>
            <div className="step-content">
              <div className="glass" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div className="step-title">{step.title}</div>
                  <div className="badge badge-amber" style={{ fontSize: 10 }}>{step.weeks}</div>
                </div>
                <div className="step-desc">{step.desc}</div>
                {step.books.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {step.books.map((b) => (
                      <span key={b} className="badge badge-cyan">📚 {b}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <button className="btn-amber" style={{ width: "100%", padding: "16px" }}>
          🚀 Start This Roadmap — Add Books to Library
        </button>
      </div>
    </div>
  );
}
