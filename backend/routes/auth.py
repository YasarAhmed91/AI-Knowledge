# ============================================================
# Auth Routes — Register, Login, Me
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from bson import ObjectId
import os

from database import get_db
from models import UserRegister, UserLogin, TokenResponse

router = APIRouter()
bearer = HTTPBearer()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY  = os.getenv("JWT_SECRET", "super-secret-change-in-production")
ALGORITHM   = "HS256"
TOKEN_EXPIRE = 60 * 24 * 7   # 7 days (minutes)


# ── Helpers ───────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── Routes ────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserRegister, db = Depends(get_db)):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name":          payload.name,
        "email":         payload.email,
        "password_hash": hash_password(payload.password),
        "career_goal":   payload.career_goal,
        "interests":     [],
        "created_at":    datetime.utcnow(),
        "last_active":   datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    token = create_token(str(result.inserted_id))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":           str(result.inserted_id),
            "name":         payload.name,
            "email":        payload.email,
            "career_goal":  payload.career_goal,
        },
    }


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db = Depends(get_db)):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Update last active
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_active": datetime.utcnow()}})
    token = create_token(str(user["_id"]))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":          str(user["_id"]),
            "name":        user["name"],
            "email":       user["email"],
            "career_goal": user.get("career_goal", "general"),
        },
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id":          str(current_user["_id"]),
        "name":        current_user["name"],
        "email":       current_user["email"],
        "career_goal": current_user.get("career_goal", "general"),
        "interests":   current_user.get("interests", []),
        "created_at":  current_user.get("created_at"),
    }


@router.put("/me")
async def update_me(
    updates: dict,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    allowed = {"name", "career_goal", "interests"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed}
    if safe_updates:
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": safe_updates})
    return {"message": "Profile updated"}
