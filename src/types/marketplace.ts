export type SellerStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'under_review';

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export type SuborderStatus = 
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ProductCategory {
  id: string;
  name_en: string;
  name_or: string;
  description_en?: string;
  description_or?: string;
  icon_name?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_district?: string;
  category_id: string;
  title_en: string;
  title_or: string;
  description_en: string;
  description_or: string;
  price: number;
  original_price?: number;
  unit: string;
  stock_quantity: number;
  image_urls: string[];
  compatible_crops: string[];
  target_pests: string[];
  is_organic: boolean;
  is_chemical_regulated: boolean;
  cibrc_registration_number?: string;
  status: ProductStatus;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface SellerProfile {
  id: string;
  business_name: string;
  contact_person: string;
  phone_number: string;
  email?: string;
  business_address: string;
  operating_district: string;
  business_type: 'manufacturer' | 'distributor' | 'retailer' | 'fpo';
  license_number?: string;
  bank_account_number_masked?: string;
  bank_ifsc?: string;
  status: SellerStatus;
  commission_rate: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  total_price: number;
}

export interface ShoppingCart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  seller_id: string;
}

export interface SellerSuborder {
  id: string;
  order_id: string;
  seller_id: string;
  seller_name: string;
  suborder_number: string;
  subtotal: number;
  commission_rate: number;
  commission_amount: number;
  seller_earnings: number;
  fulfilment_status: SuborderStatus;
  tracking_number?: string;
  shipping_carrier?: string;
  payout_status: string;
  items: OrderItem[];
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  farmer_name: string;
  farmer_phone: string;
  shipping_address: string;
  district: string;
  subtotal: number;
  platform_fee: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: OrderStatus;
  suborders: SellerSuborder[];
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  farmer_name: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}
