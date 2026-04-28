import type {
  ComplianceEuAiActParams,
  ComplianceEuAiActResponse,
  ComplianceGdprParams,
  ComplianceGdprResponse,
} from '../types/compliance';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class ComplianceResource {
  constructor(private request: RequestFn) {}

  /** POST /compliance/eu-ai-act */
  euAiAct(
    params: ComplianceEuAiActParams,
    options?: RequestOptions,
  ): Promise<ComplianceEuAiActResponse> {
    return this.request<ComplianceEuAiActResponse>({
      method: 'POST',
      path: '/compliance/eu-ai-act',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /compliance/gdpr */
  gdpr(
    params: ComplianceGdprParams,
    options?: RequestOptions,
  ): Promise<ComplianceGdprResponse> {
    return this.request<ComplianceGdprResponse>({
      method: 'POST',
      path: '/compliance/gdpr',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
