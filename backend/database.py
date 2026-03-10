# ============================================================
# Database — MongoDB via Motor (async)
# ============================================================

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "ai_knowledge_navigator")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.books.create_index("user_id")
    await db.books.create_index("tags")
    await db.chat_sessions.create_index([("user_id", 1), ("book_id", 1)])
    await db.analytics.create_index([("user_id", 1), ("date", -1)])
    print(f"📦 Connected to MongoDB: {DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()


def get_db():
    """Dependency — returns active DB instance."""
    return db
