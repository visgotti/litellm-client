// ─────────────────────────────────────────────────────────────────────────────
// Models – List & Info
// ─────────────────────────────────────────────────────────────────────────────

export interface ModelPermission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: string | null;
  is_blocking: boolean;
}

export interface ModelObject {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ModelListResponse {
  object: 'list';
  data: ModelObject[];
}

export interface ModelInfoEntry {
  model_name: string;
  litellm_params: Record<string, unknown>;
  model_info: Record<string, unknown>;
}

export interface ModelInfoResponse {
  data: ModelInfoEntry[];
}

// ─── Model management (admin) ────────────────────────────────────────────────

export interface ModelCreateParams {
  model_name: string;
  litellm_params: {
    model: string;
    api_key?: string;
    api_base?: string;
    [key: string]: unknown;
  };
  model_info?: Record<string, unknown>;
}

export interface ModelDeleteParams {
  id: string;
}
