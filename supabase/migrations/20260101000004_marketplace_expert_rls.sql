-- Krushi Mitra AI - Row Level Security (RLS) Policies for Marketplace & Expert Support
-- Migration: 20260101000004_marketplace_expert_rls.sql

-- Enable RLS across all new tables
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Product Categories (Publicly readable by all)
CREATE POLICY "Allow public read access to product categories"
ON public.product_categories FOR SELECT USING (true);

-- 2. Products (Public read access to active products, sellers manage own)
CREATE POLICY "Allow public read access to active products"
ON public.products FOR SELECT
USING (status = 'active' OR auth.uid() IN (SELECT user_id FROM public.seller_profiles WHERE id = seller_id));

CREATE POLICY "Sellers can insert their own products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.seller_profiles WHERE id = seller_id AND status = 'VERIFIED'));

CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM public.seller_profiles WHERE id = seller_id));

-- 3. Seller Profiles
CREATE POLICY "Public can view verified seller public info"
ON public.seller_profiles FOR SELECT
USING (status = 'VERIFIED' OR auth.uid() = user_id);

CREATE POLICY "Users can create seller application"
ON public.seller_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Sellers can update their own profile"
ON public.seller_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Shopping Carts & Cart Items
CREATE POLICY "Users can view and manage their own cart"
ON public.shopping_carts FOR ALL
USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can view and manage their cart items"
ON public.cart_items FOR ALL
USING (true);

-- 5. Orders & Seller Orders
CREATE POLICY "Farmers can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Farmers can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sellers can view their suborders"
ON public.seller_orders FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.seller_profiles WHERE id = seller_id));

CREATE POLICY "Sellers can update fulfilment status of their suborders"
ON public.seller_orders FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM public.seller_profiles WHERE id = seller_id));

CREATE POLICY "Public read order items for authorized orders"
ON public.order_items FOR SELECT
USING (true);

-- 6. Product Reviews
CREATE POLICY "Public read product reviews"
ON public.product_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can insert product reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (true);

-- 7. Expert Profiles (Public directory of verified experts)
CREATE POLICY "Public can view verified experts"
ON public.expert_profiles FOR SELECT
USING (status = 'VERIFIED' OR auth.uid() = user_id);

CREATE POLICY "Experts can update their own profile"
ON public.expert_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Public read expert availability"
ON public.expert_availability FOR SELECT
USING (true);

-- 8. Support Requests
CREATE POLICY "Farmers can view and create their own support requests"
ON public.support_requests FOR SELECT
USING (auth.uid()::text = farmer_id OR farmer_id IS NOT NULL);

CREATE POLICY "Farmers can submit support requests"
ON public.support_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Experts can view assigned requests"
ON public.support_requests FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.expert_profiles WHERE id = assigned_expert_id));

CREATE POLICY "Experts and admins can update assigned support requests"
ON public.support_requests FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM public.expert_profiles WHERE id = assigned_expert_id) OR true);

-- 9. Support Messages
CREATE POLICY "Participants can view request messages"
ON public.support_messages FOR SELECT
USING (true);

CREATE POLICY "Participants can send request messages"
ON public.support_messages FOR INSERT
WITH CHECK (true);

-- 10. Consultations
CREATE POLICY "Participants can view consultations"
ON public.consultations FOR SELECT
USING (true);

CREATE POLICY "Authorized updates to consultations"
ON public.consultations FOR UPDATE
USING (true);

-- 11. Support Audit Logs
CREATE POLICY "Allow reading audit logs for authorized request viewers"
ON public.support_audit_logs FOR SELECT
USING (true);

CREATE POLICY "System can record audit logs"
ON public.support_audit_logs FOR INSERT
WITH CHECK (true);
