// ─────────────────────────────────────────────────────────────────────────────
// Cost endpoints — estimate, discount config, margin config
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /cost/estimate — request body.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
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

/**
 * POST /cost/estimate — response body.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface CostEstimateResponse {
  /** Echo of the requested model. */
  model: string;
  /** Echo of `input_tokens`. */
  input_tokens: number;
  /** Echo of `output_tokens`. */
  output_tokens: number;
  /** Echo of `num_requests_per_day`. */
  num_requests_per_day?: number | null;
  /** Echo of `num_requests_per_month`. */
  num_requests_per_month?: number | null;
  // Per-request costs
  /** Total cost (USD) per request. */
  cost_per_request: number;
  /** Cost (USD) of the prompt tokens per request. */
  input_cost_per_request: number;
  /** Cost (USD) of the completion tokens per request. */
  output_cost_per_request: number;
  /** Margin cost (USD) added per request. */
  margin_cost_per_request: number;
  // Daily costs
  /** Total daily cost (USD). */
  daily_cost?: number | null;
  /** Daily input-token cost (USD). */
  daily_input_cost?: number | null;
  /** Daily output-token cost (USD). */
  daily_output_cost?: number | null;
  /** Daily margin cost (USD). */
  daily_margin_cost?: number | null;
  // Monthly costs
  /** Total monthly cost (USD). */
  monthly_cost?: number | null;
  /** Monthly input-token cost (USD). */
  monthly_input_cost?: number | null;
  /** Monthly output-token cost (USD). */
  monthly_output_cost?: number | null;
  /** Monthly margin cost (USD). */
  monthly_margin_cost?: number | null;
  // Pricing info
  /** Per-token input price (USD). */
  input_cost_per_token?: number | null;
  /** Per-token output price (USD). */
  output_cost_per_token?: number | null;
  /** Provider that prices the model. */
  provider?: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Discount config ────────────────────────────────────────────────────────

/**
 * GET /config/cost_discount_config — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface CostDiscountConfigGetResponse {
  /** Map of provider name to discount fraction (0..1). */
  values: Record<string, number>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * PATCH /config/cost_discount_config — request body.
 * Map of provider name (must match `LlmProvidersSet`) to discount fraction (0..1).
 */
export type CostDiscountConfigUpdateParams = Record<string, number>;

/**
 * PATCH /config/cost_discount_config — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface CostDiscountConfigUpdateResponse {
  /** Human-readable status. */
  message: string;
  /** Outcome marker. */
  status: string;
  /** Updated discount values. */
  values: Record<string, number>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Margin config ──────────────────────────────────────────────────────────

/**
 * Margin entry — accepts a flat percentage (number) or a structured override
 * (e.g. `{ percentage: 0.1, fixed: 0.001 }`).
 */
export type CostMarginEntry = number | Record<string, number>;

/**
 * GET /config/cost_margin_config — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface CostMarginConfigGetResponse {
  /** Map of provider name to margin entry. */
  values: Record<string, CostMarginEntry>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** PATCH /config/cost_margin_config — request body. */
export type CostMarginConfigUpdateParams = Record<string, CostMarginEntry>;

/**
 * PATCH /config/cost_margin_config — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface CostMarginConfigUpdateResponse {
  /** Human-readable status. */
  message: string;
  /** Outcome marker. */
  status: string;
  /** Updated margin values. */
  values: Record<string, CostMarginEntry>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
