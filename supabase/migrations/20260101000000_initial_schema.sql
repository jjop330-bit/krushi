-- Krushi Mitra AI - Production Supabase PostgreSQL Schema
-- Migration: 20260101000000_initial_schema.sql

-- 1. Supported Crop Types
CREATE TABLE IF NOT EXISTS public.crops (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_or VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    status VARCHAR(50) DEFAULT 'active', -- active | in_validation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Verified Pest Species Knowledge Base
CREATE TABLE IF NOT EXISTS public.pest_species (
    id VARCHAR(50) PRIMARY KEY,
    crop_id VARCHAR(50) REFERENCES public.crops(id) ON DELETE SET NULL,
    common_name_en VARCHAR(150) NOT NULL,
    common_name_or VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    local_odisha_name VARCHAR(150),
    potential_damage VARCHAR(200),
    etl_condition_en TEXT,
    etl_condition_or TEXT,
    is_beneficial BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Farmer User Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    phone_number VARCHAR(20),
    district VARCHAR(100) NOT NULL DEFAULT 'bargarh',
    block VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'or',
    land_size_acres NUMERIC(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pest Scan Diagnostic Reports
CREATE TABLE IF NOT EXISTS public.scan_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    crop_id VARCHAR(50) REFERENCES public.crops(id),
    pest_id VARCHAR(50) REFERENCES public.pest_species(id),
    image_storage_url TEXT NOT NULL,
    confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    certainty_tier VARCHAR(20) NOT NULL DEFAULT 'moderate', -- high | moderate | uncertain
    severity_assessment VARCHAR(20) NOT NULL DEFAULT 'Moderate', -- Low | Moderate | Severe | Critical
    observed_visual_features JSONB DEFAULT '[]'::jsonb,
    ai_inferred_damage_en TEXT,
    ai_inferred_damage_or TEXT,
    potential_yield_loss_range VARCHAR(100),
    immediate_actions_en JSONB DEFAULT '[]'::jsonb,
    immediate_actions_or JSONB DEFAULT '[]'::jsonb,
    expert_review_required BOOLEAN DEFAULT FALSE,
    source_model VARCHAR(100) NOT NULL,
    farmer_district VARCHAR(100) DEFAULT 'bargarh',
    is_sample_scan BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applied Treatment Logs
CREATE TABLE IF NOT EXISTS public.treatment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scan_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL, -- biological | cultural | chemical
    method_name VARCHAR(200) NOT NULL,
    dosage_notes TEXT,
    weather_condition TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Longitudinal Follow-up Inspections
CREATE TABLE IF NOT EXISTS public.followup_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scan_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    days_after_treatment INT NOT NULL,
    image_storage_url TEXT,
    symptom_trend VARCHAR(50) NOT NULL DEFAULT 'stable', -- improving | stable | worsening
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KVK & Agricultural Expert Reviews
CREATE TABLE IF NOT EXISTS public.expert_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scan_reports(id) ON DELETE CASCADE,
    expert_user_id UUID REFERENCES auth.users(id),
    kvk_name VARCHAR(150),
    status VARCHAR(50) DEFAULT 'pending_review', -- pending_review | confirmed | reclassified
    verified_pest_id VARCHAR(50) REFERENCES public.pest_species(id),
    official_advisory TEXT,
    reviewed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scan_reports_user ON public.scan_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_reports_district ON public.scan_reports(farmer_district);
CREATE INDEX IF NOT EXISTS idx_scan_reports_pest ON public.scan_reports(pest_id);
CREATE INDEX IF NOT EXISTS idx_treatment_logs_scan ON public.treatment_logs(scan_id);
CREATE INDEX IF NOT EXISTS idx_followup_scans_scan ON public.followup_scans(scan_id);
