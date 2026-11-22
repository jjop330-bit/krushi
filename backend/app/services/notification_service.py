import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AppNotification(BaseModel):
    id: str
    user_id: str
    role: str  # farmer | seller | expert | admin | all
    category: str  # marketplace | expert | system
    title_en: str
    title_or: str
    message_en: str
    message_or: str
    link_tab: Optional[str] = None
    reference_id: Optional[str] = None
    is_read: bool = False
    created_at: str

class NotificationService:
    """
    Persistent In-App Notification System.
    Delivers event notifications for marketplace orders, seller onboarding,
    expert request assignments, live chat updates, and callback confirmations.
    """

    def __init__(self):
        self._notifications: List[AppNotification] = []
        self._initialize_welcome_notifications()

    def _initialize_welcome_notifications(self):
        self._notifications.append(
            AppNotification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id="all",
                role="farmer",
                category="system",
                title_en="Krushi Store & Expert Consultations Live!",
                title_or="କୃଷି ଷ୍ଟୋର ଏବଂ ବିଶେଷଜ୍ଞ ପରାମର୍ଶ ଲାଇଭ୍ ହୋଇଛି!",
                message_en="You can now order authentic certified seeds, organic biopesticides, and request live consultations with OUAT & KVK scientists.",
                message_or="ବର୍ତ୍ତମାନ ଆପଣ ପ୍ରମାଣିତ ବିହନ, ଜୈବିକ ଔଷଧ ଅର୍ଡର କରିପାରିବେ ଏବଂ କୃଷି ବିଜ୍ଞାନୀଙ୍କ ସହ ସିଧାସଳଖ କଥା ହୋଇପାରିବେ।",
                link_tab="store",
                created_at=datetime.now(timezone.utc).isoformat()
            )
        )

    def create_notification(
        self,
        user_id: str,
        role: str,
        category: str,
        title_en: str,
        title_or: str,
        message_en: str,
        message_or: str,
        link_tab: Optional[str] = None,
        reference_id: Optional[str] = None
    ) -> AppNotification:
        notif = AppNotification(
            id=f"notif-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            role=role,
            category=category,
            title_en=title_en,
            title_or=title_or,
            message_en=message_en,
            message_or=message_or,
            link_tab=link_tab,
            reference_id=reference_id,
            is_read=False,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self._notifications.insert(0, notif)
        return notif

    def list_notifications(
        self,
        user_id: str,
        role: Optional[str] = None,
        limit: int = 50
    ) -> List[AppNotification]:
        results = [
            n for n in self._notifications
            if n.user_id == user_id or n.user_id == "all"
        ]
        if role:
            results = [n for n in results if n.role == role or n.role == "all"]
        return results[:limit]

    def mark_read(self, notification_id: str):
        for n in self._notifications:
            if n.id == notification_id:
                n.is_read = True

    def mark_all_read(self, user_id: str):
        for n in self._notifications:
            if n.user_id == user_id or n.user_id == "all":
                n.is_read = True

notification_service = NotificationService()
