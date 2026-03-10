// ── ChatMessage ───────────────────────────────────────────────
// Renders a single chat bubble (ai or user).
// Props: role ("ai" | "user"), content (string with **bold** markdown)

function formatMsg(text) {
  return text.split("\n").map((line, i) => {
    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:var(--text-primary)">$1</strong>`)
      .replace(/\*(.*?)\*/g, `<em style="color:var(--text-muted)">$1</em>`);
    return (
      <div key={i} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />
    );
  });
}

export default function ChatMessage({ role, content }) {
  const isAi = role === "ai";

  return (
    <div className={`chat-message ${role}`}>
      <div className={`chat-avatar ${isAi ? "avatar-ai" : "avatar-user"}`}>
        {isAi ? "🤖" : "👤"}
      </div>
      <div className={`chat-bubble ${isAi ? "bubble-ai" : "bubble-user"}`}>
        {formatMsg(content)}
      </div>
    </div>
  );
}
