# ============================================================
# Analytics Routes — Dashboard data
# ============================================================

from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from collections import defaultdict

from database import get_db
from routes.auth import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    user_id = current_user["_id"]

    # ── Core stats ────────────────────────────────────────────
    # Total study time (all-time)
    pipeline_total = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$study_minutes"}, "queries": {"$sum": "$queries_made"}}},
    ]
    total_cursor = db.analytics.aggregate(pipeline_total)
    total_data = await total_cursor.to_list(1)
    total_minutes = total_data[0]["total"] if total_data else 0
    total_queries = total_data[0]["queries"] if total_data else 0

    # Books completed
    books_completed = await db.books.count_documents({"user_id": user_id, "progress": {"$gte": 100}})

    # Current streak
    streak = await _calculate_streak(db, user_id)

    # ── Weekly activity (last 7 days) ─────────────────────────
    weekly = []
    for i in range(6, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).date().isoformat()
        rec = await db.analytics.find_one({"user_id": user_id, "date": day})
        weekly.append({
            "date":    day,
            "minutes": rec["study_minutes"] if rec else 0,
            "queries": rec.get("queries_made", 0) if rec else 0,
        })

    # ── Monthly bars (last 6 months) ──────────────────────────
    monthly = []
    for i in range(5, -1, -1):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=30 * i))
        month_label = month_start.strftime("%b")
        # Simplified: sum all records in that month
        pipeline_month = [
            {"$match": {
                "user_id": user_id,
                "date": {"$regex": month_start.strftime("%Y-%m")},
            }},
            {"$group": {"_id": None, "total": {"$sum": "$study_minutes"}}},
        ]
        m_cursor = db.analytics.aggregate(pipeline_month)
        m_data = await m_cursor.to_list(1)
        monthly.append({"label": month_label, "minutes": m_data[0]["total"] if m_data else 0})

    # ── Topic distribution (from book tags) ───────────────────
    books_cursor = db.books.find({"user_id": user_id}, {"tags": 1, "progress": 1})
    books = await books_cursor.to_list(100)
    tag_counts = defaultdict(int)
    for b in books:
        weight = max(b.get("progress", 0) / 100, 0.1)
        for tag in b.get("tags", []):
            tag_counts[tag] += weight
    top_topics = sorted(
        [{"topic": k, "score": round(v, 1)} for k, v in tag_counts.items()],
        key=lambda x: x["score"], reverse=True
    )[:5]

    # ── Heatmap (last 26 weeks) ────────────────────────────────
    heatmap = []
    for i in range(182, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).date().isoformat()
        rec = await db.analytics.find_one({"user_id": user_id, "date": day}, {"study_minutes": 1})
        mins = rec["study_minutes"] if rec else 0
        heatmap.append({"date": day, "value": min(mins / 120, 1.0)})   # normalize to 0-1

    avg_daily = round(total_minutes / max(streak, 1), 1)

    return {
        "total_study_minutes": total_minutes,
        "books_completed":     books_completed,
        "current_streak_days": streak,
        "avg_daily_minutes":   avg_daily,
        "total_queries":       total_queries,
        "top_topics":          top_topics,
        "weekly_activity":     weekly,
        "monthly_activity":    monthly,
        "heatmap":             heatmap,
    }


async def _calculate_streak(db, user_id) -> int:
    streak = 0
    check_day = datetime.utcnow().date()
    for _ in range(365):
        day_str = check_day.isoformat()
        rec = await db.analytics.find_one(
            {"user_id": user_id, "date": day_str, "study_minutes": {"$gt": 0}}
        )
        if rec:
            streak += 1
            check_day -= timedelta(days=1)
        else:
            break
    return streak


@router.post("/log-session")
async def log_study_session(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Called by frontend when user closes a book reader."""
    book_id  = payload.get("book_id")
    minutes  = int(payload.get("minutes", 0))
    today    = datetime.utcnow().date().isoformat()

    update = {"$inc": {"study_minutes": minutes}, "$setOnInsert": {"created_at": datetime.utcnow()}}
    if book_id:
        update["$addToSet"] = {"books_accessed": ObjectId(book_id)}

    await db.analytics.update_one(
        {"user_id": current_user["_id"], "date": today},
        update,
        upsert=True,
    )
    return {"message": "Session logged"}
