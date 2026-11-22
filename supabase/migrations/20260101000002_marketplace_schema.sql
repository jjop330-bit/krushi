-- Krushi Mitra AI - Multi-Vendor Agricultural Marketplace Schema
-- Migration: 20260101000002_marketplace_schema.sql

-- 1. Seller Profiles
CREATE TABLE IF NOT EXISTS public.seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    business_address TEXT NOT NULL,
    operating_district VARCHAR(100) NOT NULL DEFAULT 'bargarh',
    business_type VARCHAR(50) NOT NULL DEFAULT 'retailer', -- manufacturer | distributor | retailer | fpo
    license_number VARCHAR(100),
    bank_account_number_masked VARCHAR(50),
    bank_ifsc VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | VERIFIED | REJECTED | SUSPENDED
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seller Verification Documents
CREATE TABLE IF NOT EXISTS public.seller_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- gst_certificate | seed_license | pesticide_license | pan_card
    document_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(150) NOT NULL,
    name_or VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_or TEXT,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Categories
INSERT INTO public.product_categories (id, name_en, name_or, description_en, description_or, icon_name) VALUES
('seeds', 'Seeds & Planting Materials', 'ବିହନ ଏବଂ ରୋପଣ ସାମଗ୍ରୀ', 'Certified high-yield, disease-resistant seeds verified for Odisha agro-climatic conditions', 'ଓଡ଼ିଶା ଜଳବାୟୁ ଅନୁକୂଳ ପ୍ରମାଣିତ ଅଧିକ ଅମଳକ୍ଷମ ବିହନ', 'Sprout'),
('fertilizers', 'Fertilizers & Soil Nutrients', 'ଖତ ଓ ମୃତ୍ତିକା ପୋଷକ ତତ୍ତ୍ୱ', 'NPK mixtures, micronutrients, bio-fertilizers, and soil conditioning supplements', 'ଜୈବିକ ଓ ରାସାୟନିକ ସାର ଏବଂ ଅଣୁସାର', 'Layers'),
('organic', 'Organic Farming Products', 'ଜୈବିକ କୃଷି ଉତ୍ପାଦ', 'Neem formulations, Trichoderma, Pseudomonas, vermicompost, and bio-stimulants', 'ନିମ୍ବ ତେଲ, ଟ୍ରାଇକୋଡର୍ମା, ଜିଆ ଖତ ଓ ପ୍ରାକୃତିକ କୀଟନାଶକ', 'Leaf'),
('irrigation', 'Irrigation Equipment', 'ଜଳସେଚନ ଉପକରଣ', 'Drip kits, sprinkler systems, HDPE pipes, filters, and smart solar pump accessories', 'ବିନ୍ଦୁ ଜଳସେଚନ, ସ୍ପ୍ରିଙ୍କଲର ଓ ପାଇପ୍ ସାମଗ୍ରୀ', 'Droplet'),
('machinery', 'Agricultural Machinery', 'କୃଷି ଯନ୍ତ୍ରପାତି', 'Power tillers, reapers, seed drills, multi-crop threshers, and power sprayers', 'ପାୱାର ଟିଲର, ଧାନ କଟା ମେସିନ୍ ଓ ସ୍ପ୍ରେୟାର', 'Cpu'),
('tools', 'Farming Tools', 'କୃଷି ଉପକରଣ ଓ ହସ୍ତକଳା', 'Weeders, sickles, pruning shears, manual knapsack sprayers, and protective gear', 'ଘାସ ବଛା ଯନ୍ତ୍ର, ଦାଆ ଓ ସୁରକ୍ଷା ଉପକରଣ', 'Wrench'),
('crop_protection', 'Crop Protection & Traps', 'ଫସଲ ସୁରକ୍ଷା ଓ ଫାନ୍ଦ', 'Yellow/blue sticky traps, pheromone lure traps, light traps, and biological shields', 'ଫେରୋମୋନ ଫାନ୍ଦ, ଆଲୋକ ଫାନ୍ଦ ଓ ସୁରକ୍ଷା ଜାଲ', 'ShieldCheck'),
('harvesting', 'Harvesting & Storage Equipment', 'ଅମଳ ଓ ସଂରକ୍ଷଣ ଉପକରଣ', 'Hermetic grain storage bags (PICS), tarpaulins, moisture meters, and drying mats', 'ଶସ୍ୟ ସଂରକ୍ଷଣ ବ୍ୟାଗ, ତିର୍ପାଲ ଓ ଆର୍ଦ୍ରତା ମାପକ', 'PackageCheck')
ON CONFLICT (id) DO NOTHING;

-- 4. Multi-Vendor Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES public.product_categories(id),
    title_en VARCHAR(200) NOT NULL,
    title_or VARCHAR(200) NOT NULL,
    description_en TEXT NOT NULL,
    description_or TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10,2) CHECK (original_price >= price),
    unit VARCHAR(50) NOT NULL DEFAULT 'kg', -- kg | packet | litre | piece | set | bag
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_urls JSONB DEFAULT '[]'::jsonb,
    compatible_crops JSONB DEFAULT '[]'::jsonb,
    target_pests JSONB DEFAULT '[]'::jsonb,
    is_organic BOOLEAN DEFAULT FALSE,
    is_chemical_regulated BOOLEAN DEFAULT FALSE,
    cibrc_registration_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | inactive | out_of_stock | under_review
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
    total_reviews INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Inventory Ledger
CREATE TABLE IF NOT EXISTS public.product_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Shopping Carts & Items
CREATE TABLE IF NOT EXISTS public.shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- 7. Parent Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    farmer_name VARCHAR(150) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL DEFAULT 'bargarh',
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'ONLINE', -- ONLINE | UPI | COD
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING | PAID | FAILED | REFUNDED
    order_status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- PENDING_PAYMENT | CONFIRMED | PROCESSING | SHIPPED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | REFUND_REQUESTED | REFUNDED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Seller Sub-Orders (Multi-Vendor Order Splitting)
CREATE TABLE IF NOT EXISTS public.seller_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    suborder_number VARCHAR(60) UNIQUE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_earnings NUMERIC(10,2) NOT NULL,
    fulfilment_status VARCHAR(50) NOT NULL DEFAULT 'PROCESSING', -- PROCESSING | SHIPPED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED
    tracking_number VARCHAR(100),
    shipping_carrier VARCHAR(100),
    payout_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING | PROCESSED | REVERSED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_order_id UUID REFERENCES public.seller_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title VARCHAR(200) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Payment Transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    gateway_name VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY_INDIA',
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(255),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED', -- INITIATED | AUTHORIZED | CAPTURED | FAILED | REFUNDED
    idempotency_key VARCHAR(100) UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Product Reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    farmer_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_seller_orders_seller ON public.seller_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_order ON public.seller_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
