export type ExpertStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type ProblemCategory = 
  | 'pest_insect'
  | 'crop_disease'
  | 'soil_health'
  | 'fertilizer'
  | 'irrigation'
  | 'crop_management'
  | 'weather'
  | 'harvesting'
  | 'other';

export type ContactMethod = 'chat' | 'callback' | 'schedule';

export type SupportRequestStatus = 
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ESCALATED';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';

export interface ExpertProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  phone_number?: string;
  institution: string;
  qualification: string;
  specialization: string;
  experience_years: number;
  languages: string[];
  location_district: string;
  consultation_modes: string[];
  status: ExpertStatus;
  rating: number;
  total_consultations: number;
  is_available: boolean;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  request_id: string;
  sender_type: 'farmer' | 'expert' | 'system';
  sender_id: string;
  sender_name: string;
  message_text: string;
  attachments: string[];
  is_read: boolean;
  created_at: string;
}

export interface SupportAuditLog {
  id: string;
  request_id: string;
  previous_status: string;
  new_status: string;
  actor_id: string;
  actor_role: string;
  reason?: string;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  reference_number: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  farmer_district: string;
  crop_id?: string;
  problem_category: ProblemCategory;
  description: string;
  preferred_language: 'or' | 'en';
  contact_method: ContactMethod;
  preferred_date?: string;
  preferred_time_slot?: string;
  ai_scan_id?: string;
  ai_diagnosis_summary?: {
    pest_id?: string;
    pest_name?: string;
    confidence?: number;
    severity?: string;
    observed_symptoms?: string[];
  };
  image_attachments: string[];
  priority: Priority;
  assigned_expert_id?: string;
  assigned_expert_name?: string;
  status: SupportRequestStatus;
  resolution_notes?: string;
  farmer_feedback_rating?: number;
  farmer_feedback_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  request_id: string;
  expert_id: string;
  expert_name: string;
  farmer_name: string;
  farmer_phone: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  consultation_type: string;
  status: string;
  meeting_link_or_phone?: string;
  advisory_summary?: string;
  completed_at?: string;
  created_at: string;
}
