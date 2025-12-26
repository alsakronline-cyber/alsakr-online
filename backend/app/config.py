from decouple import config
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Default to sqlite if not provided, but favor postgres for production
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./data/nexus.db")
    SECRET_KEY: str = config("JWT_SECRET", default="supersecretkey_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Cors Origins
    BACKEND_CORS_ORIGINS: list = ["*"]

    # Internationalization
    SUPPORTED_LANGUAGES: list = ['en', 'ar']
    
    # Qdrant
    QDRANT_HOST: str = config("QDRANT_HOST", default="localhost")
    QDRANT_PORT: int = config("QDRANT_PORT", default=6333, cast=int)
    
    # AI / Ollama
    OLLAMA_HOST: str = config("OLLAMA_HOST", default="http://localhost:11434")
    
    # SMTP Email Settings
    SMTP_HOST: str = config("SMTP_HOST", default="smtp.hostinger.com")
    SMTP_PORT: int = config("SMTP_PORT", default=465, cast=int)
    SMTP_USER: str = config("SMTP_USER", default="admin@alsakronline.com")
    SMTP_PASS: str = config("SMTP_PASS", default="")

settings = Settings()
