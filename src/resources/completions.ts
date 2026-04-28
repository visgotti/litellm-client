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

/** Legacy text-completion endpoint: POST /v1/completions */
export class CompletionsResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

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
