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

  /**
   * Run an EU AI Act compliance check / report against the supplied payload.
   *
   * @param params - The compliance check input.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The EU AI Act compliance result.
   *
   * @see https://docs.litellm.ai/docs/proxy/audit_logs
   */
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

  /**
   * Run a GDPR compliance check / report against the supplied payload.
   *
   * @param params - The compliance check input.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The GDPR compliance result.
   *
   * @see https://docs.litellm.ai/docs/proxy/audit_logs
   */
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
