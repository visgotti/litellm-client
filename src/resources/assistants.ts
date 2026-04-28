import type {
  AssistantObject,
  AssistantCreateParams,
  AssistantUpdateParams,
  AssistantListParams,
  AssistantListResponse,
  AssistantDeletedResponse,
  ThreadObject,
  ThreadCreateParams,
  ThreadUpdateParams,
  ThreadDeletedResponse,
  ThreadMessageObject,
  ThreadMessageCreateParams,
  ThreadMessageListResponse,
  RunObject,
  RunCreateParams,
} from '../types/assistants';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

const ASSISTANTS_HEADERS = { 'OpenAI-Beta': 'assistants=v2' };

function withBeta(options?: RequestOptions): RequestOptions {
  return {
    ...(options ?? {}),
    headers: { ...ASSISTANTS_HEADERS, ...(options?.headers ?? {}) },
  };
}

class MessagesResource {
  constructor(private request: RequestFn) {}

  create(
    threadId: string,
    params: ThreadMessageCreateParams,
    options?: RequestOptions,
  ): Promise<ThreadMessageObject> {
    return this.request<ThreadMessageObject>({
      method: 'POST',
      path: `/v1/threads/${encodeURIComponent(threadId)}/messages`,
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  list(
    threadId: string,
    params: { after?: string; before?: string; limit?: number; order?: 'asc' | 'desc' } = {},
    options?: RequestOptions,
  ): Promise<ThreadMessageListResponse> {
    return this.request<ThreadMessageListResponse>({
      method: 'GET',
      path: `/v1/threads/${encodeURIComponent(threadId)}/messages`,
      options: {
        ...withBeta(options),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}

class RunsResource {
  constructor(private request: RequestFn) {}

  create(
    threadId: string,
    params: RunCreateParams,
    options?: RequestOptions,
  ): Promise<RunObject> {
    return this.request<RunObject>({
      method: 'POST',
      path: `/v1/threads/${encodeURIComponent(threadId)}/runs`,
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  retrieve(threadId: string, runId: string, options?: RequestOptions): Promise<RunObject> {
    return this.request<RunObject>({
      method: 'GET',
      path: `/v1/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}`,
      options: withBeta(options),
    });
  }

  cancel(threadId: string, runId: string, options?: RequestOptions): Promise<RunObject> {
    return this.request<RunObject>({
      method: 'POST',
      path: `/v1/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}/cancel`,
      options: withBeta(options),
    });
  }
}

class ThreadsResource {
  readonly messages: MessagesResource;
  readonly runs: RunsResource;

  constructor(private request: RequestFn) {
    this.messages = new MessagesResource(request);
    this.runs = new RunsResource(request);
  }

  create(params: ThreadCreateParams = {}, options?: RequestOptions): Promise<ThreadObject> {
    return this.request<ThreadObject>({
      method: 'POST',
      path: '/v1/threads',
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  retrieve(threadId: string, options?: RequestOptions): Promise<ThreadObject> {
    return this.request<ThreadObject>({
      method: 'GET',
      path: `/v1/threads/${encodeURIComponent(threadId)}`,
      options: withBeta(options),
    });
  }

  update(
    threadId: string,
    params: ThreadUpdateParams,
    options?: RequestOptions,
  ): Promise<ThreadObject> {
    return this.request<ThreadObject>({
      method: 'POST',
      path: `/v1/threads/${encodeURIComponent(threadId)}`,
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  delete(threadId: string, options?: RequestOptions): Promise<ThreadDeletedResponse> {
    return this.request<ThreadDeletedResponse>({
      method: 'DELETE',
      path: `/v1/threads/${encodeURIComponent(threadId)}`,
      options: withBeta(options),
    });
  }
}

export class AssistantsResource {
  readonly threads: ThreadsResource;

  constructor(private request: RequestFn) {
    this.threads = new ThreadsResource(request);
  }

  create(params: AssistantCreateParams, options?: RequestOptions): Promise<AssistantObject> {
    return this.request<AssistantObject>({
      method: 'POST',
      path: '/v1/assistants',
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  list(
    params: AssistantListParams = {},
    options?: RequestOptions,
  ): Promise<AssistantListResponse> {
    return this.request<AssistantListResponse>({
      method: 'GET',
      path: '/v1/assistants',
      options: {
        ...withBeta(options),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  retrieve(assistantId: string, options?: RequestOptions): Promise<AssistantObject> {
    return this.request<AssistantObject>({
      method: 'GET',
      path: `/v1/assistants/${encodeURIComponent(assistantId)}`,
      options: withBeta(options),
    });
  }

  update(
    assistantId: string,
    params: AssistantUpdateParams,
    options?: RequestOptions,
  ): Promise<AssistantObject> {
    return this.request<AssistantObject>({
      method: 'POST',
      path: `/v1/assistants/${encodeURIComponent(assistantId)}`,
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  delete(assistantId: string, options?: RequestOptions): Promise<AssistantDeletedResponse> {
    return this.request<AssistantDeletedResponse>({
      method: 'DELETE',
      path: `/v1/assistants/${encodeURIComponent(assistantId)}`,
      options: withBeta(options),
    });
  }
}
