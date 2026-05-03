from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "ai_student_db"

    class Config:
        env_file = ".env"

settings = Settings()
