from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SellerStatusEnum(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class SellerBusinessTypeEnum(str, Enum):
    MANUFACTURER = "manufacturer"
    DISTRIBUTOR = "distributor"
    RETAILER = "retailer"
    FPO = "fpo"

class ProductStatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"
    UNDER_REVIEW = "under_review"

class OrderStatusEnum(str, Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REFUND_REQUESTED = "REFUND_REQUESTED"
    REFUNDED = "REFUNDED"

class PaymentStatusEnum(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class SuborderStatusEnum(str, Enum):
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

# Product Category Models
class ProductCategory(BaseModel):
    id: str
    name_en: str
    name_or: str
    description_en: Optional[str] = None
    description_or: Optional[str] = None
    icon_name: Optional[str] = None
    is_active: bool = True

# Product Models
class ProductBase(BaseModel):
    category_id: str
    title_en: str
    title_or: str
    description_en: str
    description_or: str
    price: float = Field(gt=0)
    original_price: Optional[float] = None
    unit: str = "kg"
    stock_quantity: int = Field(ge=0, default=0)
    image_urls: List[str] = []
    compatible_crops: List[str] = []
    target_pests: List[str] = []
    is_organic: bool = False
    is_chemical_regulated: bool = False
    cibrc_registration_number: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title_en: Optional[str] = None
    title_or: Optional[str] = None
    description_en: Optional[str] = None
    description_or: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    status: Optional[ProductStatusEnum] = None
    image_urls: Optional[List[str]] = None
    is_organic: Optional[bool] = None
    is_chemical_regulated: Optional[bool] = None

class Product(ProductBase):
    id: str
    seller_id: str
    seller_name: Optional[str] = None
    seller_district: Optional[str] = None
    status: ProductStatusEnum = ProductStatusEnum.ACTIVE
    rating: float = 5.0
    total_reviews: int = 0
    created_at: str
    updated_at: str

# Seller Models
class SellerRegisterRequest(BaseModel):
    business_name: str
    contact_person: str
    phone_number: str
    email: Optional[str] = None
    business_address: str
    operating_district: str = "bargarh"
    business_type: SellerBusinessTypeEnum = SellerBusinessTypeEnum.RETAILER
    license_number: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    documents: List[Dict[str, str]] = []

class SellerProfile(BaseModel):
    id: str
    business_name: str
    contact_person: str
    phone_number: str
    email: Optional[str] = None
    business_address: str
    operating_district: str
    business_type: SellerBusinessTypeEnum
    license_number: Optional[str] = None
    bank_account_number_masked: Optional[str] = None
    bank_ifsc: Optional[str] = None
    status: SellerStatusEnum = SellerStatusEnum.PENDING
    commission_rate: float = 5.00
    rating: float = 5.0
    created_at: str
    updated_at: str

# Shopping Cart Models
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(gt=0, default=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)

class CartItem(BaseModel):
    id: str
    product_id: str
    product: Product
    quantity: int
    total_price: float

class ShoppingCart(BaseModel):
    id: str
    user_id: str
    items: List[CartItem] = []
    subtotal: float = 0.0
    delivery_fee: float = 0.0
    total: float = 0.0

# Order Models
class CheckoutRequest(BaseModel):
    farmer_name: str
    farmer_phone: str
    shipping_address: str
    district: str = "bargarh"
    payment_method: str = "ONLINE"  # ONLINE | UPI | COD

class OrderItem(BaseModel):
    id: str
    product_id: str
    product_title: str
    unit_price: float
    quantity: int
    total_price: float
    seller_id: str

class SellerSuborder(BaseModel):
    id: str
    order_id: str
    seller_id: str
    seller_name: str
    suborder_number: str
    subtotal: float
    commission_rate: float
    commission_amount: float
    seller_earnings: float
    fulfilment_status: SuborderStatusEnum = SuborderStatusEnum.PROCESSING
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None
    payout_status: str = "PENDING"
    items: List[OrderItem] = []
    created_at: str

class Order(BaseModel):
    id: str
    order_number: str
    user_id: str
    farmer_name: str
    farmer_phone: str
    shipping_address: str
    district: str
    subtotal: float
    platform_fee: float = 0.0
    delivery_fee: float = 0.0
    total_amount: float
    payment_method: str = "ONLINE"
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PENDING
    order_status: OrderStatusEnum = OrderStatusEnum.CONFIRMED
    suborders: List[SellerSuborder] = []
    created_at: str
    updated_at: str

# Review Models
class ProductReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str
    farmer_name: str

class ProductReview(BaseModel):
    id: str
    product_id: str
    user_id: str
    farmer_name: str
    rating: int
    comment: str
    verified_purchase: bool = True
    created_at: str
