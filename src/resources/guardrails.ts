import type {
  ListGuardrailsResponse,
  GuardrailCreateParams,
  GuardrailCreateResponse,
  GuardrailUpdateParams,
  GuardrailUpdateResponse,
  GuardrailPatchParams,
  GuardrailPatchResponse,
  GuardrailDeleteResponse,
  GuardrailInfoResponse,
  GuardrailRegisterParams,
  GuardrailRegisterResponse,
  ListGuardrailSubmissionsParams,
  ListGuardrailSubmissionsResponse,
  GuardrailSubmissionItem,
  GuardrailSubmissionActionResponse,
  GuardrailUIAddSettingsResponse,
  GuardrailUICategoryYamlResponse,
  GuardrailUIMajorAirlinesResponse,
  GuardrailUIProviderSpecificParamsResponse,
  ValidateBlockedWordsFileParams,
  ValidateBlockedWordsFileResponse,
  TestCustomCodeParams,
  TestCustomCodeResponse,
  ApplyGuardrailParams,
  ApplyGuardrailResponse,
  UsageOverviewParams,
  UsageOverviewResponse,
  UsageDetailParams,
  UsageDetailResponse,
  UsageLogsParams,
  UsageLogsResponse,
} from '../types/guardrails';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

type Query = Record<string, string | number | boolean | undefined | null>;

function withQuery(options: RequestOptions | undefined, extra: Query): RequestOptions {
  return {
    ...(options ?? {}),
    query: { ...(options?.query ?? {}), ...extra },
  };
}

/**
 * Guardrails — CRUD, team submissions, UI helpers, custom-code testing, and
 * usage analytics for LiteLLM proxy guardrails.
 */
export class GuardrailsResource {
  constructor(private request: RequestFn) {}

  /** GET /guardrails/list */
  list(options?: RequestOptions): Promise<ListGuardrailsResponse> {
    return this.request<ListGuardrailsResponse>({
      method: 'GET',
      path: '/guardrails/list',
      options,
    });
  }

  /** GET /v2/guardrails/list */
  listV2(options?: RequestOptions): Promise<ListGuardrailsResponse> {
    return this.request<ListGuardrailsResponse>({
      method: 'GET',
      path: '/v2/guardrails/list',
      options,
    });
  }

