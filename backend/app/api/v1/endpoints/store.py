from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Header
from app.models.marketplace import (
    ProductCategory, Product, ShoppingCart, CartItemAdd, CartItemUpdate,
    Order, CheckoutRequest, ProductReview, ProductReviewCreate
)
from app.services.marketplace_service import marketplace_service
from app.services.notification_service import notification_service
from app.core.security import verify_auth_token

router = APIRouter()

def get_current_user_id(
    auth_ctx: dict = Depends(verify_auth_token),
    x_farmer_id: Optional[str] = Header(None)
) -> str:
    if x_farmer_id and x_farmer_id.strip():
        return x_farmer_id.strip()
    return auth_ctx.get("user_id", "farmer-default")

@router.get("/categories", response_model=List[ProductCategory])
def get_categories():
    return marketplace_service.get_categories()

@router.get("/products", response_model=List[Product])
def list_products(
    category_id: Optional[str] = Query(None),
    crop_id: Optional[str] = Query(None),
    pest_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    is_organic: Optional[bool] = Query(None),
    district: Optional[str] = Query(None)
):
    return marketplace_service.list_products(
        category_id=category_id,
        crop_id=crop_id,
        pest_id=pest_id,
        search_query=search,
        min_price=min_price,
        max_price=max_price,
        is_organic=is_organic,
        seller_district=district,
        status="active"
    )

@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    product = marketplace_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/{product_id}/reviews", response_model=List[ProductReview])
def get_product_reviews(product_id: str):
    return marketplace_service.get_product_reviews(product_id)

@router.post("/products/{product_id}/reviews", response_model=ProductReview)
def add_product_review(
    product_id: str,
    req: ProductReviewCreate,
    user_id: str = Depends(get_current_user_id)
):
    try:
        return marketplace_service.add_review(product_id, user_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/cart", response_model=ShoppingCart)
def get_cart(user_id: str = Depends(get_current_user_id)):
    return marketplace_service.get_cart(user_id)

@router.post("/cart", response_model=ShoppingCart)
def add_to_cart(
    req: CartItemAdd,
    user_id: str = Depends(get_current_user_id)
):
    try:
        return marketplace_service.add_to_cart(user_id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/cart/{product_id}", response_model=ShoppingCart)
def update_cart_item(
    product_id: str,
    req: CartItemUpdate,
    user_id: str = Depends(get_current_user_id)
):
    try:
        return marketplace_service.update_cart_item(user_id, product_id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/cart/{product_id}", response_model=ShoppingCart)
def remove_from_cart(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    return marketplace_service.remove_from_cart(user_id, product_id)

@router.post("/checkout", response_model=Order)
def checkout(
    req: CheckoutRequest,
    user_id: str = Depends(get_current_user_id)
):
    try:
        order = marketplace_service.checkout(user_id, req)
        # Notify farmer of order confirmation
        notification_service.create_notification(
            user_id=user_id,
            role="farmer",
            category="marketplace",
            title_en=f"Order Confirmed: #{order.order_number}",
            title_or=f"ଅର୍ଡର ସୁନିଶ୍ଚିତ: #{order.order_number}",
            message_en=f"Your order of ₹{order.total_amount:.2f} has been placed successfully across {len(order.suborders)} suppliers.",
            message_or=f"ଆପଣଙ୍କ ₹{order.total_amount:.2f} ର ଅର୍ଡର ସଫଳତାର ସହ ଗ୍ରହଣ କରାଯାଇଛି।",
            link_tab="my_orders",
            reference_id=order.id
        )
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders", response_model=List[Order])
def list_farmer_orders(user_id: str = Depends(get_current_user_id)):
    return marketplace_service.list_farmer_orders(user_id)

@router.get("/orders/{order_id}", response_model=Order)
def get_order(
    order_id: str,
    user_id: str = Depends(get_current_user_id)
):
    order = marketplace_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Security: farmer can only view their own order
    if order.user_id != user_id and user_id != "admin":
        raise HTTPException(status_code=403, detail="Access denied: You can only view your own orders.")
    return order
