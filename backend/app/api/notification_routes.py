from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from typing import List
import uuid

router = APIRouter()

@router.get("/notifications")
async def get_notifications(user_id: int, db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "related_id": n.related_id
            } for n in notifications
        ]
    }

@router.put("/notifications/{notification_id}/read")
async def mark_as_read(notification_id: str, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"status": "success"}

@router.delete("/notifications/clear")
async def clear_notifications(user_id: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.commit()
    return {"status": "success"}

# Helper function to create notifications (to be called from other routes)
def create_notification(db: Session, user_id: int, type: str, message: str, related_id: str = None):
    new_notif = Notification(
        user_id=user_id,
        type=type,
        message=message,
        related_id=related_id
    )
    db.add(new_notif)
    db.commit()
    return new_notif
