// ============================================================
// API CLIENT
// Replace BASE_URL and implement each function to call your
// FastAPI backend. Currently returns mock data so the UI
// works out-of-the-box without a running server.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── helpers ───────────────────────────────────────────────────
const getToken = () => localStorage.getItem("knav_token");

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: async (data) => {
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // automatically login after register
  const res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (res.access_token) {
    localStorage.setItem("knav_token", res.access_token);
  }

  return res;
},
  login: async (data) => {
  const res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res.access_token) {
    localStorage.setItem("knav_token", res.access_token);
  }

  return res;
},
  me: () => request("/api/auth/me"),
};

// ── Books ─────────────────────────────────────────────────────
export const booksAPI = {
  list: () => request("/api/books"),
  get: (id) => request(`/api/books/${id}`),
  upload: async (formData) => {
  const res = await fetch(`${BASE_URL}/api/books/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();
},
  summary: (id) => request(`/api/books/${id}/summary`),
  updateProgress: (id, data) =>
    request(`/api/books/${id}/progress`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/api/books/${id}`, { method: "DELETE" }),
};

// ── Chat ─────────────────────────────────────────────────────
export const chatAPI = {
  ask: (bookId, question) =>
    request(`/api/chat/${bookId}`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  history: (bookId) => request(`/api/chat/${bookId}/history`),
};

// ── Search ────────────────────────────────────────────────────
export const searchAPI = {
  semantic: (query, topK = 5) =>
    request("/api/search/semantic", {
      method: "POST",
      body: JSON.stringify({ query, top_k: topK }),
    }),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  dashboard: () => request("/api/analytics/dashboard"),
};

// ── Recommendations ───────────────────────────────────────────
export const recommendationsAPI = {
  get: () => request("/api/recommendations"),
  careerRoadmap: (career) =>
    request("/api/career/roadmap", {
      method: "POST",
      body: JSON.stringify({ career }),
    }),
};
