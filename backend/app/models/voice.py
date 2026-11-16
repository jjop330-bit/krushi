from pydantic import BaseModel, Field
from typing import Optional, List

class VoiceTTSRequest(BaseModel):
    """
    Request model for Odia & Indic speech synthesis using Sarvam AI Bulbul v3.
    """
    text: str = Field(
        ..., 
        min_length=1, 
        max_length=2500, 
        description="Text to synthesize in Odia or supported Indic language. Max 2500 characters."
    )
    language_code: str = Field(
        "od-IN", 
        description="BCP-47 language code. Use 'od-IN' for Odia."
    )
    speaker: Optional[str] = Field(
        None, 
        description="Bulbul v3 speaker voice persona (e.g., 'shubh', 'priya', 'neha'). Defaults to 'shubh'."
    )
    pace: Optional[float] = Field(
        1.0, 
        ge=0.5, 
        le=2.0, 
        description="Speech pace multiplier between 0.5 and 2.0."
    )

class VoiceTTSResponse(BaseModel):
    """
    Response model containing synthesized playable audio.
    """
    audio_base64: str = Field(
        ..., 
        description="Base64-encoded audio payload in WAV format."
    )
    mime_type: str = Field(
        "audio/wav", 
        description="MIME type of the audio stream."
    )
    language_code: str = Field(
        "od-IN", 
        description="Target language code synthesized."
    )
    speaker: str = Field(
        "shubh", 
        description="Speaker voice persona applied."
    )
    character_count: int = Field(
        ..., 
        description="Total character count of the synthesized text."
    )
    provider: str = Field(
        "sarvam-bulbul-v3", 
        description="Underlying speech synthesis provider."
    )
    cached: bool = Field(
        False,
        description="Whether this response was served from backend LRU cache."
    )

class SpeakerInfo(BaseModel):
    name: str
    gender: str
    recommended_for: List[str]

class SupportedSpeakersResponse(BaseModel):
    default_speaker: str
    supported_language: str
    speakers: List[SpeakerInfo]
