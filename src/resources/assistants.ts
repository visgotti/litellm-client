import type {
  AssistantObject,
  AssistantCreateParams,
  AssistantListParams,
  AssistantListResponse,
  AssistantDeletedResponse,
  ThreadObject,
  ThreadCreateParams,
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

  /**
   * Append a message to an existing thread.
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param threadId - The id of the thread to append to.
   * @param params - Message body: `role`, `content`, optional `attachments`,
   *   `metadata`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created `ThreadMessageObject`.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
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

  /**
   * List messages on a thread (paginated).
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param threadId - The id of the thread whose messages to list.
   * @param params - Pagination filters: `after`, `before`, `limit`, `order`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ThreadMessageListResponse` page of messages.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
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

  /**
   * Start a new run on a thread using a configured assistant.
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param threadId - The id of the thread to run on.
   * @param params - Run parameters: `assistant_id`, plus optional overrides
   *   for `model`, `instructions`, `tools`, `metadata`, etc.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `RunObject`.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
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

}

class ThreadsResource {
  readonly messages: MessagesResource;
  readonly runs: RunsResource;

  constructor(private request: RequestFn) {
    this.messages = new MessagesResource(request);
    this.runs = new RunsResource(request);
  }

  /**
   * Create a new thread, optionally seeded with messages.
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param params - Thread creation params: optional initial `messages`,
   *   `tool_resources`, `metadata`. Defaults to `{}` for an empty thread.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `ThreadObject`.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
  create(params: ThreadCreateParams = {}, options?: RequestOptions): Promise<ThreadObject> {
    return this.request<ThreadObject>({
      method: 'POST',
      path: '/v1/threads',
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  /**
   * Retrieve a thread by id.
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param threadId - The id of the thread.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `ThreadObject`.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
  retrieve(threadId: string, options?: RequestOptions): Promise<ThreadObject> {
    return this.request<ThreadObject>({
      method: 'GET',
      path: `/v1/threads/${encodeURIComponent(threadId)}`,
      options: withBeta(options),
    });
  }

}

/**
 * Resource for managing OpenAI Assistants (assistants, threads, messages, runs).
 *
 * @deprecated The OpenAI Assistants API is **deprecated** and will shut down
 * on **August 26, 2026**. New integrations should use {@link ResponsesResource}
 * (`client.responses`) instead. The migration guide:
 * https://platform.openai.com/docs/assistants/migration. This resource is kept
 * for backwards-compatibility with existing code; expect the upstream endpoint
 * to stop responding after the sunset date.
 *
 * @see https://docs.litellm.ai/docs/assistants
 */
export class AssistantsResource {
  readonly threads: ThreadsResource;

  constructor(private request: RequestFn) {
    this.threads = new ThreadsResource(request);
  }

  /**
   * Create a new assistant.
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param params - Assistant config: `model`, plus optional `name`,
   *   `instructions`, `tools`, `tool_resources`, and `metadata`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `AssistantObject`.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
  create(params: AssistantCreateParams, options?: RequestOptions): Promise<AssistantObject> {
    return this.request<AssistantObject>({
      method: 'POST',
      path: '/v1/assistants',
      body: { kind: 'json', value: params },
      options: withBeta(options),
    });
  }

  /**
   * List assistants (paginated).
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param params - Pagination filters: `after`, `before`, `limit`, `order`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `AssistantListResponse` page of assistants.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
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

  /**
   * Delete an assistant.
   *
   * Automatically sets the `OpenAI-Beta: assistants=v2` header.
   *
   * @param assistantId - The id of the assistant to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `AssistantDeletedResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/assistants
   */
  delete(assistantId: string, options?: RequestOptions): Promise<AssistantDeletedResponse> {
    return this.request<AssistantDeletedResponse>({
      method: 'DELETE',
      path: `/v1/assistants/${encodeURIComponent(assistantId)}`,
      options: withBeta(options),
    });
  }
}
