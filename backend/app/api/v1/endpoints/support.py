from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Header
from app.models.expert import (
    SupportRequest, SupportRequestCreate, SupportRequestStatusEnum,
    SupportMessage, SupportMessageCreate, SupportAuditLog,
    Consultation, CallbackBookingRequest, ScheduleBookingRequest
)
from app.services.expert_service import expert_service
from app.services.notification_service import notification_service
from app.core.security import verify_auth_token

router = APIRouter()

def get_current_user_id(
    auth_ctx: dict = Depends(verify_auth_token),
    x_user_id: Optional[str] = Header(None)
) -> str:
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()
    return auth_ctx.get("user_id", "farmer-default")

@router.post("/requests", response_model=SupportRequest)
def create_support_request(
    req: SupportRequestCreate,
    user_id: str = Depends(get_current_user_id)
):
    try:
        support_req = expert_service.create_support_request(user_id, req)
        # Notify assigned expert if exists
        if support_req.assigned_expert_id:
            notification_service.create_notification(
                user_id=support_req.assigned_expert_id,
                role="expert",
                category="expert",
                title_en=f"New Case Assigned: #{support_req.reference_number}",
                title_or=f"ନୂତନ କେସ୍ ପ୍ରଦାନ: #{support_req.reference_number}",
                message_en=f"Farmer {support_req.farmer_name} reported {support_req.problem_category.value} on {support_req.crop_id or 'crop'}.",
                message_or=f"ଚାଷୀ {support_req.farmer_name} ଫସଲ ସମସ୍ୟା ରିପୋର୍ଟ କରିଛନ୍ତି।",
                link_tab="expert_dashboard",
                reference_id=support_req.id
            )
        return support_req
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/requests", response_model=List[SupportRequest])
def list_support_requests(
    role: Optional[str] = Query("farmer"),
    user_id: str = Depends(get_current_user_id)
):
    if role == "expert":
        return expert_service.list_expert_requests(user_id)
    if role == "admin":
        return expert_service.list_all_requests()
    return expert_service.list_farmer_requests(user_id)

@router.get("/requests/{request_id}", response_model=SupportRequest)
def get_support_request(request_id: str):
    support_req = expert_service.get_support_request(request_id)
    if not support_req:
        raise HTTPException(status_code=404, detail="Support request not found.")
    return support_req

@router.patch("/requests/{request_id}/status", response_model=SupportRequest)
def update_support_status(
    request_id: str,
    status: SupportRequestStatusEnum,
    reason: Optional[str] = None,
    resolution_notes: Optional[str] = None,
    actor_id: str = Depends(get_current_user_id),
    actor_role: str = Header("expert")
):
    try:
        return expert_service.update_request_status(
            request_id=request_id,
            new_status=status,
            actor_id=actor_id,
            actor_role=actor_role,
            reason=reason,
            resolution_notes=resolution_notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/requests/{request_id}/messages", response_model=List[SupportMessage])
def get_messages(
    request_id: str,
    user_id: str = Depends(get_current_user_id)
):
    expert_service.mark_messages_read(request_id, user_id)
    return expert_service.get_messages(request_id)

@router.post("/requests/{request_id}/messages", response_model=SupportMessage)
def send_message(
    request_id: str,
    req: SupportMessageCreate,
    user_id: str = Depends(get_current_user_id),
    sender_type: str = Header("farmer"),
    sender_name: Optional[str] = Header(None)
):
    try:
        s_name = sender_name or ("Farmer" if sender_type == "farmer" else "Agricultural Scientist")
        msg = expert_service.send_message(
            request_id=request_id,
            sender_type=sender_type,
            sender_id=user_id,
            sender_name=s_name,
            message_text=req.message_text,
            attachments=req.attachments
        )
        return msg
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/requests/{request_id}/callback", response_model=Consultation)
def book_callback(
    request_id: str,
    req: CallbackBookingRequest
):
    try:
        return expert_service.book_callback(request_id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/requests/{request_id}/schedule", response_model=Consultation)
def book_schedule(
    request_id: str,
    req: ScheduleBookingRequest
):
    try:
        return expert_service.book_schedule(request_id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/requests/{request_id}/audit-trail", response_model=List[SupportAuditLog])
def get_audit_trail(request_id: str):
    return expert_service.get_audit_trail(request_id)
