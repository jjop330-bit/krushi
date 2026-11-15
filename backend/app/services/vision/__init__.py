from app.core.config import settings
from app.services.vision.base import BasePestDetector
from app.services.vision.gemini import GeminiVisionProvider
from app.services.vision.baseline import VerifiedExpertBaselineProvider
from app.services.vision.yolo import ModularYOLOAdapter

def get_vision_provider(provider_name: str = None) -> BasePestDetector:
    target = provider_name or settings.ACTIVE_VISION_PROVIDER
    
    if target == "gemini":
        return GeminiVisionProvider()
    elif target == "yolo":
        return ModularYOLOAdapter()
    else:
        return VerifiedExpertBaselineProvider()
