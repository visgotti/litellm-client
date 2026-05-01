import type {
  SpendLogsParams,
  SpendLogsResponse,
  SpendByTagsParams,
  SpendByTagsResponse,
  GlobalSpendResponse,
  SpendKeysResponse,
  SpendModelsResponse,
  UserDailyActivityParams,
  UserDailyActivityResponse,
  SpendKeysParams,
  SpendByKeysResponse,
  SpendUsersParams,
  SpendByUsersResponse,
  SpendLogsV2Params,
  SpendLogsV2Response,
  SpendLogsUiParams,
  SpendLogsUiResponse,
  SpendLogUiResponse,
  SpendLogsSessionUiParams,
  SpendLogsSessionUiResponse,
  GlobalSpendLogsParams,
  GlobalSpendLogsResponse,
  GlobalSpendProviderParams,
  GlobalSpendProviderResponse,
  GlobalSpendReportParams,
  GlobalSpendReportResponse,
  GlobalSpendAllTagNamesResponse,
  GlobalAllTagSpendParams,
  GlobalAllTagSpendResponse,
  GlobalSpendResetResponse,
  GlobalSpendRefreshResponse,
  GlobalAllEndUsersResponse,
  GlobalActivityParams,
  GlobalActivityResponse,
  GlobalActivityByModelResponse,
  GlobalActivityExceptionsResponse,
  GlobalActivityExceptionsByDeploymentResponse,
  GlobalActivityCacheHitsResponse,
} from '../types/spend';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class SpendResource {
  constructor(private request: RequestFn) {}

  /**
   * List individual spend log entries (`GET /spend/logs`).
   *
   * @param params - Optional filters (api_key, request_id, start_date, end_date, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Matching spend log entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  logs(params: SpendLogsParams = {}, options?: RequestOptions): Promise<SpendLogsResponse> {
    return this.request<SpendLogsResponse>({
      method: 'GET',
      path: '/spend/logs',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Aggregate spend grouped by tag (`GET /spend/tags`).
   *
   * @param params - Optional date range plus a list of tags to filter on.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by tag.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  byTags(params: SpendByTagsParams = {}, options?: RequestOptions): Promise<SpendByTagsResponse> {
    const query: Record<string, string | number | boolean | undefined | null> = {
      ...(options?.query ?? {}),
    };
    if (params.start_date) query.start_date = params.start_date;
    if (params.end_date) query.end_date = params.end_date;
    if (params.tags) query.tags = params.tags.join(',');
    return this.request<SpendByTagsResponse>({
      method: 'GET',
      path: '/spend/tags',
      options: { ...(options ?? {}), query },
    });
  }

  /**
   * Total spend across all keys/users/teams (`GET /global/spend`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Aggregate spend totals.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  global(options?: RequestOptions): Promise<GlobalSpendResponse> {
    return this.request<GlobalSpendResponse>({
      method: 'GET',
      path: '/global/spend',
      options,
    });
  }

  /**
   * Top spending keys across the proxy (`GET /global/spend/keys`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by key.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalKeys(options?: RequestOptions): Promise<SpendKeysResponse> {
    return this.request<SpendKeysResponse>({
      method: 'GET',
      path: '/global/spend/keys',
      options,
    });
  }

  /**
   * Top spending models across the proxy (`GET /global/spend/models`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by model.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalModels(options?: RequestOptions): Promise<SpendModelsResponse> {
    return this.request<SpendModelsResponse>({
      method: 'GET',
      path: '/global/spend/models',
      options,
    });
  }

  /**
   * Top spending end-users across the proxy (`POST /global/spend/end_users`).
   *
   * The proxy expects a POST with an optional JSON body for filters
   * (start/end dates, end-user list). Pass `{}` for the default summary.
   *
   * @param params - Optional filter body (start_date/end_date/end_user list).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by end-user (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalEndUsers(
    params: Record<string, unknown> = {},
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/global/spend/end_users',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Top spending teams across the proxy (`GET /global/spend/teams`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by team (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalTeams(options?: RequestOptions): Promise<unknown> {
    return this.request({ method: 'GET', path: '/global/spend/teams', options });
  }

  /**
   * Calculate the cost of a hypothetical or completed call (`POST /spend/calculate`).
   *
   * Pass either `messages` (to estimate prior to calling) or `completion_response`
   * (to compute cost from a finished response payload).
   *
   * @param params - `model`, plus either `messages` or `completion_response`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The computed cost (typically `{ cost: number }`).
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  calculate(
    params: { model?: string; messages?: unknown; completion_response?: unknown } = {},
    options?: RequestOptions,
  ): Promise<{ cost: number } | unknown> {
    return this.request({
      method: 'POST',
      path: '/spend/calculate',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Daily activity for a single user (`GET /user/daily/activity`).
   *
   * @param params - User id and date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily aggregates of requests, tokens, and spend.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  userDailyActivity(
    params: UserDailyActivityParams,
    options?: RequestOptions,
  ): Promise<UserDailyActivityResponse> {
    return this.request<UserDailyActivityResponse>({
      method: 'GET',
      path: '/user/daily/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Spend grouped by virtual key (`GET /spend/keys`).
   *
   * @param params - Optional filters / pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by key.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  keys(params: SpendKeysParams = {}, options?: RequestOptions): Promise<SpendByKeysResponse> {
    return this.request<SpendByKeysResponse>({
      method: 'GET',
      path: '/spend/keys',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Spend grouped by user (`GET /spend/users`).
   *
   * @param params - Optional filters / pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by user.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  users(params: SpendUsersParams = {}, options?: RequestOptions): Promise<SpendByUsersResponse> {
    return this.request<SpendByUsersResponse>({
      method: 'GET',
      path: '/spend/users',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * v2 spend logs with extended fields (`GET /spend/logs/v2`).
   *
   * @param params - Optional filters (api_key, request_id, date range, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns v2 spend log entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  logsV2(params: SpendLogsV2Params = {}, options?: RequestOptions): Promise<SpendLogsV2Response> {
    return this.request<SpendLogsV2Response>({
      method: 'GET',
      path: '/spend/logs/v2',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Spend logs shaped for the admin UI (`GET /spend/logs/ui`).
   *
   * @param params - Optional UI-style filters and pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns UI-shaped spend log entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  logsUi(params: SpendLogsUiParams = {}, options?: RequestOptions): Promise<SpendLogsUiResponse> {
    return this.request<SpendLogsUiResponse>({
      method: 'GET',
      path: '/spend/logs/ui',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Fetch a single UI-shaped spend log entry by request id (`GET /spend/logs/ui/{request_id}`).
   *
   * @param requestId - The request id whose log entry should be returned.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The single matching log entry.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  logUi(requestId: string, options?: RequestOptions): Promise<SpendLogUiResponse> {
    return this.request<SpendLogUiResponse>({
      method: 'GET',
      path: `/spend/logs/ui/${encodeURIComponent(requestId)}`,
      options,
    });
  }

  /**
   * Session-grouped spend logs for the UI (`GET /spend/logs/session/ui`).
   *
   * @param params - Optional session/date filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Session-grouped spend log entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  logsSessionUi(
    params: SpendLogsSessionUiParams = {},
    options?: RequestOptions,
  ): Promise<SpendLogsSessionUiResponse> {
    return this.request<SpendLogsSessionUiResponse>({
      method: 'GET',
      path: '/spend/logs/session/ui',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Global spend logs across the proxy (`GET /global/spend/logs`).
   *
   * @param params - Optional filters / pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Global spend log entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalLogs(
    params: GlobalSpendLogsParams = {},
    options?: RequestOptions,
  ): Promise<GlobalSpendLogsResponse> {
    return this.request<GlobalSpendLogsResponse>({
      method: 'GET',
      path: '/global/spend/logs',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Spend grouped by provider (`GET /global/spend/provider`).
   *
   * @param params - Optional date range / grouping.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Spend totals broken down by provider.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalProvider(
    params: GlobalSpendProviderParams = {},
    options?: RequestOptions,
  ): Promise<GlobalSpendProviderResponse> {
    return this.request<GlobalSpendProviderResponse>({
      method: 'GET',
      path: '/global/spend/provider',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Generate a global spend report for a date range (`GET /global/spend/report`).
   *
   * @param params - Date range plus optional grouping/filter parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The computed spend report.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalReport(
    params: GlobalSpendReportParams,
    options?: RequestOptions,
  ): Promise<GlobalSpendReportResponse> {
    return this.request<GlobalSpendReportResponse>({
      method: 'GET',
      path: '/global/spend/report',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * List every distinct tag observed in spend records (`GET /global/spend/all_tag_names`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full list of distinct tag names.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalAllTagNames(options?: RequestOptions): Promise<GlobalSpendAllTagNamesResponse> {
    return this.request<GlobalSpendAllTagNamesResponse>({
      method: 'GET',
      path: '/global/spend/all_tag_names',
      options,
    });
  }

  /**
   * Per-tag spend totals (`GET /global/spend/tags`).
   *
   * Distinct from `globalAllTagNames` (which returns just the tag names) —
   * this returns the spend rows for each tag/day in the requested window.
   *
   * @param params - Optional date range + comma-separated tag filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-tag spend rows (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/spend_tracking/spend_management_endpoints.py
   */
  globalAllTagSpend(
    params: GlobalAllTagSpendParams = {},
    options?: RequestOptions,
  ): Promise<GlobalAllTagSpendResponse> {
    return this.request<GlobalAllTagSpendResponse>({
      method: 'GET',
      path: '/global/spend/tags',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Reset proxy-wide spend totals to zero (`POST /global/spend/reset`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation including the prior totals.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalReset(options?: RequestOptions): Promise<GlobalSpendResetResponse> {
    return this.request<GlobalSpendResetResponse>({
      method: 'POST',
      path: '/global/spend/reset',
      options,
    });
  }

  /**
   * Force a refresh of cached global spend totals (`POST /global/spend/refresh`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation that the refresh completed.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalRefresh(options?: RequestOptions): Promise<GlobalSpendRefreshResponse> {
    return this.request<GlobalSpendRefreshResponse>({
      method: 'POST',
      path: '/global/spend/refresh',
      options,
    });
  }

  /**
   * List every end-user the proxy has seen (`GET /global/all_end_users`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full list of end-users.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  globalAllEndUsers(options?: RequestOptions): Promise<GlobalAllEndUsersResponse> {
    return this.request<GlobalAllEndUsersResponse>({
      method: 'GET',
      path: '/global/all_end_users',
      options,
    });
  }

  /**
   * Global activity counts over time (`GET /global/activity`).
   *
   * @param params - Optional date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Time-series activity counts.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  activity(
    params: GlobalActivityParams = {},
    options?: RequestOptions,
  ): Promise<GlobalActivityResponse> {
    return this.request<GlobalActivityResponse>({
      method: 'GET',
      path: '/global/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Global activity grouped by model (`GET /global/activity/model`).
   *
   * @param params - Optional date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Time-series activity counts per model.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  activityByModel(
    params: GlobalActivityParams = {},
    options?: RequestOptions,
  ): Promise<GlobalActivityByModelResponse> {
    return this.request<GlobalActivityByModelResponse>({
      method: 'GET',
      path: '/global/activity/model',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Global exception counts over time (`GET /global/activity/exceptions`).
   *
   * @param params - Optional date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Time-series exception counts.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  activityExceptions(
    params: GlobalActivityParams = {},
    options?: RequestOptions,
  ): Promise<GlobalActivityExceptionsResponse> {
    return this.request<GlobalActivityExceptionsResponse>({
      method: 'GET',
      path: '/global/activity/exceptions',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Global exception counts grouped by deployment (`GET /global/activity/exceptions/deployment`).
   *
   * @param params - Optional date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Time-series exception counts per deployment.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  activityExceptionsByDeployment(
    params: GlobalActivityParams = {},
    options?: RequestOptions,
  ): Promise<GlobalActivityExceptionsByDeploymentResponse> {
    return this.request<GlobalActivityExceptionsByDeploymentResponse>({
      method: 'GET',
      path: '/global/activity/exceptions/deployment',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Global cache-hit counts over time (`GET /global/activity/cache_hits`).
   *
   * @param params - Optional date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Time-series cache-hit counts.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  activityCacheHits(
    params: GlobalActivityParams = {},
    options?: RequestOptions,
  ): Promise<GlobalActivityCacheHitsResponse> {
    return this.request<GlobalActivityCacheHitsResponse>({
      method: 'GET',
      path: '/global/activity/cache_hits',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}
