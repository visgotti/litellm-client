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

  /**
   * Create a new tag definition (`POST /tag/new`).
   *
   * @param params - Tag attributes (name, description, models, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created tag record.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
  create(params: TagCreateParams, options?: RequestOptions): Promise<TagCreateResponse> {
    return this.request<TagCreateResponse>({
      method: 'POST',
      path: '/tag/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing tag (`POST /tag/update`).
   *
   * @param params - Tag name plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated tag record.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
  update(params: TagUpdateParams, options?: RequestOptions): Promise<TagUpdateResponse> {
    return this.request<TagUpdateResponse>({
      method: 'POST',
      path: '/tag/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Fetch info for one or more tags (`POST /tag/info`).
   *
   * @param params - Tag names to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The matching tag records.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
  info(params: TagInfoParams, options?: RequestOptions): Promise<TagInfoResponse> {
    return this.request<TagInfoResponse>({
      method: 'POST',
      path: '/tag/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a tag (`POST /tag/delete`).
   *
   * @param params - The tag to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
  delete(params: TagDeleteParams, options?: RequestOptions): Promise<TagDeleteResponse> {
    return this.request<TagDeleteResponse>({
      method: 'POST',
      path: '/tag/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List all configured tags (`GET /tag/list`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full list of tag records.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
  list(options?: RequestOptions): Promise<TagListResponse> {
    return this.request<TagListResponse>({
      method: 'GET',
      path: '/tag/list',
      options,
    });
  }

  /**
   * Daily activity totals broken down by tag (`GET /tag/daily/activity`).
   *
   * @param params - Optional date range and tag filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily aggregates of requests, tokens, and spend per tag.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
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

  /**
   * List every distinct tag observed in usage (`GET /tag/distinct`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of distinct tag names.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
  distinct(options?: RequestOptions): Promise<TagDistinctResponse> {
    return this.request<TagDistinctResponse>({
      method: 'GET',
      path: '/tag/distinct',
      options,
    });
  }

  /**
   * Daily-active-users (DAU) for a tag (`GET /tag/dau`).
   *
   * @param params - Optional `tag_filter` / `tag_filters` to scope the query.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily active user counts.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
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

  /**
   * Weekly-active-users (WAU) for a tag (`GET /tag/wau`).
   *
   * @param params - Optional `tag_filter` / `tag_filters` to scope the query.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Weekly active user counts.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
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

  /**
   * Monthly-active-users (MAU) for a tag (`GET /tag/mau`).
   *
   * @param params - Optional `tag_filter` / `tag_filters` to scope the query.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Monthly active user counts.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
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

  /**
   * Aggregate per-tag summary across a date range (`GET /tag/summary`).
   *
   * @param params - Required date range plus optional tag filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-tag summary metrics.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
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

  /**
   * Per-user analytics for the user-agent tag dimension (`GET /tag/user-agent/per-user-analytics`).
   *
   * @param params - Optional tag filters and pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-user analytics rows.
   *
   * @see https://docs.litellm.ai/docs/proxy/tags
   */
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
