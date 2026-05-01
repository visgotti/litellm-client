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

  /**
   * List configured guardrails (v1 schema).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of guardrails.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  list(options?: RequestOptions): Promise<ListGuardrailsResponse> {
    return this.request<ListGuardrailsResponse>({
      method: 'GET',
      path: '/guardrails/list',
      options,
    });
  }

  /**
   * List configured guardrails using the v2 schema.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of guardrails (v2 shape).
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  listV2(options?: RequestOptions): Promise<ListGuardrailsResponse> {
    return this.request<ListGuardrailsResponse>({
      method: 'GET',
      path: '/v2/guardrails/list',
      options,
    });
  }

  /**
   * Create a new guardrail configuration.
   *
   * @param params - The guardrail creation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The persisted guardrail record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Replace a guardrail's configuration (full update).
   *
   * @param id - The guardrail identifier.
   * @param params - The full replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated guardrail record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Partially update a guardrail's configuration.
   *
   * @param id - The guardrail identifier.
   * @param params - A partial update payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated guardrail record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Delete a guardrail by id.
   *
   * @param id - The guardrail identifier to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  delete(id: string, options?: RequestOptions): Promise<GuardrailDeleteResponse> {
    return this.request<GuardrailDeleteResponse>({
      method: 'DELETE',
      path: `/guardrails/${encodeURIComponent(id)}`,
      options,
    });
  }

  /**
   * Retrieve a single guardrail by id.
   *
   * @param id - The guardrail identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The guardrail record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  retrieve(id: string, options?: RequestOptions): Promise<GuardrailInfoResponse> {
    return this.request<GuardrailInfoResponse>({
      method: 'GET',
      path: `/guardrails/${encodeURIComponent(id)}`,
      options,
    });
  }

  /**
   * Retrieve guardrail info via the `/info` alias of {@link retrieve}.
   *
   * @param id - The guardrail identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The guardrail record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  info(id: string, options?: RequestOptions): Promise<GuardrailInfoResponse> {
    return this.request<GuardrailInfoResponse>({
      method: 'GET',
      path: `/guardrails/${encodeURIComponent(id)}/info`,
      options,
    });
  }

  /**
   * Submit a guardrail for registration via the team submission flow.
   *
   * Unlike {@link create}, this enqueues the guardrail for an admin approval step.
   *
   * @param params - The guardrail registration payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The pending registration record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * List guardrail submissions awaiting admin review.
   *
   * @param params - Optional submission filters forwarded as query string entries.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The submissions listing.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Retrieve a single guardrail submission by id.
   *
   * @param id - The submission identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The submission record.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Approve a guardrail submission, promoting it to an active guardrail.
   *
   * @param id - The submission identifier to approve.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The submission action result.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Reject a pending guardrail submission.
   *
   * @param id - The submission identifier to reject.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The submission action result.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Fetch the settings schema used by the admin UI when adding a new guardrail.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The UI add-guardrail settings payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  uiSettings(options?: RequestOptions): Promise<GuardrailUIAddSettingsResponse> {
    return this.request<GuardrailUIAddSettingsResponse>({
      method: 'GET',
      path: '/guardrails/ui/add_guardrail_settings',
      options,
    });
  }

  /**
   * Fetch the YAML template the UI uses for a given guardrail category.
   *
   * @param category - The guardrail category whose template should be loaded.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The category YAML payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Fetch the major-airlines list used by the airline-related guardrail UI.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of major airline entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  uiMajorAirlines(options?: RequestOptions): Promise<GuardrailUIMajorAirlinesResponse> {
    return this.request<GuardrailUIMajorAirlinesResponse>({
      method: 'GET',
      path: '/guardrails/ui/major_airlines',
      options,
    });
  }

  /**
   * Fetch the provider-specific parameter schema used by the guardrail admin UI.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The provider-specific parameter schema.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
  uiProviderSpecificParams(
    options?: RequestOptions,
  ): Promise<GuardrailUIProviderSpecificParamsResponse> {
    return this.request<GuardrailUIProviderSpecificParamsResponse>({
      method: 'GET',
      path: '/guardrails/ui/provider_specific_params',
      options,
    });
  }

  /**
   * Validate a blocked-words file payload before saving it on a guardrail.
   *
   * @param params - The blocked-words validation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Validation results, including any malformed entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Test a custom-code guardrail snippet against a sample payload.
   *
   * @param params - The custom-code test request (code + sample inputs).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The execution result, including stdout/stderr and verdict.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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
   * Apply a guardrail to a piece of text/content and return its verdict.
   *
   * The proxy also exposes this under the legacy alias `/apply_guardrail`;
   * this method targets the canonical `/guardrails/apply_guardrail` path.
   *
   * @param params - The guardrail-apply payload (target guardrail, content, mode).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The guardrail verdict and any sanitized content.
   *
   * @see https://docs.litellm.ai/docs/apply_guardrail
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

  /**
   * Fetch a high-level usage overview across all guardrails.
   *
   * @param params - Optional date-range and grouping filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The aggregated guardrail usage overview.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Fetch detailed usage stats for a single guardrail.
   *
   * @param id - The guardrail identifier whose usage to inspect.
   * @param params - Optional date-range and grouping filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The detailed usage payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Fetch a stream of recent guardrail invocation logs.
   *
   * @param params - Optional pagination and filter parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of guardrail invocation logs.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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

  /**
   * Fetch a usage overview rolled up by policy (rather than guardrail id).
   *
   * @param params - Optional date-range and grouping filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The policy-level usage overview.
   *
   * @see https://docs.litellm.ai/docs/proxy/guardrails
   */
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
