from fastapi import APIRouter, HTTPException, Depends
from app.services.payment_service import (
    payment_service, PaymentOrderRequest, PaymentOrderResponse, PaymentWebhookPayload
)
from app.services.marketplace_service import marketplace_service
from app.models.marketplace import PaymentStatusEnum

router = APIRouter()

@router.get("/status")
def get_payment_status():
    """
    Returns payment gateway operational configuration and mode (Live vs Sandbox).
    """
    return payment_service.get_gateway_status()

@router.post("/create-order", response_model=PaymentOrderResponse)
def create_payment_order(req: PaymentOrderRequest):
    order = marketplace_service.get_order(req.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return payment_service.create_payment_order(req)

@router.post("/webhook")
def process_payment_webhook(payload: PaymentWebhookPayload):
    """
    Server-side HMAC-SHA256 signature verified idempotent payment webhook processor.
    Reconciles order payment status upon receiving captured payment events.
    """
    try:
        result = payment_service.process_webhook(payload)
        order_id = result.get("order_id")
        if order_id:
            order = marketplace_service.get_order(order_id)
            if order:
                order.payment_status = PaymentStatusEnum.PAID
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refund")
def process_refund(gateway_order_id: str, amount: float, reason: str):
    try:
        return payment_service.process_refund(gateway_order_id, amount, reason)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
