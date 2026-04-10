import type {
  KeyCreateParams,
  KeyCreateResponse,
  KeyUpdateParams,
  KeyDeleteParams,
  KeyDeleteResponse,
  KeyInfoResponse,
} from '../types/keys';
import type { RequestFn } from '../client';

export class KeysResource {
  constructor(private request: RequestFn) {}

  async create(params: KeyCreateParams): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>('POST', '/key/generate', params);
  }

  async update(params: KeyUpdateParams): Promise<unknown> {
    return this.request('POST', '/key/update', params);
  }

  async delete(params: KeyDeleteParams): Promise<KeyDeleteResponse> {
    return this.request<KeyDeleteResponse>('POST', '/key/delete', params);
  }

  async info(key: string): Promise<KeyInfoResponse> {
    return this.request<KeyInfoResponse>('GET', `/key/info?key=${encodeURIComponent(key)}`);
  }
}
