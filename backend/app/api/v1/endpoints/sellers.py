from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from app.models.marketplace import (
    SellerProfile, SellerRegisterRequest, Product, ProductCreate, ProductUpdate,
    SellerSuborder, SuborderStatusEnum
)
from app.services.marketplace_service import marketplace_service
from app.services.notification_service import notification_service
from app.core.security import verify_auth_token

router = APIRouter()

def get_current_seller_id(
    auth_ctx: dict = Depends(verify_auth_token),
    x_seller_id: Optional[str] = Header(None)
) -> str:
    if x_seller_id and x_seller_id.strip():
        return x_seller_id.strip()
    # Default to first verified seller for local demo/development
    return "seller-ossc-bargarh"

@router.post("/register", response_model=SellerProfile)
def register_seller(req: SellerRegisterRequest):
    profile = marketplace_service.register_seller(req)
    # Notify admin
    notification_service.create_notification(
        user_id="admin",
        role="admin",
        category="marketplace",
        title_en=f"New Seller Application: {profile.business_name}",
        title_or=f"ନୂତନ ବିକ୍ରେତା ଆବେଦନ: {profile.business_name}",
        message_en=f"District: {profile.operating_district.upper()} | Type: {profile.business_type.value}",
        message_or=f"ଜିଲ୍ଲା: {profile.operating_district.upper()} | ବ୍ୟବସାୟ: {profile.business_type.value}",
        link_tab="admin_dashboard",
        reference_id=profile.id
    )
    return profile

@router.get("/profile", response_model=SellerProfile)
def get_seller_profile(seller_id: str = Depends(get_current_seller_id)):
    profile = marketplace_service.get_seller(seller_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found.")
    return profile

@router.get("/products", response_model=List[Product])
def list_seller_products(seller_id: str = Depends(get_current_seller_id)):
    return marketplace_service.list_products(seller_id=seller_id, status=None)

@router.post("/products", response_model=Product)
def add_product(
    req: ProductCreate,
    seller_id: str = Depends(get_current_seller_id)
):
    try:
        return marketplace_service.add_product(seller_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.put("/products/{product_id}", response_model=Product)
def update_product(
    product_id: str,
    req: ProductUpdate,
    seller_id: str = Depends(get_current_seller_id)
):
    try:
        return marketplace_service.update_product(seller_id, product_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/orders", response_model=List[SellerSuborder])
def list_seller_orders(seller_id: str = Depends(get_current_seller_id)):
    return marketplace_service.list_seller_suborders(seller_id)

@router.patch("/orders/{suborder_id}/status", response_model=SellerSuborder)
def update_suborder_status(
    suborder_id: str,
    status: SuborderStatusEnum,
    tracking_number: Optional[str] = None,
    seller_id: str = Depends(get_current_seller_id)
):
    try:
        sub = marketplace_service.update_suborder_status(seller_id, suborder_id, status, tracking_number)
        if not sub:
            raise HTTPException(status_code=404, detail="Suborder not found.")
        return sub
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
