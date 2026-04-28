// ─────────────────────────────────────────────────────────────────────────────
// Cost endpoints — estimate, discount config, margin config
// ─────────────────────────────────────────────────────────────────────────────

/** POST /cost/estimate — request body. */
export interface CostEstimateParams {
  /** Model name (from /model_group/info). */
  model: string;
  /** Expected input tokens per request (>= 0). */
  input_tokens: number;
  /** Expected output tokens per request (>= 0). */
  output_tokens: number;
  /** Number of requests per day (>= 0). */
  num_requests_per_day?: number | null;
  /** Number of requests per month (>= 0). */
  num_requests_per_month?: number | null;
}

/** POST /cost/estimate — response body. */
export interface CostEstimateResponse {
  model: string;
  input_tokens: number;
  output_tokens: number;
  num_requests_per_day?: number | null;
  num_requests_per_month?: number | null;
  // Per-request costs
  cost_per_request: number;
  input_cost_per_request: number;
  output_cost_per_request: number;
  margin_cost_per_request: number;
  // Daily costs
  daily_cost?: number | null;
  daily_input_cost?: number | null;
  daily_output_cost?: number | null;
  daily_margin_cost?: number | null;
  // Monthly costs
  monthly_cost?: number | null;
  monthly_input_cost?: number | null;
  monthly_output_cost?: number | null;
  monthly_margin_cost?: number | null;
  // Pricing info
  input_cost_per_token?: number | null;
  output_cost_per_token?: number | null;
  provider?: string | null;
  [key: string]: unknown;
}

// ─── Discount config ────────────────────────────────────────────────────────

/** GET /config/cost_discount_config — response. */
export interface CostDiscountConfigGetResponse {
  /** Map of provider name to discount fraction (0..1). */
  values: Record<string, number>;
  [key: string]: unknown;
}

/**
 * PATCH /config/cost_discount_config — request body.
 * Map of provider name (must match `LlmProvidersSet`) to discount fraction (0..1).
 */
export type CostDiscountConfigUpdateParams = Record<string, number>;

/** PATCH /config/cost_discount_config — response. */
export interface CostDiscountConfigUpdateResponse {
  message: string;
  status: string;
  values: Record<string, number>;
  [key: string]: unknown;
}

// ─── Margin config ──────────────────────────────────────────────────────────

/**
 * Margin entry — accepts a flat percentage (number) or a structured override
 * (e.g. `{ percentage: 0.1, fixed: 0.001 }`).
 */
export type CostMarginEntry = number | Record<string, number>;

/** GET /config/cost_margin_config — response. */
export interface CostMarginConfigGetResponse {
  values: Record<string, CostMarginEntry>;
  [key: string]: unknown;
}

/** PATCH /config/cost_margin_config — request body. */
export type CostMarginConfigUpdateParams = Record<string, CostMarginEntry>;

/** PATCH /config/cost_margin_config — response. */
export interface CostMarginConfigUpdateResponse {
  message: string;
  status: string;
  values: Record<string, CostMarginEntry>;
  [key: string]: unknown;
}
