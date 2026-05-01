import type {
  CompletionCreateParams,
  CompletionCreateParamsNonStreaming,
  CompletionCreateParamsStreaming,
  Completion,
  CompletionChunk,
} from '../types/completions';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

/**
 * Engines-prefixed alias for `completions.create`
 * (`POST /engines/{engineId}/completions`). Preserved for clients that still
 * use OpenAI's deprecated engine-style routing.
 */
export class CompletionsEnginesResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  create(
    engineId: string,
    params: CompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<Completion>;
  create(
    engineId: string,
    params: CompletionCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<CompletionChunk>>;
  create(
    engineId: string,
    params: CompletionCreateParams,
    options?: RequestOptions,
  ): Promise<Completion | Stream<CompletionChunk>>;
  create(
    engineId: string,
    params: CompletionCreateParams,
    options?: RequestOptions,
  ): Promise<Completion | Stream<CompletionChunk>> {
    const path = `/engines/${encodeURIComponent(engineId)}/completions`;
    if ('stream' in params && params.stream === true) {
      return this.streamRequest<CompletionChunk>({
        method: 'POST',
        path,
        body: { kind: 'json', value: params },
        options,
      });
    }
    return this.request<Completion>({
      method: 'POST',
      path,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/** Legacy text-completion endpoint: POST /v1/completions */
export class CompletionsResource {
  readonly engines: CompletionsEnginesResource;

  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {
    this.engines = new CompletionsEnginesResource(request, streamRequest);
  }

  create(
    params: CompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<Completion>;
  create(
    params: CompletionCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<CompletionChunk>>;
  create(
    params: CompletionCreateParams,
    options?: RequestOptions,
  ): Promise<Completion | Stream<CompletionChunk>>;
  /**
   * Create a legacy text completion (the OpenAI `/v1/completions` shape).
   *
   * Prefer `chat.completions.create` for newer models; this endpoint exists for
   * compatibility with prompt-style models. When `params.stream === true` the
   * call returns a `Stream<CompletionChunk>` of server-sent events.
   *
   * @param params - Completion request body including `model`, `prompt`, and
   *   sampling parameters; pass `stream: true` for incremental output.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `Completion` for non-streaming calls, or a `Stream<CompletionChunk>`
   *   when `stream: true` is set.
   *
   * @see https://docs.litellm.ai/docs/text_completion
   */
  create(
    params: CompletionCreateParams,
    options?: RequestOptions,
  ): Promise<Completion | Stream<CompletionChunk>> {
    if ('stream' in params && params.stream === true) {
      return this.streamRequest<CompletionChunk>({
        method: 'POST',
        path: '/v1/completions',
        body: { kind: 'json', value: params },
        options,
      });
    }
    return this.request<Completion>({
      method: 'POST',
      path: '/v1/completions',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
