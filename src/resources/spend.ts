import type {
  SpendLogsParams,
  SpendLogsResponse,
  SpendByTagsParams,
  SpendByTagsResponse,
  DailySpendParams,
  DailySpendResponse,
  GlobalSpendResponse,
  SpendUsersResponse,
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

  /** GET /spend/logs */
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

  /** GET /spend/tags */
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

  /** GET /global/spend/logs */
  global(options?: RequestOptions): Promise<GlobalSpendResponse> {
    return this.request<GlobalSpendResponse>({
      method: 'GET',
      path: '/global/spend',
      options,
    });
  }

  /** GET /global/spend/keys */
  globalKeys(options?: RequestOptions): Promise<SpendKeysResponse> {
    return this.request<SpendKeysResponse>({
      method: 'GET',
      path: '/global/spend/keys',
      options,
    });
  }

  /** GET /global/spend/users */
  globalUsers(options?: RequestOptions): Promise<SpendUsersResponse> {
    return this.request<SpendUsersResponse>({
      method: 'GET',
      path: '/global/spend/users',
      options,
    });
  }

  /** GET /global/spend/models */
  globalModels(options?: RequestOptions): Promise<SpendModelsResponse> {
    return this.request<SpendModelsResponse>({
      method: 'GET',
      path: '/global/spend/models',
      options,
    });
  }

  /** GET /global/spend/end_users */
  globalEndUsers(options?: RequestOptions): Promise<unknown> {
    return this.request({ method: 'GET', path: '/global/spend/end_users', options });
  }

  /** GET /global/spend/teams */
  globalTeams(options?: RequestOptions): Promise<unknown> {
    return this.request({ method: 'GET', path: '/global/spend/teams', options });
  }

  /** GET /spend/calculate */
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

  /** GET /user/daily/activity */
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

  /** GET /daily/activity */
  dailyActivity(
    params: DailySpendParams,
    options?: RequestOptions,
  ): Promise<DailySpendResponse> {
    return this.request<DailySpendResponse>({
      method: 'GET',
      path: '/daily/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /spend/keys */
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

  /** GET /spend/users */
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

  /** GET /spend/logs/v2 */
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

  /** GET /spend/logs/ui */
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

  /** GET /spend/logs/ui/{request_id} */
  logUi(requestId: string, options?: RequestOptions): Promise<SpendLogUiResponse> {
    return this.request<SpendLogUiResponse>({
      method: 'GET',
      path: `/spend/logs/ui/${encodeURIComponent(requestId)}`,
      options,
    });
  }

  /** GET /spend/logs/session/ui */
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

  /** GET /global/spend/logs */
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

  /** GET /global/spend/provider */
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

  /** GET /global/spend/report */
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

  /** GET /global/spend/all_tag_names */
  globalAllTagNames(options?: RequestOptions): Promise<GlobalSpendAllTagNamesResponse> {
    return this.request<GlobalSpendAllTagNamesResponse>({
      method: 'GET',
      path: '/global/spend/all_tag_names',
      options,
    });
  }

  /** POST /global/spend/reset */
  globalReset(options?: RequestOptions): Promise<GlobalSpendResetResponse> {
    return this.request<GlobalSpendResetResponse>({
      method: 'POST',
      path: '/global/spend/reset',
      options,
    });
  }

  /** POST /global/spend/refresh */
  globalRefresh(options?: RequestOptions): Promise<GlobalSpendRefreshResponse> {
    return this.request<GlobalSpendRefreshResponse>({
      method: 'POST',
      path: '/global/spend/refresh',
      options,
    });
  }

  /** GET /global/all_end_users */
  globalAllEndUsers(options?: RequestOptions): Promise<GlobalAllEndUsersResponse> {
    return this.request<GlobalAllEndUsersResponse>({
      method: 'GET',
      path: '/global/all_end_users',
      options,
    });
  }

  /** GET /global/activity */
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

  /** GET /global/activity/model */
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

  /** GET /global/activity/exceptions */
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

  /** GET /global/activity/exceptions/deployment */
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

  /** GET /global/activity/cache_hits */
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