  /** POST /guardrails */
  create(
    params: GuardrailCreateParams,
    options?: RequestOptions,
  ): Promise<GuardrailCreateResponse> {
    return this.request<GuardrailCreateResponse>({
      method: 'POST',
      path: '/guardrails',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** PUT /guardrails/{id} */
  update(
    id: string,
    params: GuardrailUpdateParams,
    options?: RequestOptions,
  ): Promise<GuardrailUpdateResponse> {
    return this.request<GuardrailUpdateResponse>({
      method: 'PUT',
      path: `/guardrails/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** PATCH /guardrails/{id} */
  patch(
    id: string,
    params: GuardrailPatchParams,
    options?: RequestOptions,
  ): Promise<GuardrailPatchResponse> {
    return this.request<GuardrailPatchResponse>({
      method: 'PATCH',
      path: `/guardrails/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /guardrails/{id} */
  delete(id: string, options?: RequestOptions): Promise<GuardrailDeleteResponse> {
    return this.request<GuardrailDeleteResponse>({
      method: 'DELETE',
      path: `/guardrails/${encodeURIComponent(id)}`,
      options,
    });
  }

  /** GET /guardrails/{id} */
  retrieve(id: string, options?: RequestOptions): Promise<GuardrailInfoResponse> {
    return this.request<GuardrailInfoResponse>({
      method: 'GET',
      path: `/guardrails/${encodeURIComponent(id)}`,
      options,
    });
  }

  /** GET /guardrails/{id}/info — alias of {@link retrieve}. */
  info(id: string, options?: RequestOptions): Promise<GuardrailInfoResponse> {
    return this.request<GuardrailInfoResponse>({
      method: 'GET',
      path: `/guardrails/${encodeURIComponent(id)}/info`,
      options,
    });
  }

  /** POST /guardrails/register */
  register(
    params: GuardrailRegisterParams,
    options?: RequestOptions,
  ): Promise<GuardrailRegisterResponse> {
    return this.request<GuardrailRegisterResponse>({
      method: 'POST',
      path: '/guardrails/register',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /guardrails/submissions */
  listSubmissions(
    params: ListGuardrailSubmissionsParams = {},
    options?: RequestOptions,
  ): Promise<ListGuardrailSubmissionsResponse> {
    return this.request<ListGuardrailSubmissionsResponse>({
      method: 'GET',
      path: '/guardrails/submissions',
      options: withQuery(options, params as Query),
    });
  }

  /** GET /guardrails/submissions/{id} */
  retrieveSubmission(
    id: string,
    options?: RequestOptions,
  ): Promise<GuardrailSubmissionItem> {
    return this.request<GuardrailSubmissionItem>({
      method: 'GET',
      path: `/guardrails/submissions/${encodeURIComponent(id)}`,
      options,
    });
  }

  /** POST /guardrails/submissions/{id}/approve */
  approveSubmission(
    id: string,
    options?: RequestOptions,
  ): Promise<GuardrailSubmissionActionResponse> {
    return this.request<GuardrailSubmissionActionResponse>({
      method: 'POST',
      path: `/guardrails/submissions/${encodeURIComponent(id)}/approve`,
      options,
    });
  }

  /** POST /guardrails/submissions/{id}/reject */
  rejectSubmission(
    id: string,
    options?: RequestOptions,
  ): Promise<GuardrailSubmissionActionResponse> {
    return this.request<GuardrailSubmissionActionResponse>({
      method: 'POST',
      path: `/guardrails/submissions/${encodeURIComponent(id)}/reject`,
      options,
    });
  }

  /** GET /guardrails/ui/add_guardrail_settings */
  uiSettings(options?: RequestOptions): Promise<GuardrailUIAddSettingsResponse> {
    return this.request<GuardrailUIAddSettingsResponse>({
      method: 'GET',
      path: '/guardrails/ui/add_guardrail_settings',
      options,
    });
  }

  /** GET /guardrails/ui/category_yaml/{category} */
  uiCategoryYaml(
    category: string,
    options?: RequestOptions,
  ): Promise<GuardrailUICategoryYamlResponse> {
    return this.request<GuardrailUICategoryYamlResponse>({
      method: 'GET',
      path: `/guardrails/ui/category_yaml/${encodeURIComponent(category)}`,
      options,
    });
  }

  /** GET /guardrails/ui/major_airlines */
  uiMajorAirlines(options?: RequestOptions): Promise<GuardrailUIMajorAirlinesResponse> {
    return this.request<GuardrailUIMajorAirlinesResponse>({
      method: 'GET',
      path: '/guardrails/ui/major_airlines',
      options,
    });
  }

  /** GET /guardrails/ui/provider_specific_params */
  uiProviderSpecificParams(
    options?: RequestOptions,
  ): Promise<GuardrailUIProviderSpecificParamsResponse> {
    return this.request<GuardrailUIProviderSpecificParamsResponse>({
      method: 'GET',
      path: '/guardrails/ui/provider_specific_params',
      options,
    });
  }

  /** POST /guardrails/validate_blocked_words_file */
  validateBlockedWordsFile(
    params: ValidateBlockedWordsFileParams,
    options?: RequestOptions,
  ): Promise<ValidateBlockedWordsFileResponse> {
    return this.request<ValidateBlockedWordsFileResponse>({
      method: 'POST',
      path: '/guardrails/validate_blocked_words_file',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /guardrails/test_custom_code */
  testCustomCode(
    params: TestCustomCodeParams,
    options?: RequestOptions,
  ): Promise<TestCustomCodeResponse> {
    return this.request<TestCustomCodeResponse>({
      method: 'POST',
      path: '/guardrails/test_custom_code',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * POST /guardrails/apply_guardrail
   *
   * The proxy also exposes this under the legacy alias `/apply_guardrail`;
   * this method targets the canonical `/guardrails/apply_guardrail` path.
   */
  apply(
    params: ApplyGuardrailParams,
    options?: RequestOptions,
  ): Promise<ApplyGuardrailResponse> {
    return this.request<ApplyGuardrailResponse>({
      method: 'POST',
      path: '/guardrails/apply_guardrail',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /guardrails/usage/overview */
  usageOverview(
    params: UsageOverviewParams = {},
    options?: RequestOptions,
  ): Promise<UsageOverviewResponse> {
    return this.request<UsageOverviewResponse>({
      method: 'GET',
      path: '/guardrails/usage/overview',
      options: withQuery(options, params as Query),
    });
  }

  /** GET /guardrails/usage/detail/{id} */
  usageDetail(
    id: string,
    params: UsageDetailParams = {},
    options?: RequestOptions,
  ): Promise<UsageDetailResponse> {
    return this.request<UsageDetailResponse>({
      method: 'GET',
      path: `/guardrails/usage/detail/${encodeURIComponent(id)}`,
      options: withQuery(options, params as Query),
    });
  }

  /** GET /guardrails/usage/logs */
  usageLogs(
    params: UsageLogsParams = {},
    options?: RequestOptions,
  ): Promise<UsageLogsResponse> {
    return this.request<UsageLogsResponse>({
      method: 'GET',
      path: '/guardrails/usage/logs',
      options: withQuery(options, params as Query),
    });
  }

  /** GET /policies/usage/overview */
  policiesUsageOverview(
    params: UsageOverviewParams = {},
    options?: RequestOptions,
  ): Promise<UsageOverviewResponse> {
    return this.request<UsageOverviewResponse>({
      method: 'GET',
      path: '/policies/usage/overview',
      options: withQuery(options, params as Query),
    });
  }
}
