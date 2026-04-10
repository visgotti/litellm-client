import type {
  ModelListResponse,
  ModelInfoResponse,
  ModelCreateParams,
  ModelDeleteParams,
} from '../types/models';
import type { RequestFn } from '../client';

export class ModelsResource {
  constructor(private request: RequestFn) {}

  async list(): Promise<ModelListResponse> {
    return this.request<ModelListResponse>('GET', '/v1/models');
  }

  async info(): Promise<ModelInfoResponse> {
    return this.request<ModelInfoResponse>('GET', '/model/info');
  }

  async create(params: ModelCreateParams): Promise<unknown> {
    return this.request('POST', '/model/new', params);
  }

  async delete(params: ModelDeleteParams): Promise<unknown> {
    return this.request('POST', '/model/delete', params);
  }
}
