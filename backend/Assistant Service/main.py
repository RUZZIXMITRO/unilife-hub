from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_fastapi_instrumentator import Instrumentator
from app.database import connect_db, close_db
from app.routers import chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="UniLife Hub - AI Student Assistant",
    description="Assistant IA pour les étudiants — powered by Groq LLaMA",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(chat.router, prefix="/api/assistant", tags=["AI Student Assistant"])

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-student-assistant"}
