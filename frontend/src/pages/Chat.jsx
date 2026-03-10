import { useState, useEffect, useRef } from "react";
import ChatMessage from "../components/ChatMessage";
import { BOOKS } from "../data/books";
import { chatAPI } from "../api/api";

const SUGGESTED = [
  "Explain Chapter 4 simply",
  "Give me 5 exam questions",
  "What are the main concepts?",
  "Compare CNN vs RNN",
];

export default function Chat({ book }) {
  const b = book || BOOKS[0];

  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! Ask me anything about this book." },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setInput("");

    setMessages((m) => [...m, { role: "user", content: msg }]);
    setTyping(true);

    try {
      const res = await chatAPI.ask(b.id, msg);

      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: res.answer || "No response from AI.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "ai", content: "⚠️ AI request failed." },
      ]);
    }

    setTyping(false);
  };

  return (
    <div className="page fade-up" style={{ padding: 0, maxWidth: "100%" }}>
      
      {/* Header */}
      <div
        style={{
          padding: "24px 40px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 52,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${b.color}, ${b.accent}33)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {b.emoji}
        </div>

        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-cyan">💬 ASK-THE-BOOK AI</span>
            <span className="badge badge-emerald">RAG Active</span>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
            {b.title}
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div
        style={{
          padding: "12px 40px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {SUGGESTED.map((s, i) => (
          <button
            key={i}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "6px 14px" }}
            onClick={() => sendMessage(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {typing && (
          <div className="chat-message ai">
            <div className="chat-avatar avatar-ai">🤖</div>
            <div className="chat-bubble bubble-ai">
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Ask anything about this book..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
        />

        <button className="chat-send" onClick={() => sendMessage()}>
          ➤
        </button>
      </div>
    </div>
  );
}