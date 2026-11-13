from typing import List, Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    query: str
    pest_context: Optional[str] = None
    farmer_district: str = "bargarh"
    language: str = "or"  # "or" | "en"

class ChatResponse(BaseModel):
    id: str
    reply_en: str
    reply_or: str
    pest_context: Optional[str] = None
    suggested_action_pills_en: List[str] = []
    suggested_action_pills_or: List[str] = []
