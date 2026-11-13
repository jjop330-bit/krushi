from abc import ABC, abstractmethod
from typing import Optional
from app.models.pest import PestAnalysisResponse

class BasePestDetector(ABC):
    """
    Abstract Base Class for modular pest vision detection providers.
    Ensures that any model (Gemini, fine-tuned YOLO, EfficientNet, or offline baseline)
    can be plugged in without requiring changes to the frontend or API layer.
    """
    
    @abstractmethod
    async def analyze(
        self,
        image_bytes: bytes,
        crop_id: str = "paddy",
        farmer_district: str = "bargarh",
        forced_pest_id: Optional[str] = None
    ) -> PestAnalysisResponse:
        """
        Analyze an input crop photograph and return a strictly validated PestAnalysisResponse.
        """
        pass
