from typing import Optional
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    vision_provider: str
    gemini_configured: bool
    supabase_configured: bool
    supported_pests: int
