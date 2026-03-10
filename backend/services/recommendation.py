# ============================================================
# Recommendation Engine — Tag-based + career-aware
# ============================================================

from typing import List, Dict
from bson import ObjectId


# Curated catalog for recommendations (in production, this is a MongoDB collection)
CATALOG = [
    {"title": "Hands-On Machine Learning", "author": "Aurélien Géron", "tags": ["ML", "Python", "AI"], "emoji": "🤗", "color": "#0d1f3f", "accent": "#00c8ff"},
    {"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "tags": ["Systems", "Data"], "emoji": "📈", "color": "#0d1f2d", "accent": "#10d9a0"},
    {"title": "Pattern Recognition & Machine Learning", "author": "Christopher Bishop", "tags": ["ML", "AI", "Math"], "emoji": "🔬", "color": "#1a0d2e", "accent": "#8b5cf6"},
    {"title": "Software Engineering at Google", "author": "Titus Winters", "tags": ["Software", "Engineering"], "emoji": "⚙️", "color": "#1a1000", "accent": "#ffb800"},
    {"title": "The Algorithm Design Manual", "author": "Steven Skiena", "tags": ["CS", "Algorithms"], "emoji": "📐", "color": "#0d2010", "accent": "#10d9a0"},
    {"title": "Natural Language Processing with Python", "author": "Bird, Klein & Loper", "tags": ["NLP", "Python", "AI"], "emoji": "🗣️", "color": "#1a0010", "accent": "#ff6b6b"},
    {"title": "Kubernetes Up and Running", "author": "Burns et al.", "tags": ["DevOps", "Cloud"], "emoji": "☁️", "color": "#0a1520", "accent": "#00c8ff"},
    {"title": "The Pragmatic Programmer", "author": "Hunt & Thomas", "tags": ["Software", "Best Practices"], "emoji": "🔧", "color": "#0d1f2d", "accent": "#10d9a0"},
    {"title": "Mathematics for Machine Learning", "author": "Deisenroth et al.", "tags": ["Math", "ML", "AI"], "emoji": "∑", "color": "#1a0d2e", "accent": "#8b5cf6"},
    {"title": "Building Microservices", "author": "Sam Newman", "tags": ["Systems", "Architecture"], "emoji": "🏗️", "color": "#0d1f2d", "accent": "#ffb800"},
]

CAREER_ROADMAPS = {
    "ai_engineer": [
        {"title": "Python Foundations", "desc": "Master Python, NumPy, Pandas", "weeks": "Weeks 1-4", "books": ["Python for Data Analysis"]},
        {"title": "Mathematics for ML", "desc": "Linear algebra, calculus, probability", "weeks": "Weeks 5-8", "books": ["Mathematics for Machine Learning"]},
        {"title": "Machine Learning Core", "desc": "Supervised/unsupervised learning, sklearn", "weeks": "Weeks 9-14", "books": ["Hands-On Machine Learning"]},
        {"title": "Deep Learning", "desc": "Neural networks, CNNs, Transformers, PyTorch", "weeks": "Weeks 15-22", "books": ["Deep Learning"]},
        {"title": "MLOps & Deployment", "desc": "Docker, FastAPI, model serving", "weeks": "Weeks 23-28", "books": ["Designing Data-Intensive Applications"]},
        {"title": "Build Portfolio", "desc": "3 end-to-end projects: NLP, Vision, RecSys", "weeks": "Weeks 29-36", "books": []},
    ],
    "web_dev": [
        {"title": "HTML/CSS/JS Foundations", "desc": "The trio of the web", "weeks": "Weeks 1-3", "books": []},
        {"title": "React & Next.js", "desc": "Modern frontend development", "weeks": "Weeks 4-8", "books": []},
        {"title": "Backend with Node/Python", "desc": "REST APIs, databases", "weeks": "Weeks 9-14", "books": ["Clean Code"]},
        {"title": "System Design", "desc": "Scalability, caching, queues", "weeks": "Weeks 15-20", "books": ["System Design Interview"]},
        {"title": "DevOps Basics", "desc": "Docker, CI/CD, cloud deployment", "weeks": "Weeks 21-26", "books": ["Kubernetes Up and Running"]},
        {"title": "Full Project", "desc": "Build and ship a production SaaS", "weeks": "Weeks 27-32", "books": []},
    ],
    "data_scientist": [
        {"title": "Python + Statistics", "desc": "Python, pandas, scipy, stats", "weeks": "Weeks 1-5", "books": ["Python for Data Analysis"]},
        {"title": "Exploratory Analysis", "desc": "Visualization, hypothesis testing", "weeks": "Weeks 6-10", "books": []},
        {"title": "Machine Learning", "desc": "Regression, classification, clustering", "weeks": "Weeks 11-18", "books": ["Hands-On Machine Learning"]},
        {"title": "Advanced ML + DL", "desc": "Ensemble methods, neural networks", "weeks": "Weeks 19-26", "books": ["Pattern Recognition & Machine Learning"]},
        {"title": "Big Data Tools", "desc": "Spark, data pipelines, warehousing", "weeks": "Weeks 27-32", "books": ["Designing Data-Intensive Applications"]},
    ],
}


async def get_recommendations(user: dict, db) -> List[Dict]:
    """
    Recommend books not already in user library.
    Strategy: tag overlap with user's existing books + career goal.
    """
    # Get user's existing book tags
    cursor = db.books.find({"user_id": user["_id"]}, {"tags": 1, "title": 1})
    owned = await cursor.to_list(100)
    owned_titles = {b["title"].lower() for b in owned}

    # Count tag frequency from user's library
    tag_freq: Dict[str, int] = {}
    for b in owned:
        for tag in b.get("tags", []):
            tag_freq[tag] = tag_freq.get(tag, 0) + 1

    # Career goal tags
    career_tag_map = {
        "ai_engineer":    ["AI", "ML", "Python", "Deep Learning"],
        "web_dev":        ["JavaScript", "React", "Software", "Systems"],
        "data_scientist": ["Python", "Data", "ML", "Math"],
        "cloud_architect":["Cloud", "DevOps", "Systems", "Architecture"],
        "cybersecurity":  ["Security", "Networking", "Systems"],
        "mobile_dev":     ["Mobile", "Swift", "Kotlin", "React"],
    }
    career = user.get("career_goal", "general")
    career_tags = career_tag_map.get(career, [])

    # Score each catalog item
    scored = []
    for item in CATALOG:
        if item["title"].lower() in owned_titles:
            continue   # already owned

        score = 0.0
        for tag in item["tags"]:
            if tag in career_tags:
                score += 2.0     # career match = high weight
            if tag in tag_freq:
                score += tag_freq[tag] * 0.5

        if score > 0:
            reason = _generate_reason(item, career_tags, tag_freq)
            scored.append({**item, "match_score": round(min(score / 6 * 100, 99), 1), "reason": reason})

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:6]


def _generate_reason(item: dict, career_tags: list, tag_freq: dict) -> str:
    overlap_career = [t for t in item["tags"] if t in career_tags]
    overlap_lib    = [t for t in item["tags"] if t in tag_freq]

    if overlap_career:
        return f"Matches your career goal — covers {', '.join(overlap_career[:2])}"
    if overlap_lib:
        return f"Complements your reading in {', '.join(overlap_lib[:2])}"
    return "Popular among learners with similar interests"


def get_career_roadmap(career: str) -> List[Dict]:
    return CAREER_ROADMAPS.get(career, CAREER_ROADMAPS["ai_engineer"])
