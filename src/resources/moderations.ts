import type { ModerationCreateParams, ModerationResponse } from '../types/moderations';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class ModerationsResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/moderations */
  create(
    params: ModerationCreateParams,
    options?: RequestOptions,
  ): Promise<ModerationResponse> {
    return this.request<ModerationResponse>({
      method: 'POST',
      path: '/v1/moderations',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
