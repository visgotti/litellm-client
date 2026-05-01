// ─────────────────────────────────────────────────────────────────────────────
// Logging Callback Listing (read-only)
// Mirrors litellm/proxy/management_endpoints/callback_management_endpoints.py
// and the `CallbacksByType` model in
// litellm/litellm_core_utils/logging_callback_manager.py.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Currently-registered proxy callbacks, grouped by callback type.
 *
 * The proxy returns a `CallbacksByType` Pydantic model (`success`, `failure`,
 * `success_and_failure`, etc.) — keys are stable but the SDK keeps the shape
 * open since new callback buckets are added periodically.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/callback_management_endpoints.py
 */
export interface CallbacksByTypeResponse {
  /** Callbacks invoked on successful requests. */
  success?: string[];
  /** Callbacks invoked on failed requests. */
  failure?: string[];
  /** Callbacks invoked on both success and failure. */
  success_and_failure?: string[];
  /** Forward-compat passthrough for new callback buckets. */
  [key: string]: unknown;
}

/**
 * One row from the available-callback-config catalog.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/callback_management_endpoints.py
 */
export interface CallbackConfig {
  /** Callback identifier (e.g. `langfuse`, `helicone`). */
  name?: string;
  /** Display label. */
  label?: string;
  /** Long description. */
  description?: string;
  /** Configurable parameters and their metadata. */
  fields?: Array<Record<string, unknown>>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /callbacks/configs`.
 *
 * The endpoint returns a JSON object keyed by callback name; values are
 * config descriptors. Modeled as an open record + index sig for
 * forward-compat.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/callback_management_endpoints.py
 */
export type CallbackConfigsResponse = Record<string, CallbackConfig>;
