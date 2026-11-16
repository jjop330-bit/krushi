import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Krushi Mitra AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI Engine Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    ACTIVE_VISION_PROVIDER: str = "gemini"  # "gemini" | "baseline" | "yolo"

    # Sarvam AI Voice Engine Configuration (Odia Text-to-Speech)
    # Bulbul v3 with target_language_code="od-IN"
    # Stored strictly on backend, never exposed to client or logged
    SARVAM_API_KEY: Optional[str] = None
    SARVAM_TTS_MODEL: str = "bulbul:v3"
    SARVAM_DEFAULT_SPEAKER: str = "shubh"
    SARVAM_TTS_ENDPOINT: str = "https://api.sarvam.ai/text-to-speech"

    # Server-Side HMAC-SHA256 Message Authentication Code (MAC) Configuration
    # Used for tamper-evident server-authenticated report verification.
    # Stored strictly on server in backend env, never exposed in client bundles or network responses.
    REPORT_SIGNING_SECRET: str = "km-audit-signing-secret-v1-production-2026"
    REPORT_SIGNING_KEY_VERSION: str = "v1"
    # Secure historical key registry supporting key rotation verification
    REPORT_SIGNING_HISTORICAL_KEYS: dict = {
        "v1": "km-audit-signing-secret-v1-production-2026",
        "v0": "km-audit-signing-secret-v0-pilot-archive"
    }
    
    # Supabase Configuration (Optional - graceful fallback for local development)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "crop-scans"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://krushi-mitra-ai.vercel.app",
        "https://krushi-mitra-ai-frontend.vercel.app",
        "https://krushi-mitra.vercel.app",
        "*"
    ]
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
