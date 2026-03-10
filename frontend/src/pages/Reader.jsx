import { useState } from "react";
import { BOOKS } from "../data/books";

const KEY_POINTS = [
  "Backpropagation enables efficient computation of gradients through the chain rule",
  "Deep learning models learn hierarchical representations from raw data",
  "Regularization techniques like dropout prevent overfitting in deep networks",
  "Convolutional layers exploit spatial structure for image recognition tasks",
  "Batch normalization accelerates training and acts as a regularizer",
];

const CONCEPTS = [
  "Backpropagation", "Gradient Descent", "Dropout",
  "Batch Norm", "CNN", "ReLU",
  "Overfitting", "Regularization", "Learning Rate",
];

const EXAM_QUESTIONS = [
  "Explain the vanishing gradient problem and how ReLU addresses it.",
  "What is the difference between batch, mini-batch, and stochastic gradient descent?",
  "Describe the architecture of a standard CNN used for image classification.",
  "How does dropout regularization work during training vs. inference?",
];

const TABS = [
  { id: "summary",  label: "📝 Summary"   },
  { id: "keypoints",label: "⚡ Key Points" },
  { id: "concepts", label: "🧩 Concepts"  },
  { id: "examprep", label: "📋 Exam Prep" },
];

export default function Reader({ book }) {
  const b = book || BOOKS[0];
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="page fade-up">
      {/* ── Book header ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <div
          style={{
            width: 44, height: 56, borderRadius: 8,
            background: `linear-gradient(135deg, ${b.color}, ${b.accent}33)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}
        >
          {b.emoji}
        </div>
        <div>
          <div className="badge badge-amber" style={{ marginBottom: 4 }}>📖 BOOK READER</div>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 2 }}>{b.title}</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {b.author} · {b.pages} pages · Chapter {b.chapter}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Summary ── */}
      {activeTab === "summary" && (
        <div className="fade-up">
          <div className="summary-block">
            <div className="summary-block-title">📝 AI SUMMARY — Chapter {b.chapter}</div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)" }}>
              This chapter explores the mathematical foundations of deep neural networks, focusing on how
              multilayer architectures learn increasingly abstract representations. The authors rigorously
              develop the theory of universal approximation, showing how deep networks can represent
              complex functions that shallow networks cannot express efficiently.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)", marginTop: 12 }}>
              Key innovations introduced include batch normalization for training stability, dropout as a
              computationally cheap ensemble method, and architectural patterns that have become standard
              in modern deep learning systems.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              ["Reading Level", "Advanced", "🎓"],
              ["Estimated Time", "45 min",  "⏱️"],
              ["AI Confidence",  "97%",     "✨"],
            ].map(([label, value, icon]) => (
              <div key={label} className="glass" style={{ flex: 1, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Key Points ── */}
      {activeTab === "keypoints" && (
        <div className="fade-up">
          {KEY_POINTS.map((pt, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--cyan-dim)", border: "1px solid var(--cyan)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--cyan)", flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, paddingTop: 4 }}>{pt}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Concepts ── */}
      {activeTab === "concepts" && (
        <div className="fade-up">
          <div className="three-col">
            {CONCEPTS.map((c, i) => (
              <div
                key={i}
                className="glass"
                style={{ padding: 16, textAlign: "center", cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cyan)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
              >
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan)", marginBottom: 6 }}>
                  CONCEPT {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Exam Prep ── */}
      {activeTab === "examprep" && (
        <div className="fade-up">
          <div className="summary-block" style={{ marginBottom: 20 }}>
            <div className="summary-block-title">🎯 AI-GENERATED EXAM QUESTIONS</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Generated based on chapter content and common exam patterns
            </p>
          </div>
          {EXAM_QUESTIONS.map((q, i) => (
            <div key={i} className="glass" style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="badge badge-violet" style={{ flexShrink: 0 }}>Q{i + 1}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{q}</div>
              </div>
              <button className="btn-ghost" style={{ marginTop: 12, fontSize: 12 }}>
                Show AI Answer →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
