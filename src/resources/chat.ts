import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionCreateParams,
  ChatCompletion,
  ChatCompletionChunk,
} from '../types/chat';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

export class ChatCompletionsResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  async create(
    params: ChatCompletionCreateParamsNonStreaming,
  ): Promise<ChatCompletion>;

  async create(
    params: ChatCompletionCreateParamsStreaming,
  ): Promise<Stream<ChatCompletionChunk>>;

  async create(
    params: ChatCompletionCreateParams,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>>;

  async create(
    params: ChatCompletionCreateParams,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
    const { extra_headers, metadata, ...body } = params;
    const headers: Record<string, string> = {};
    if (extra_headers) Object.assign(headers, extra_headers);
    if (metadata) headers['x-litellm-metadata'] = JSON.stringify(metadata);

    if ('stream' in params && params.stream) {
      return this.streamRequest<ChatCompletionChunk>(
        'POST',
        '/v1/chat/completions',
        body,
        Object.keys(headers).length > 0 ? headers : undefined,
      );
    }

    return this.request<ChatCompletion>(
      'POST',
      '/v1/chat/completions',
      body,
      Object.keys(headers).length > 0 ? headers : undefined,
    );
  }
}

export class ChatResource {
  readonly completions: ChatCompletionsResource;

  constructor(request: RequestFn, streamRequest: StreamRequestFn) {
    this.completions = new ChatCompletionsResource(request, streamRequest);
  }
}
