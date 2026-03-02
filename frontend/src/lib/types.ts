export interface Company {
  id: string;
  name: string;
  slug: string;
  instance_url: string;
  status: "online" | "slow" | "offline" | "unknown";
  version: string | null;
  contact_name: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyDetail extends Company {
  user_count: number | null;
  model_count: number | null;
  knowledge_count: number | null;
  group_count: number | null;
}

export interface CompanyCreate {
  name: string;
  slug: string;
  instance_url: string;
  api_key: string;
  contact_name?: string;
  contact_email?: string;
}

export interface CompanyUpdate {
  name?: string;
  instance_url?: string;
  api_key?: string;
  contact_name?: string;
  contact_email?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface HealthCheckResult {
  id: string;
  company_id: string;
  status_code: number | null;
  response_time_ms: number | null;
  version: string | null;
  error_message: string | null;
  checked_at: string;
}

export interface CompanyHealthStatus {
  company_id: string;
  company_name: string;
  company_slug: string;
  instance_url: string;
  status: string;
  status_code: number | null;
  response_time_ms: number | null;
  version: string | null;
  last_checked: string | null;
}

export interface HealthSummary {
  total: number;
  online: number;
  slow: number;
  offline: number;
  unknown: number;
  statuses: CompanyHealthStatus[];
}

// Phase 2 types

export interface OWUIUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image_url?: string;
  group_ids?: string[];
  last_active_at?: number;
  created_at?: number;
  updated_at?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  profile_image_url?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  data?: Record<string, unknown>;
  created_at?: number;
  updated_at?: number;
  files?: KBFile[];
}

export interface KBFile {
  id: string;
  filename: string;
  meta?: Record<string, unknown>;
}

export interface CreateKnowledgeRequest {
  name: string;
  description?: string;
}

export interface OWUIModel {
  id: string;
  name: string;
  owned_by?: string;
  meta?: Record<string, unknown>;
  info?: {
    id?: string;
    base_model_id?: string | null;
    name?: string;
    meta?: {
      description?: string;
      profile_image_url?: string;
      capabilities?: Record<string, boolean>;
      suggestion_prompts?: unknown[];
    };
    params?: Record<string, unknown>;
    access_grants?: unknown[];
    is_active?: boolean;
    updated_at?: number;
    created_at?: number;
  };
  // Normalized fields set by the hook
  base_model_id?: string | null;
  is_active?: boolean;
  created_at?: number;
  updated_at?: number;
}

export interface OWUIGroup {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, unknown>;
  user_ids?: string[];
  member_count?: number;
  data?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  created_at?: number;
  updated_at?: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  permissions?: Record<string, unknown>;
  user_ids?: string[];
}

export interface UserPermissions {
  workspace?: {
    models?: boolean;
    knowledge?: boolean;
    prompts?: boolean;
    tools?: boolean;
  };
  chat?: {
    file_upload?: boolean;
    delete?: boolean;
    edit?: boolean;
    temporary?: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
