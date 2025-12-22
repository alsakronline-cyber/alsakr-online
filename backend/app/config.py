from decouple import config
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./data/nexus.db")
    SECRET_KEY: str = config("SECRET_KEY", default="supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPPORTED_LANGUAGES: list = ['en', 'ar']

settings = Settings()
