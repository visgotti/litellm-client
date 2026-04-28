import type {
  TagCreateParams,
  TagCreateResponse,
  TagUpdateParams,
  TagUpdateResponse,
  TagInfoParams,
  TagInfoResponse,
  TagDeleteParams,
  TagDeleteResponse,
  TagListResponse,
  TagDailyActivityParams,
  TagDailyActivityResponse,
  TagDistinctResponse,
  TagActiveUsersParams,
  TagActiveUsersResponse,
  TagSummaryParams,
  TagSummaryResponse,
  TagPerUserAnalyticsParams,
  TagPerUserAnalyticsResponse,
} from '../types/tags';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class TagsResource {
  constructor(private request: RequestFn) {}

  /** POST /tag/new */
  create(params: TagCreateParams, options?: RequestOptions): Promise<TagCreateResponse> {
    return this.request<TagCreateResponse>({
      method: 'POST',
      path: '/tag/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /tag/update */
  update(params: TagUpdateParams, options?: RequestOptions): Promise<TagUpdateResponse> {
    return this.request<TagUpdateResponse>({
      method: 'POST',
      path: '/tag/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /tag/info */
  info(params: TagInfoParams, options?: RequestOptions): Promise<TagInfoResponse> {
    return this.request<TagInfoResponse>({
      method: 'POST',
      path: '/tag/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /tag/delete */
  delete(params: TagDeleteParams, options?: RequestOptions): Promise<TagDeleteResponse> {
    return this.request<TagDeleteResponse>({
      method: 'POST',
      path: '/tag/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /tag/list */
  list(options?: RequestOptions): Promise<TagListResponse> {
    return this.request<TagListResponse>({
      method: 'GET',
      path: '/tag/list',
      options,
    });
  }

  /** GET /tag/daily/activity */
  dailyActivity(
    params: TagDailyActivityParams = {},
    options?: RequestOptions,
  ): Promise<TagDailyActivityResponse> {
    return this.request<TagDailyActivityResponse>({
      method: 'GET',
      path: '/tag/daily/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /tag/distinct */
  distinct(options?: RequestOptions): Promise<TagDistinctResponse> {
    return this.request<TagDistinctResponse>({
      method: 'GET',
      path: '/tag/distinct',
      options,
    });
  }

  /** GET /tag/dau */
  dau(
    params: TagActiveUsersParams = {},
    options?: RequestOptions,
  ): Promise<TagActiveUsersResponse> {
    return this.request<TagActiveUsersResponse>({
      method: 'GET',
      path: '/tag/dau',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...this.buildActiveUsersQuery(params) },
      },
    });
  }

  /** GET /tag/wau */
  wau(
    params: TagActiveUsersParams = {},
    options?: RequestOptions,
  ): Promise<TagActiveUsersResponse> {
    return this.request<TagActiveUsersResponse>({
      method: 'GET',
      path: '/tag/wau',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...this.buildActiveUsersQuery(params) },
      },
    });
  }

  /** GET /tag/mau */
  mau(
    params: TagActiveUsersParams = {},
    options?: RequestOptions,
  ): Promise<TagActiveUsersResponse> {
    return this.request<TagActiveUsersResponse>({
      method: 'GET',
      path: '/tag/mau',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...this.buildActiveUsersQuery(params) },
      },
    });
  }

  /** GET /tag/summary */
  summary(params: TagSummaryParams, options?: RequestOptions): Promise<TagSummaryResponse> {
    const query: Record<string, string | number | boolean | undefined | null> = {
      ...(options?.query ?? {}),
      start_date: params.start_date,
      end_date: params.end_date,
    };
    if (params.tag_filter !== undefined) query.tag_filter = params.tag_filter;
    if (params.tag_filters && params.tag_filters.length > 0) {
      query.tag_filters = params.tag_filters.join(',');
    }
    return this.request<TagSummaryResponse>({
      method: 'GET',
      path: '/tag/summary',
      options: { ...(options ?? {}), query },
    });
  }

  /** GET /tag/user-agent/per-user-analytics */
  userAgentPerUserAnalytics(
    params: TagPerUserAnalyticsParams = {},
    options?: RequestOptions,
  ): Promise<TagPerUserAnalyticsResponse> {
    const query: Record<string, string | number | boolean | undefined | null> = {
      ...(options?.query ?? {}),
    };
    if (params.tag_filter !== undefined) query.tag_filter = params.tag_filter;
    if (params.tag_filters && params.tag_filters.length > 0) {
      query.tag_filters = params.tag_filters.join(',');
    }
    if (params.page !== undefined) query.page = params.page;
    if (params.page_size !== undefined) query.page_size = params.page_size;
    return this.request<TagPerUserAnalyticsResponse>({
      method: 'GET',
      path: '/tag/user-agent/per-user-analytics',
      options: { ...(options ?? {}), query },
    });
  }

  private buildActiveUsersQuery(
    params: TagActiveUsersParams,
  ): Record<string, string | number | boolean | undefined | null> {
    const query: Record<string, string | number | boolean | undefined | null> = {};
    if (params.tag_filter !== undefined) query.tag_filter = params.tag_filter;
    if (params.tag_filters && params.tag_filters.length > 0) {
      query.tag_filters = params.tag_filters.join(',');
    }
    return query;
  }
}
