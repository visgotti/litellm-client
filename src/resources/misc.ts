import type {
  ActiveCallbacksResponse,
  AllowedIPParams,
  AllowedIPResponse,
  ApiEventLoggingBatchParams,
  ApiEventLoggingBatchResponse,
  ApplyGuardrailParams,
  ApplyGuardrailResponse,
  DebugAsyncioTasksResponse,
  InProductNudgesResponse,
  RegenerateKeyParams,
  RegisterClientParams,
  RegisterClientResponse,
  RerankV2Params,
  RerankV2Response,
  UsageAiChatChunk,
  UsageAiChatParams,
} from '../types/misc';
import type { KeyCreateResponse } from '../types/keys';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

/** Miscellaneous one-off endpoints that don't belong to a larger resource. */
export class MiscResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /** `POST /apply_guardrail` — run a configured guardrail against text. */
  async applyGuardrail(
    params: ApplyGuardrailParams,
    options?: RequestOptions,
  ): Promise<ApplyGuardrailResponse> {
    return this.request<ApplyGuardrailResponse>({
      method: 'POST',
      path: '/apply_guardrail',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `POST /add/allowed_ip` — append an IP to the proxy's allow-list. */
  async addAllowedIp(
    params: AllowedIPParams,
    options?: RequestOptions,
  ): Promise<AllowedIPResponse> {
    return this.request<AllowedIPResponse>({
      method: 'POST',
      path: '/add/allowed_ip',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `POST /delete/allowed_ip` — remove an IP from the proxy's allow-list. */
  async deleteAllowedIp(
    params: AllowedIPParams,
    options?: RequestOptions,
  ): Promise<AllowedIPResponse> {
    return this.request<AllowedIPResponse>({
      method: 'POST',
      path: '/delete/allowed_ip',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `POST /api/event_logging/batch` — submit a batch of analytics events. */
  async apiEventLoggingBatch(
    params: ApiEventLoggingBatchParams,
    options?: RequestOptions,
  ): Promise<ApiEventLoggingBatchResponse> {
    return this.request<ApiEventLoggingBatchResponse>({
      method: 'POST',
      path: '/api/event_logging/batch',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `GET /in_product_nudges` — feature flags for in-product nudges. */
  async inProductNudges(options?: RequestOptions): Promise<InProductNudgesResponse> {
    return this.request<InProductNudgesResponse>({
      method: 'GET',
      path: '/in_product_nudges',
      options,
    });
  }

  /** `GET /active/callbacks` — list active callback hooks on the proxy. */
  async activeCallbacks(options?: RequestOptions): Promise<ActiveCallbacksResponse> {
    return this.request<ActiveCallbacksResponse>({
      method: 'GET',
      path: '/active/callbacks',
      options,
    });
  }

  /**
   * `GET /callback` — SSO / OAuth callback target.
   *
   * The endpoint requires `code` and `state` query parameters and normally
   * responds with HTML. The SDK still decodes JSON; expect a 422 when called
   * without `code`/`state` and prefer driving the flow via {@link oauthAuthorize}.
   */
  async callback(options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: '/callback',
      options,
    });
  }

  /** `GET /debug/asyncio-tasks` — stats about active asyncio tasks. */
  async debugAsyncioTasks(options?: RequestOptions): Promise<DebugAsyncioTasksResponse> {
    return this.request<DebugAsyncioTasksResponse>({
      method: 'GET',
      path: '/debug/asyncio-tasks',
      options,
    });
  }

  /**
   * `POST /usage/ai/chat` — streaming usage assistant.
   *
   * The proxy responds with `text/event-stream`; this returns a typed
   * {@link Stream} of `UsageAiChatChunk` values that you iterate with
   * `for await`.
   */
  async usageAiChat(
    params: UsageAiChatParams,
    options?: RequestOptions,
  ): Promise<Stream<UsageAiChatChunk>> {
    return this.streamRequest<UsageAiChatChunk>({
      method: 'POST',
      path: '/usage/ai/chat',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `GET /public/litellm_model_cost_map` — proxy's public cost map. */
  async publicLitellmModelCostMap(
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'GET',
      path: '/public/litellm_model_cost_map',
      options,
    });
  }

  /**
   * `POST /key/regenerate` — regenerate a virtual key (Enterprise feature).
   *
   * The key to regenerate is sent as a `?key=` query parameter; the rest of
   * the request body holds the optional fields to apply to the new key.
   */
  async regenerateKey(
    params: RegenerateKeyParams,
    options?: RequestOptions,
  ): Promise<KeyCreateResponse> {
    const { key, ...body } = params;
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/regenerate',
      body: { kind: 'json', value: body },
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), key },
      },
    });
  }

  /**
   * `POST /register` — RFC 7591 OAuth 2.0 dynamic client registration.
   *
   * Returns the proxy's issued `client_id`, `client_secret`, and the set of
   * `redirect_uris` recognised for the new client.
   */
  async register(
    params: RegisterClientParams = {},
    options?: RequestOptions,
  ): Promise<RegisterClientResponse> {
    return this.request<RegisterClientResponse>({
      method: 'POST',
      path: '/register',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** `POST /v2/rerank` — Cohere-shaped rerank endpoint. */
  async rerankV2(
    params: RerankV2Params,
    options?: RequestOptions,
  ): Promise<RerankV2Response> {
    return this.request<RerankV2Response>({
      method: 'POST',
      path: '/v2/rerank',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
