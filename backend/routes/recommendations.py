# ============================================================
# Recommendations Routes
# ============================================================

from fastapi import APIRouter, Depends
from database import get_db
from routes.auth import get_current_user
from services.recommendation import get_recommendations

router = APIRouter()


@router.get("/")
async def recommendations(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    results = await get_recommendations(current_user, db)
    return {"recommendations": results, "total": len(results)}


@router.get("/career-roadmap")
async def career_roadmap(
    career: str = "ai_engineer",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Return book-backed step-by-step roadmap for a career goal."""
    from services.recommendation import get_career_roadmap
    roadmap = get_career_roadmap(career)
    return {"career": career, "roadmap": roadmap}
