-- Krushi Mitra AI - Agricultural Expert Support, Consultations & Live Chat Schema
-- Migration: 20260101000003_expert_support_schema.sql

-- 1. Agricultural Expert Profiles
CREATE TABLE IF NOT EXISTS public.expert_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    email VARCHAR(150),
    phone_number VARCHAR(20),
    institution VARCHAR(200) NOT NULL, -- e.g. 'OUAT Bhubaneswar', 'KVK Bargarh', 'ICAR-NRRI Cuttack'
    qualification VARCHAR(200) NOT NULL, -- e.g. 'Ph.D. in Entomology', 'M.Sc. in Plant Pathology'
    specialization VARCHAR(150) NOT NULL, -- e.g. 'Entomology & Pest Management', 'Plant Pathology & Fungal Diseases'
    experience_years INT NOT NULL DEFAULT 5,
    languages JSONB DEFAULT '["Odia", "English", "Hindi"]'::jsonb,
    location_district VARCHAR(100) NOT NULL DEFAULT 'Bargarh',
    consultation_modes JSONB DEFAULT '["chat", "callback", "schedule"]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED', -- PENDING | VERIFIED | REJECTED | SUSPENDED
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.9,
    total_consultations INT NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Expert Availability Schedules
CREATE TABLE IF NOT EXISTS public.expert_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Support Requests (Pest Advisory, Callback, Chat & Appointments)
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id VARCHAR(100) NOT NULL,
    farmer_name VARCHAR(150) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    farmer_district VARCHAR(100) NOT NULL DEFAULT 'bargarh',
    crop_id VARCHAR(50) REFERENCES public.crops(id) ON DELETE SET NULL,
    problem_category VARCHAR(50) NOT NULL, -- pest_insect | crop_disease | soil_health | fertilizer | irrigation | crop_management | weather | harvesting | other
    description TEXT NOT NULL,
    voice_note_url TEXT,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'or', -- or | en
    contact_method VARCHAR(30) NOT NULL DEFAULT 'chat', -- chat | callback | schedule
    preferred_date DATE,
    preferred_time_slot VARCHAR(50),
    ai_scan_id VARCHAR(100), -- Reference to scan report
    ai_diagnosis_summary JSONB, -- Contextual crop, pest, confidence, observed symptoms
    image_attachments JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- LOW | NORMAL | HIGH | EMERGENCY
    assigned_expert_id UUID REFERENCES public.expert_profiles(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED | ASSIGNED | ACCEPTED | IN_PROGRESS | RESOLVED | REJECTED | CANCELLED | ESCALATED
    resolution_notes TEXT,
    farmer_feedback_rating INT CHECK (farmer_feedback_rating >= 1 AND farmer_feedback_rating <= 5),
    farmer_feedback_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Persistent Support Messages (Live Chat Thread)
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.support_requests(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- farmer | expert | system
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    message_text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scheduled Consultations & Callbacks
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.support_requests(id) ON DELETE CASCADE,
    expert_id UUID REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time_slot VARCHAR(50) NOT NULL,
    consultation_type VARCHAR(30) NOT NULL DEFAULT 'callback', -- callback | scheduled_call | chat_session
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED | COMPLETED | MISSED | RESCHEDULED | CANCELLED
    meeting_link_or_phone VARCHAR(200),
    advisory_summary TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Support Audit Trail
CREATE TABLE IF NOT EXISTS public.support_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.support_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(30) NOT NULL, -- farmer | expert | admin | system
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_requests_farmer ON public.support_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_expert ON public.support_requests(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_request ON public.support_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_consultations_request ON public.consultations(request_id);
CREATE INDEX IF NOT EXISTS idx_consultations_expert ON public.consultations(expert_id);
CREATE INDEX IF NOT EXISTS idx_support_audit_request ON public.support_audit_logs(request_id);
