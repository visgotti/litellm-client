// ─────────────────────────────────────────────────────────────────────────────
// CloudZero billing integration
// ─────────────────────────────────────────────────────────────────────────────

/** Request payload for `POST /cloudzero/init`. */
export interface CloudZeroInitParams {
  /** CloudZero API key for authentication. */
  api_key: string;
  /** CloudZero connection ID for data submission. */
  connection_id: string;
  /** Timezone for date handling (default: "UTC"). */
  timezone?: string;
}

/** Response from `POST /cloudzero/init`, `PUT /cloudzero/settings`, and `DELETE /cloudzero/delete`. */
export interface CloudZeroInitResponse {
  message: string;
  status: string;
}

/** Request payload for `PUT /cloudzero/settings`. All fields optional, but the proxy requires at least one. */
export interface CloudZeroSettingsUpdateParams {
  /** New CloudZero API key for authentication. */
  api_key?: string | null;
  /** New CloudZero connection ID for data submission. */
  connection_id?: string | null;
  /** New timezone for date handling. */
  timezone?: string | null;
}

/** Response from `GET /cloudzero/settings`. Sensitive values are masked. */
export interface CloudZeroSettingsView {
  /** Masked API key showing only first 4 and last 4 characters (null when unset). */
  api_key_masked: string | null;
  /** CloudZero connection ID for data submission. */
  connection_id: string | null;
  /** Timezone for date handling. */
  timezone: string | null;
  /** Configuration status (e.g. "configured", "not_configured"). */
  status: string | null;
}

/** Request payload for `POST /cloudzero/dry-run` and `POST /cloudzero/export`. */
export interface CloudZeroExportParams {
  /** Optional limit on number of records to process. */
  limit?: number | null;
  /** CloudZero operation type (default: "replace_hourly"). */
  operation?: 'replace_hourly' | 'sum' | string;
  /** Start time for data export in UTC (ISO-8601 string). */
  start_time_utc?: string | null;
  /** End time for data export in UTC (ISO-8601 string). */
  end_time_utc?: string | null;
}

/** Response from `POST /cloudzero/dry-run` and `POST /cloudzero/export`. */
export interface CloudZeroExportResponse {
  message: string;
  status: string;
  records_exported: number | null;
  /** Dry-run data including raw usage data and CBF transformed data. */
  dry_run_data: Record<string, unknown> | null;
  /** Summary statistics for the run. */
  summary: Record<string, unknown> | null;
}
