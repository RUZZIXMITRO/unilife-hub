import motor.motor_asyncio
from app.config import settings

client: motor.motor_asyncio.AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]
    print(f"Connected to MongoDB: {settings.mongodb_db}")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db