-- Krushi Mitra AI - Row Level Security (RLS) Policies
-- Migration: 20260101000001_rls_policies.sql

-- Enable RLS across all tables
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Public reference tables are readable by everyone
CREATE POLICY "Allow public read access to crops" 
ON public.crops FOR SELECT USING (true);

CREATE POLICY "Allow public read access to pest species" 
ON public.pest_species FOR SELECT USING (true);

-- 2. Farmer profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.farmer_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.farmer_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.farmer_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Scan Reports Policies
CREATE POLICY "Users can view their own scans" 
ON public.scan_reports FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL OR is_sample_scan = true);

CREATE POLICY "Users can create scan reports" 
ON public.scan_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. Treatment logs policies
CREATE POLICY "Users can view their own treatment logs" 
ON public.treatment_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own treatment logs" 
ON public.treatment_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Follow-up scans policies
CREATE POLICY "Users can view their own follow-up scans" 
ON public.followup_scans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert follow-up scans" 
ON public.followup_scans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Expert Reviews Policies
CREATE POLICY "Experts can view escalated scans" 
ON public.expert_reviews FOR SELECT 
USING (true);

CREATE POLICY "Experts can update reviews" 
ON public.expert_reviews FOR UPDATE 
USING (auth.uid() = expert_user_id);
