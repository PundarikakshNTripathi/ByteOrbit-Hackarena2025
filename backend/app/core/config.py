"""
Core Configuration Module
Manages all environment variables and application settings using Pydantic Settings
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import json


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Application Settings
    APP_NAME: str = "CivicAgent API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Google Gemini AI Configuration
    GEMINI_API_KEY: str
    
    # Brevo Email Service Configuration
    BREVO_API_KEY: str
    BREVO_SENDER_EMAIL: str = "civic.agent.ai@gmail.com"
    BREVO_SENDER_NAME: str = "CivicAgent System"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days for hackathon testing
    
    # CORS Settings (accepts JSON string or list)
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000"]'
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Parse CORS origins from JSON string"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            try:
                return json.loads(self.BACKEND_CORS_ORIGINS)
            except:
                return ["http://localhost:3000", "http://127.0.0.1:3000"]
        return self.BACKEND_CORS_ORIGINS
    
    # Scheduler Settings
    SCHEDULER_TIMEZONE: str = "Asia/Kolkata"
    FOLLOW_UP_CHECK_INTERVAL_MINUTES: int = 60  # Check every hour
    
    # AI Model Settings - Using Gemini 2.0 Flash (best for student plan)
    VISION_MODEL_NAME: str = "gemini-2.0-flash-exp"
    REASONING_MODEL_NAME: str = "gemini-2.0-flash-exp"
    AI_TEMPERATURE: float = 0.7
    
    # File Upload Settings
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    
    # Supabase Storage
    STORAGE_BUCKET: str = "complaint-images"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
