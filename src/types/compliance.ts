// ─────────────────────────────────────────────────────────────────────────────
// Compliance endpoints (EU AI Act, GDPR)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mirrors the spend-log fields needed for compliance evaluation.
 * Sent to both /compliance/eu-ai-act and /compliance/gdpr.
 */
export interface ComplianceCheckRequest {
  request_id: string;
  user_id?: string | null;
  model?: string | null;
  timestamp?: string | null;
  guardrail_information?: Array<Record<string, unknown>> | null;
  [key: string]: unknown;
}

/** Outcome of a single compliance check (one article / clause). */
export interface ComplianceCheckResult {
  check_name: string;
  article: string;
  passed: boolean;
  detail: string;
  [key: string]: unknown;
}

/** Response body returned by /compliance/eu-ai-act and /compliance/gdpr. */
export interface ComplianceResponse {
  compliant: boolean;
  regulation: string;
  checks: ComplianceCheckResult[];
  [key: string]: unknown;
}

export type ComplianceEuAiActParams = ComplianceCheckRequest;
export type ComplianceEuAiActResponse = ComplianceResponse;
export type ComplianceGdprParams = ComplianceCheckRequest;
export type ComplianceGdprResponse = ComplianceResponse;
