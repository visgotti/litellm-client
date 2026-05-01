// ─────────────────────────────────────────────────────────────────────────────
// Vantage billing integration
// ─────────────────────────────────────────────────────────────────────────────

/** Request payload for `POST /vantage/init`. */
export interface VantageInitParams {
  /** Vantage API key for authentication. */
  api_key: string;
  /** Vantage integration token for the cost-import endpoint. */
  integration_token: string;
  /** Vantage API base URL (default: "https://api.vantage.sh"). */
  base_url?: string;
}

/** Response from `POST /vantage/init`, `PUT /vantage/settings`, and `DELETE /vantage/delete`. */
export interface VantageInitResponse {
  message: string;
  status: string;
}

/** Request payload for `PUT /vantage/settings`. All fields optional, but the proxy requires at least one. */
export interface VantageSettingsUpdateParams {
  /** New Vantage API key for authentication. */
  api_key?: string | null;
  /** New Vantage integration token. */
  integration_token?: string | null;
  /** New Vantage API base URL. */
  base_url?: string | null;
}

/** Response from `GET /vantage/settings`. Sensitive values are masked. */
export interface VantageSettingsView {
  /** Masked API key showing only first 4 and last 4 characters (null when unset). */
  api_key_masked: string | null;
  /** Masked integration token showing only first 4 and last 4 characters (null when unset). */
  integration_token_masked: string | null;
  /** Vantage API base URL. */
  base_url: string | null;
  /** Configuration status (e.g. "configured", "not_configured"). */
  status: string | null;
}

/** Request payload for `POST /vantage/dry-run`. */
export interface VantageDryRunParams {
  /** Limit on number of records to preview (default: 500). */
  limit?: number | null;
}

/** Request payload for `POST /vantage/export`. */
export interface VantageExportParams {
  /** Optional limit on number of records to export (default: no limit). */
  limit?: number | null;
  /** Start time for data export in UTC (ISO-8601 string). */
  start_time_utc?: string | null;
  /** End time for data export in UTC (ISO-8601 string). */
  end_time_utc?: string | null;
}

/** Response from `POST /vantage/dry-run` and `POST /vantage/export`. */
export interface VantageExportResponse {
  message: string;
  status: string;
  /** Dry-run data including raw usage data and FOCUS transformed data. */
  dry_run_data: Record<string, unknown> | null;
  /** Summary statistics for the run. */
  summary: Record<string, unknown> | null;
}
