export type JobStatus =
  | "draft"
  | "published"
  | "paused"
  | "closed"
  | "archived";

export type WorkMode = "onsite" | "hybrid" | "remote";

export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "rejected"
  | "accepted"
  | "withdrawn";

export type PrivacyRequestType = "export" | "delete" | "rectify";

export type PrivacyRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "rejected";

export type AdminRole = "admin" | "super_admin";

export type ProfileVisibility = "private" | "recruiters" | "public";

export type ResumeParsingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          headline: string | null;
          location: string | null;
          bio: string | null;
          skills: string[];
          preferences: Json;
          profile_visibility: ProfileVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          location?: string | null;
          bio?: string | null;
          skills?: string[];
          preferences?: Json;
          profile_visibility?: ProfileVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          location?: string | null;
          bio?: string | null;
          skills?: string[];
          preferences?: Json;
          profile_visibility?: ProfileVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: AdminRole;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: AdminRole;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          location: string | null;
          employment_type: string | null;
          department: string | null;
          industry: string | null;
          work_mode: WorkMode | null;
          experience_level: ExperienceLevel | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          status: JobStatus;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          location?: string | null;
          employment_type?: string | null;
          department?: string | null;
          industry?: string | null;
          work_mode?: WorkMode | null;
          experience_level?: ExperienceLevel | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          status?: JobStatus;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          location?: string | null;
          employment_type?: string | null;
          department?: string | null;
          industry?: string | null;
          work_mode?: WorkMode | null;
          experience_level?: ExperienceLevel | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          status?: JobStatus;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          storage_path: string;
          file_name: string | null;
          mime_type: string | null;
          byte_size: number | null;
          is_primary: boolean;
          parsed_data: Json;
          parsing_status: ResumeParsingStatus;
          parsing_error_category: string | null;
          extracted_data: Json;
          extraction_confidence: Json;
          parsed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          storage_path: string;
          file_name?: string | null;
          mime_type?: string | null;
          byte_size?: number | null;
          is_primary?: boolean;
          parsed_data?: Json;
          parsing_status?: ResumeParsingStatus;
          parsing_error_category?: string | null;
          extracted_data?: Json;
          extraction_confidence?: Json;
          parsed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          storage_path?: string;
          file_name?: string | null;
          mime_type?: string | null;
          byte_size?: number | null;
          is_primary?: boolean;
          parsed_data?: Json;
          parsing_status?: ResumeParsingStatus;
          parsing_error_category?: string | null;
          extracted_data?: Json;
          extraction_confidence?: Json;
          parsed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_processing_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: "upload" | "parse";
          resume_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: "upload" | "parse";
          resume_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: "upload" | "parse";
          resume_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          resume_id: string | null;
          status: ApplicationStatus;
          cover_letter: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          candidate_id: string;
          resume_id?: string | null;
          status?: ApplicationStatus;
          cover_letter?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          candidate_id?: string;
          resume_id?: string | null;
          status?: ApplicationStatus;
          cover_letter?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      privacy_requests: {
        Row: {
          id: string;
          user_id: string;
          request_type: PrivacyRequestType;
          status: PrivacyRequestStatus;
          details: string | null;
          admin_notes: string | null;
          processed_by: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_type: PrivacyRequestType;
          status?: PrivacyRequestStatus;
          details?: string | null;
          admin_notes?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_type?: PrivacyRequestType;
          status?: PrivacyRequestStatus;
          details?: string | null;
          admin_notes?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      grant_admin_by_email: {
        Args: {
          admin_email: string;
          admin_role?: AdminRole;
        };
        Returns: undefined;
      };
      export_candidate_data: {
        Args: { target_user_id: string };
        Returns: Json;
      };
      withdraw_application: {
        Args: { p_application_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      job_status: JobStatus;
      application_status: ApplicationStatus;
      privacy_request_type: PrivacyRequestType;
      privacy_request_status: PrivacyRequestStatus;
      admin_role: AdminRole;
      profile_visibility: ProfileVisibility;
      work_mode: WorkMode;
      experience_level: ExperienceLevel;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
