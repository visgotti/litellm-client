// ─────────────────────────────────────────────────────────────────────────────
// Compliance endpoints (EU AI Act, GDPR)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mirrors the spend-log fields needed for compliance evaluation.
 * Sent to both /compliance/eu-ai-act and /compliance/gdpr.
 *
 * @see https://docs.litellm.ai/docs/proxy/audit_logs
 */
export interface ComplianceCheckRequest {
  /** Identifier of the request being evaluated. */
  request_id: string;
  /** Identifier of the end-user attached to the request. */
  user_id?: string | null;
  /** Model that served the request. */
  model?: string | null;
  /** ISO-8601 timestamp of the request. */
  timestamp?: string | null;
  /** Guardrail evaluations attached to the request. */
  guardrail_information?: Array<Record<string, unknown>> | null;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}

/**
 * Outcome of a single compliance check (one article / clause).
 *
 * @see https://docs.litellm.ai/docs/proxy/audit_logs
 */
export interface ComplianceCheckResult {
  /** Internal identifier for the check. */
  check_name: string;
  /** Regulation article / clause being evaluated. */
  article: string;
  /** `true` if the check passed. */
  passed: boolean;
  /** Human-readable detail explaining the outcome. */
  detail: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response body returned by /compliance/eu-ai-act and /compliance/gdpr.
 *
 * @see https://docs.litellm.ai/docs/proxy/audit_logs
 */
export interface ComplianceResponse {
  /** `true` if all checks passed. */
  compliant: boolean;
  /** Regulation evaluated (e.g. `'EU AI Act'`, `'GDPR'`). */
  regulation: string;
  /** Per-article check results. */
  checks: ComplianceCheckResult[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type ComplianceEuAiActParams = ComplianceCheckRequest;
export type ComplianceEuAiActResponse = ComplianceResponse;
export type ComplianceGdprParams = ComplianceCheckRequest;
export type ComplianceGdprResponse = ComplianceResponse;
