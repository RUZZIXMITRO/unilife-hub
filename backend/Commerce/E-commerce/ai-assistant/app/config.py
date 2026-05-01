from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    groq_api_key: str = ""
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "ai_assistant_db"
    catalog_service_url: str = "http://localhost:8081"
    port: int = 8090

    class Config:
        env_file = ".env"

settings = Settings()