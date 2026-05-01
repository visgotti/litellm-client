// ─────────────────────────────────────────────────────────────────────────────
// Router Settings (introspection)
// Mirrors litellm/proxy/management_endpoints/router_settings_endpoints.py and
// the field metadata in
// litellm/types/management_endpoints/router_settings_endpoints.py.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata describing one configurable router setting.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/router_settings_endpoints.py
 */
export interface RouterSettingsField {
  /** Internal field name (matches the Router class attribute). */
  field_name: string;
  /** Type label (e.g. `String`, `Integer`, `Float`, `List`, `Dictionary`). */
  field_type: string;
  /** Current value (null for `/router/fields`). */
  field_value?: unknown;
  /** Human-readable description. */
  field_description: string;
  /** Default value used by the router. */
  field_default?: unknown;
  /** Allowed values when the field is a fixed enum. */
  options?: string[] | null;
  /** User-friendly UI label. */
  ui_field_name: string;
  /** Documentation link, if any. */
  link?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /router/settings`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/router_settings_endpoints.py
 */
export interface RouterSettingsResponse {
  /** Configurable fields with current values. */
  fields: RouterSettingsField[];
  /** Resolved current values keyed by field name. */
  current_values: Record<string, unknown>;
  /** Per-strategy descriptions for the `routing_strategy` field. */
  routing_strategy_descriptions: Record<string, string>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /router/fields`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/router_settings_endpoints.py
 */
export interface RouterFieldsResponse {
  /** Field metadata only (no values). */
  fields: RouterSettingsField[];
  /** Per-strategy descriptions for the `routing_strategy` field. */
  routing_strategy_descriptions: Record<string, string>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
