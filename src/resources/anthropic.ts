import type {
  AnthropicMessagesCreateParams,
  AnthropicMessagesCreateParamsNonStreaming,
  AnthropicMessagesCreateParamsStreaming,
  AnthropicMessage,
  MessageStreamEvent,
  AnthropicCountTokensParams,
  AnthropicCountTokensResponse,
  AnthropicSkillObject,
  AnthropicSkillCreateParams,
  AnthropicSkillListParams,
  AnthropicSkillListResponse,
  AnthropicSkillDeletedResponse,
} from '../types/anthropic';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

export class AnthropicMessagesResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /** POST /v1/messages */
  create(
    params: AnthropicMessagesCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<AnthropicMessage>;
  create(
    params: AnthropicMessagesCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<MessageStreamEvent>>;
  create(
    params: AnthropicMessagesCreateParams,
    options?: RequestOptions,
  ): Promise<AnthropicMessage | Stream<MessageStreamEvent>>;
  create(
    params: AnthropicMessagesCreateParams,
    options?: RequestOptions,
  ): Promise<AnthropicMessage | Stream<MessageStreamEvent>> {
    const { extra_headers, ...body } = params;
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (extra_headers) Object.assign(headers, extra_headers);
    const opts: RequestOptions = { ...(options ?? {}), headers };

    if ('stream' in params && params.stream === true) {
      return this.streamRequest<MessageStreamEvent>({
        method: 'POST',
        path: '/v1/messages',
        body: { kind: 'json', value: body },
        options: opts,
      });
    }
    return this.request<AnthropicMessage>({
      method: 'POST',
      path: '/v1/messages',
      body: { kind: 'json', value: body },
      options: opts,
    });
  }

  /** POST /v1/messages/count_tokens */
  countTokens(
    params: AnthropicCountTokensParams,
    options?: RequestOptions,
  ): Promise<AnthropicCountTokensResponse> {
    return this.request<AnthropicCountTokensResponse>({
      method: 'POST',
      path: '/v1/messages/count_tokens',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class AnthropicSkillsResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/skills */
  create(
    params: AnthropicSkillCreateParams,
    options?: RequestOptions,
  ): Promise<AnthropicSkillObject> {
    return this.request<AnthropicSkillObject>({
      method: 'POST',
      path: '/v1/skills',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/skills */
  list(
    params: AnthropicSkillListParams = {},
    options?: RequestOptions,
  ): Promise<AnthropicSkillListResponse> {
    return this.request<AnthropicSkillListResponse>({
      method: 'GET',
      path: '/v1/skills',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/skills/{skill_id} */
  retrieve(skillId: string, options?: RequestOptions): Promise<AnthropicSkillObject> {
    return this.request<AnthropicSkillObject>({
      method: 'GET',
      path: `/v1/skills/${encodeURIComponent(skillId)}`,
      options,
    });
  }

  /** DELETE /v1/skills/{skill_id} */
  delete(skillId: string, options?: RequestOptions): Promise<AnthropicSkillDeletedResponse> {
    return this.request<AnthropicSkillDeletedResponse>({
      method: 'DELETE',
      path: `/v1/skills/${encodeURIComponent(skillId)}`,
      options,
    });
  }
}

export class AnthropicResource {
  readonly messages: AnthropicMessagesResource;
  readonly skills: AnthropicSkillsResource;

  constructor(request: RequestFn, streamRequest: StreamRequestFn) {
    this.messages = new AnthropicMessagesResource(request, streamRequest);
    this.skills = new AnthropicSkillsResource(request);
  }
}
