from typing import List, Optional
from fastapi import APIRouter, Query, Depends, Header
from app.services.notification_service import notification_service, AppNotification
from app.core.security import verify_auth_token

router = APIRouter()

def get_current_user_id(
    auth_ctx: dict = Depends(verify_auth_token),
    x_user_id: Optional[str] = Header(None)
) -> str:
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()
    return auth_ctx.get("user_id", "farmer-default")

@router.get("", response_model=List[AppNotification])
def list_notifications(
    role: Optional[str] = Query(None),
    limit: int = Query(50),
    user_id: str = Depends(get_current_user_id)
):
    return notification_service.list_notifications(user_id=user_id, role=role, limit=limit)

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    notification_service.mark_read(notification_id)
    return {"status": "SUCCESS"}

@router.post("/mark-all-read")
def mark_all_notifications_read(user_id: str = Depends(get_current_user_id)):
    notification_service.mark_all_read(user_id)
    return {"status": "SUCCESS"}
