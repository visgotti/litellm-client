// ─────────────────────────────────────────────────────────────────────────────
// Email event settings
//
// Endpoints:
//   GET   /email/event_settings          → list per-event toggles
//   PATCH /email/event_settings          → update per-event toggles
//   POST  /email/event_settings/reset    → reset to defaults
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single email-event toggle row.
 *
 * The proxy emits one entry per event-type (e.g. `key_created`, `user_added`,
 * `budget_threshold_reached`). The exact `event` discriminator is open-ended,
 * so it is typed as `string` here.
 */
export interface EmailEventSetting {
  /** The event identifier (e.g. `'key_created'`, `'user_added'`, …) */
  event: string;
  /** Whether the email notification for this event is enabled */
  enabled: boolean;
  /** Server may include additional metadata for the UI to render */
  [extra: string]: unknown;
}

/**
 * Response from `GET /email/event_settings`.
 */
export interface EmailEventSettingsResponse {
  /** All known email-event toggles in their current state */
  settings: EmailEventSetting[];
}

/**
 * Request body for `PATCH /email/event_settings`.
 *
 * The full set of event toggles to persist. The server replaces the configured
 * list wholesale, so callers should generally fetch the current list,
 * mutate it locally, and PATCH it back.
 */
export interface EmailEventSettingsUpdateParams {
  /** Updated list of event toggles */
  settings: EmailEventSetting[];
}

/**
 * Response from `POST /email/event_settings/reset`. The server returns a loose
 * object — callers should not rely on a particular shape.
 */
export type EmailEventSettingsResetResponse = Record<string, unknown>;
