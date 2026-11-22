from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ExpertStatusEnum(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class ProblemCategoryEnum(str, Enum):
    PEST_INSECT = "pest_insect"
    CROP_DISEASE = "crop_disease"
    SOIL_HEALTH = "soil_health"
    FERTILIZER = "fertilizer"
    IRRIGATION = "irrigation"
    CROP_MANAGEMENT = "crop_management"
    WEATHER = "weather"
    HARVESTING = "harvesting"
    OTHER = "other"

class ContactMethodEnum(str, Enum):
    CHAT = "chat"
    CALLBACK = "callback"
    SCHEDULE = "schedule"

class SupportRequestStatusEnum(str, Enum):
    SUBMITTED = "SUBMITTED"
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    ESCALATED = "ESCALATED"

class PriorityEnum(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"

# Expert Profile Models
class ExpertAvailabilitySlot(BaseModel):
    id: str
    expert_id: str
    day_of_week: int  # 0=Sunday, 1=Monday...
    start_time: str
    end_time: str
    slot_duration_minutes: int = 20
    is_active: bool = True

class ExpertRegisterRequest(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone_number: str
    institution: str
    qualification: str
    specialization: str
    experience_years: int = 5
    languages: List[str] = ["Odia", "English"]
    location_district: str = "Bargarh"
    consultation_modes: List[str] = ["chat", "callback", "schedule"]

class ExpertProfile(BaseModel):
    id: str
    full_name: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    institution: str
    qualification: str
    specialization: str
    experience_years: int
    languages: List[str]
    location_district: str
    consultation_modes: List[str]
    status: ExpertStatusEnum = ExpertStatusEnum.VERIFIED
    rating: float = 4.9
    total_consultations: int = 0
    is_available: bool = True
    created_at: str

# Support Request Models
class SupportRequestCreate(BaseModel):
    farmer_name: str
    farmer_phone: str
    farmer_district: str = "bargarh"
    crop_id: Optional[str] = "paddy"
    problem_category: ProblemCategoryEnum
    description: str
    preferred_language: str = "or"
    contact_method: ContactMethodEnum
    preferred_date: Optional[str] = None
    preferred_time_slot: Optional[str] = None
    ai_scan_id: Optional[str] = None
    ai_diagnosis_summary: Optional[Dict[str, Any]] = None
    image_attachments: List[str] = []
    priority: PriorityEnum = PriorityEnum.NORMAL

class SupportMessageCreate(BaseModel):
    message_text: str
    attachments: List[str] = []

class SupportMessage(BaseModel):
    id: str
    request_id: str
    sender_type: str  # farmer | expert | system
    sender_id: str
    sender_name: str
    message_text: str
    attachments: List[str] = []
    is_read: bool = False
    created_at: str

class SupportAuditLog(BaseModel):
    id: str
    request_id: str
    previous_status: str
    new_status: str
    actor_id: str
    actor_role: str
    reason: Optional[str] = None
    created_at: str

class SupportRequest(BaseModel):
    id: str
    reference_number: str
    farmer_id: str
    farmer_name: str
    farmer_phone: str
    farmer_district: str
    crop_id: Optional[str] = None
    problem_category: ProblemCategoryEnum
    description: str
    preferred_language: str = "or"
    contact_method: ContactMethodEnum
    preferred_date: Optional[str] = None
    preferred_time_slot: Optional[str] = None
    ai_scan_id: Optional[str] = None
    ai_diagnosis_summary: Optional[Dict[str, Any]] = None
    image_attachments: List[str] = []
    priority: PriorityEnum = PriorityEnum.NORMAL
    assigned_expert_id: Optional[str] = None
    assigned_expert_name: Optional[str] = None
    status: SupportRequestStatusEnum = SupportRequestStatusEnum.SUBMITTED
    resolution_notes: Optional[str] = None
    farmer_feedback_rating: Optional[int] = None
    farmer_feedback_comment: Optional[str] = None
    created_at: str
    updated_at: str

class Consultation(BaseModel):
    id: str
    request_id: str
    expert_id: str
    expert_name: str
    farmer_name: str
    farmer_phone: str
    scheduled_date: str
    scheduled_time_slot: str
    consultation_type: str
    status: str = "CONFIRMED"
    meeting_link_or_phone: Optional[str] = None
    advisory_summary: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str

class CallbackBookingRequest(BaseModel):
    preferred_date: str
    preferred_time_slot: str
    expert_id: Optional[str] = None
    notes: Optional[str] = None

class ScheduleBookingRequest(BaseModel):
    scheduled_date: str
    scheduled_time_slot: str
    expert_id: str
    notes: Optional[str] = None
