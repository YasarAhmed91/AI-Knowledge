export const CAREER_PATHS = [
  { id: "ai_engineer",    label: "AI/ML Engineer",   icon: "🤖" },
  { id: "web_dev",        label: "Full-Stack Dev",    icon: "🌐" },
  { id: "data_scientist", label: "Data Scientist",    icon: "📊" },
  { id: "cloud_architect",label: "Cloud Architect",   icon: "☁️" },
  { id: "cybersecurity",  label: "Cybersecurity",     icon: "🔐" },
  { id: "mobile_dev",     label: "Mobile Dev",        icon: "📱" },
];

export const ROADMAP_STEPS = {
  ai_engineer: [
    {
      title: "Python Foundations",
      desc: "Master Python, NumPy, Pandas. Build data manipulation skills.",
      books: ["Python for Data Analysis"],
      weeks: "Weeks 1-4",
    },
    {
      title: "Mathematics for ML",
      desc: "Linear algebra, calculus, probability — the backbone of AI.",
      books: ["CLRS Algorithms"],
      weeks: "Weeks 5-8",
    },
    {
      title: "Machine Learning Core",
      desc: "Supervised/unsupervised learning, sklearn, feature engineering.",
      books: ["Hands-on ML"],
      weeks: "Weeks 9-14",
    },
    {
      title: "Deep Learning",
      desc: "Neural networks, CNNs, RNNs, Transformers, PyTorch.",
      books: ["Deep Learning"],
      weeks: "Weeks 15-22",
    },
    {
      title: "MLOps & Deployment",
      desc: "Docker, FastAPI, model serving, monitoring, CI/CD.",
      books: ["System Design Interview"],
      weeks: "Weeks 23-28",
    },
    {
      title: "Build Portfolio",
      desc: "3 end-to-end projects: NLP, Vision, Recommendation System.",
      books: [],
      weeks: "Weeks 29-36",
    },
  ],
};
