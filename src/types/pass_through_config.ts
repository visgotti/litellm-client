// ─────────────────────────────────────────────────────────────────────────────
// Pass-Through Endpoint Config CRUD
// Mirrors the admin-side CRUD in
// litellm/proxy/pass_through_endpoints/pass_through_endpoints.py for *registering*
// custom pass-through endpoints (distinct from `client.passThrough.*`, which
// serves passthrough requests).
//
// Underlying schema is `PassThroughGenericEndpoint` from
// litellm/proxy/_types.py. Methods are typed openly so new fields land
// without breaking SDK callers.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic pass-through endpoint definition stored in the proxy config.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
 */
export interface PassThroughEndpointDefinition {
  /** Stable id of the endpoint (auto-generated on create if omitted). */
  id?: string;
  /** Path mounted on the proxy (e.g. `/my-vendor/v1`). */
  path?: string;
  /** Upstream URL to proxy to. */
  target?: string;
  /** Custom headers to forward. */
  headers?: Record<string, string> | null;
  /** Allowed HTTP methods. */
  methods?: string[] | null;
  /** Whether sub-paths after `path` are forwarded. */
  include_subpath?: boolean;
  /** Cost charged per request (USD). */
  cost_per_request?: number | null;
  /** Default query parameters merged into upstream requests. */
  default_query_params?: Record<string, unknown> | null;
  /** Guardrails that should run on the endpoint. */
  guardrails?: string[] | null;
  /** Whether the row is loaded from the static config file (read-only). */
  is_from_config?: boolean;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET/POST/DELETE /config/pass_through_endpoint`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
 */
export interface PassThroughEndpointResponse {
  /** Endpoint definitions. */
  endpoints: PassThroughEndpointDefinition[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /config/pass_through_endpoint`. */
export interface PassThroughEndpointListParams {
  /** Filter to a single endpoint id. */
  endpoint_id?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Required query parameter for `DELETE /config/pass_through_endpoint`. */
export interface PassThroughEndpointDeleteParams {
  /** Endpoint id to delete. */
  endpoint_id: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
