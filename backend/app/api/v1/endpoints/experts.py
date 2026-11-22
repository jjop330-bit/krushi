from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Header
from app.models.expert import ExpertProfile, ExpertRegisterRequest
from app.services.expert_service import expert_service
from app.services.notification_service import notification_service
from app.core.security import verify_auth_token

router = APIRouter()

def get_current_expert_id(
    auth_ctx: dict = Depends(verify_auth_token),
    x_expert_id: Optional[str] = Header(None)
) -> str:
    if x_expert_id and x_expert_id.strip():
        return x_expert_id.strip()
    return "expert-dr-patnaik"

@router.get("", response_model=List[ExpertProfile])
def list_experts(
    specialization: Optional[str] = Query(None),
    district: Optional[str] = Query(None)
):
    """
    Public directory of verified agricultural scientists & KVK agronomists.
    """
    return expert_service.list_experts(
        specialization=specialization,
        district=district
    )

@router.get("/profile", response_model=ExpertProfile)
def get_current_expert_profile(expert_id: str = Depends(get_current_expert_id)):
    expert = expert_service.get_expert(expert_id)
    if not expert:
        raise HTTPException(status_code=404, detail="Expert profile not found.")
    return expert

@router.get("/{expert_id}", response_model=ExpertProfile)
def get_expert_by_id(expert_id: str):
    expert = expert_service.get_expert(expert_id)
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found.")
    return expert

@router.post("/register", response_model=ExpertProfile)
def register_expert(req: ExpertRegisterRequest):
    profile = expert_service.register_expert(req)
    # Notify admin
    notification_service.create_notification(
        user_id="admin",
        role="admin",
        category="expert",
        title_en=f"New Expert Application: {profile.full_name}",
        title_or=f"ନୂତନ ବିଶେଷଜ୍ଞ ଆବେଦନ: {profile.full_name}",
        message_en=f"Institution: {profile.institution} | Specialization: {profile.specialization}",
        message_or=f"ଅନୁଷ୍ଠାନ: {profile.institution} | ବିଶେଷଜ୍ଞତା: {profile.specialization}",
        link_tab="admin_dashboard",
        reference_id=profile.id
    )
    return profile
