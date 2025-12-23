from decouple import config
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Default to sqlite if not provided, but favor postgres for production
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./data/nexus.db")
    SECRET_KEY: str = config("SECRET_KEY", default="supersecretkey_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Cors Origins
    BACKEND_CORS_ORIGINS: list = ["*"]

    # Internationalization
    SUPPORTED_LANGUAGES: list = ['en', 'ar']
    
    # Qdrant
    QDRANT_HOST: str = config("QDRANT_HOST", default="localhost")
    QDRANT_PORT: int = config("QDRANT_PORT", default=6333, cast=int)
    
    # AI / Ollama
    OLLAMA_HOST: str = config("OLLAMA_HOST", default="http://localhost:11434")

settings = Settings()
