import { useState } from "react";

import Navbar   from "./components/Navbar";
import Sidebar  from "./components/Sidebar";

import Landing        from "./pages/Landing";
import Dashboard      from "./pages/Dashboard";
import Library        from "./pages/Library";
import Reader         from "./pages/Reader";
import Chat           from "./pages/Chat";
import Search         from "./pages/Search";
import Recommendations from "./pages/Recommendations";
import Career         from "./pages/Career";
import Analytics      from "./pages/Analytics";
import Architecture   from "./pages/Architecture";

// ── page renderer ─────────────────────────────────────────────
function renderPage(activePage, selectedBook, onSelectBook) {
  switch (activePage) {
    case "dashboard":      return <Dashboard />;
    case "library":        return <Library onSelectBook={onSelectBook} />;
    case "reader":         return <Reader book={selectedBook} />;
    case "chat":           return <Chat book={selectedBook} />;
    case "search":         return <Search />;
    case "recommendations":return <Recommendations />;
    case "career":         return <Career />;
    case "analytics":      return <Analytics />;
    case "architecture":   return <Architecture />;
    default:               return <Dashboard />;
  }
}

export default function App() {
  const [view, setView] = useState(
  localStorage.getItem("knav_token") ? "app" : "landing"
);  // "landing" | "app"
  const [activePage, setActivePage]   = useState("dashboard");
  const [selectedBook, setSelectedBook] = useState(null);

  // ── handlers ──
  const handleEnterApp = () => {
    setView("app");
    setActivePage("dashboard");
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setActivePage("reader");
  };

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
  };

  // ── Landing page ──────────────────────────────────────────
  if (view === "landing") {
    return (
      <div className="noise">
        <Landing onEnterApp={handleEnterApp} />
      </div>
    );
  }

  // ── App shell ─────────────────────────────────────────────
  return (
    <div className="noise">
      <div className="grid-overlay" />

      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogoClick={() => setView("landing")}
      />

      <Sidebar active={activePage} onNavigate={handleNavigate} />

      <main className="main">
        {renderPage(activePage, selectedBook, handleSelectBook)}
      </main>
    </div>
  );
}
