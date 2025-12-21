from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./alsakr.db"
    QDRANT_HOST: str = "http://localhost:6333"
    OLLAMA_HOST: str = "http://localhost:11434"
    JWT_SECRET: str = "secret"
    
    class Config:
        env_file = ".env"

settings = Settings()
