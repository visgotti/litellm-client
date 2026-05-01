import type {
  EmailEventSettingsResponse,
  EmailEventSettingsUpdateParams,
  EmailEventSettingsResetResponse,
} from '../types/email_events';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Email Event Settings — controls which events the proxy sends email
 * notifications for (e.g. key created, user added, budget threshold reached).
 */
export class EmailEventsResource {
  constructor(private request: RequestFn) {}

  /** `GET /email/event_settings` — fetch all event toggles. */
  async getSettings(options?: RequestOptions): Promise<EmailEventSettingsResponse> {
    return this.request<EmailEventSettingsResponse>({
      method: 'GET',
      path: '/email/event_settings',
      options,
    });
  }

  /** `PATCH /email/event_settings` — replace the configured event toggles. */
  async updateSettings(
    params: EmailEventSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/email/event_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `POST /email/event_settings/reset` — restore the proxy's default toggles. */
  async resetSettings(options?: RequestOptions): Promise<EmailEventSettingsResetResponse> {
    return this.request<EmailEventSettingsResetResponse>({
      method: 'POST',
      path: '/email/event_settings/reset',
      options,
    });
  }
}
