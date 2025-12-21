"""
Configuration Management
Environment variables and application settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "Nexus Industrial"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:////app/data/nexus.db"
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "https://nexusindustrial.com",
        "https://www.nexusindustrial.com",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # AI Services
    OLLAMA_HOST: str = "http://ollama:11434"
    QDRANT_HOST: str = "http://qdrant:6333"
    
    # Supported Languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "ar"]
    DEFAULT_LANGUAGE: str = "en"
    
    # Email Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    EMAIL_USERNAME: str
    EMAIL_PASSWORD: str
    EMAIL_FROM: str = "noreply@nexusindustrial.com"
    
    # RFQ Configuration
    MAX_VENDORS_PER_RFQ: int = 5
    DEFAULT_QUOTE_VALIDITY_DAYS: int = 30
    RFQ_REMINDER_HOURS: int = 48
    
    # File Upload Limits
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_AUDIO_SIZE_MB: int = 5
    MAX_PDF_SIZE_MB: int = 20
    
    # AI Model Configuration
    TEXT_EMBEDDING_MODEL: str = "nomic-embed-text:latest"
    VISION_MODEL: str = "llama3.2-vision:latest"
    CHAT_MODEL: str = "llama3.2:latest"
    
    # Vector Database Configuration
    VECTOR_SIZE_TEXT: int = 768  # nomic-embed-text dimension
    VECTOR_SIZE_IMAGE: int = 512  # CLIP dimension
    
    # Scraping Configuration
    SCRAPER_RATE_LIMIT_SECONDS: int = 3
    SCRAPER_MAX_RETRIES: int = 3
    SCRAPER_TIMEOUT_SECONDS: int = 30
    USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    # Storage Paths
    DATA_DIR: str = "/app/data"
    IMAGE_DIR: str = "/app/data/images"
    AUDIO_DIR: str = "/app/data/audio"
    DATASHEET_DIR: str = "/app/data/datasheets"
    EMBEDDING_CACHE_DIR: str = "/app/data/embeddings"
    LOG_DIR: str = "/app/logs"
    
    class Config:
        env_file = ".env.production"
        case_sensitive = True

# Instantiate settings
settings = Settings()

# Create directories if they don't exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.IMAGE_DIR, exist_ok=True)
os.makedirs(settings.AUDIO_DIR, exist_ok=True)
os.makedirs(settings.DATASHEET_DIR, exist_ok=True)
os.makedirs(settings.EMBEDDING_CACHE_DIR, exist_ok=True)
os.makedirs(settings.LOG_DIR, exist_ok=True)