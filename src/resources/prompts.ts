import type {
  PromptObject,
  PromptCreateParams,
  PromptUpdateParams,
  PromptListResponse,
  PromptDeleteResponse,
  PromptTestParams,
  PromptPatchParams,
  PromptListLegacyResponse,
  DotpromptJsonConverterResponse,
} from '../types/prompts';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Prompt management resource — `/prompts` CRUD.
 *
 * NOTE: the public docs for this surface are sparse and defer to the
 * Swagger spec for full schemas. Method shapes mirror the proxy's other
 * config-resource patterns (`/agents`, `/credentials`).
 */
export class PromptsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new managed prompt.
   *
   * @param params - The prompt creation payload (name, template, variables, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The persisted prompt record.
   *
   * @see https://docs.litellm.ai/docs/proxy/prompt_management
   */
  create(params: PromptCreateParams, options?: RequestOptions): Promise<PromptObject> {
    return this.request<PromptObject>({
      method: 'POST',
      path: '/prompts',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve a single managed prompt by id.
   *
   * @param promptId - The prompt identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The prompt record.
   *
   * @see https://docs.litellm.ai/docs/proxy/prompt_management
   */
  retrieve(promptId: string, options?: RequestOptions): Promise<PromptObject> {
    return this.request<PromptObject>({
      method: 'GET',
      path: `/prompts/${encodeURIComponent(promptId)}`,
      options,
    });
  }

  /**
   * Update an existing managed prompt.
   *
   * @param promptId - The prompt identifier to update.
   * @param params - The replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated prompt record.
   *
   * @see https://docs.litellm.ai/docs/proxy/prompt_management
   */
  update(
    promptId: string,
    params: PromptUpdateParams,
    options?: RequestOptions,
  ): Promise<PromptObject> {
    return this.request<PromptObject>({
      method: 'PUT',
      path: `/prompts/${encodeURIComponent(promptId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Partially update a managed prompt
   * (`PATCH /prompts/{prompt_id}`).
   *
   * @param promptId - The prompt identifier to update.
   * @param params - Partial replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated prompt record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
   */
  patch(
    promptId: string,
    params: PromptPatchParams,
    options?: RequestOptions,
  ): Promise<PromptObject> {
    return this.request<PromptObject>({
      method: 'PATCH',
      path: `/prompts/${encodeURIComponent(promptId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List managed prompts using the legacy `/prompts/list` endpoint.
   *
   * Distinct from `GET /prompts` — this variant returns the proxy's wrapped
   * `{ prompts: [...] }` envelope used by the management UI. Prefer the
   * top-level `GET /prompts` (not yet exposed on this resource) for new code.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of prompt records, wrapped in `{ prompts: [...] }`.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
   */
  listLegacy(options?: RequestOptions): Promise<PromptListLegacyResponse> {
    return this.request<PromptListLegacyResponse>({
      method: 'GET',
      path: '/prompts/list',
      options,
    });
  }

  /**
   * Delete a managed prompt by id.
   *
   * @param promptId - The prompt identifier to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/prompt_management
   */
  delete(promptId: string, options?: RequestOptions): Promise<PromptDeleteResponse> {
    return this.request<PromptDeleteResponse>({
      method: 'DELETE',
      path: `/prompts/${encodeURIComponent(promptId)}`,
      options,
    });
  }

  /**
   * List all versions of a managed prompt
   * (`GET /prompts/{prompt_id}/versions`).
   *
   * @param promptId - The base prompt id.
   * @param params - Optional `environment` filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A list of prompt versions.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
   */
  versions(
    promptId: string,
    params: { environment?: string; [key: string]: unknown } = {},
    options?: RequestOptions,
  ): Promise<PromptListResponse> {
    return this.request<PromptListResponse>({
      method: 'GET',
      path: `/prompts/${encodeURIComponent(promptId)}/versions`,
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
   * Get the info payload for a managed prompt
   * (`GET /prompts/{prompt_id}/info`). Same shape as `retrieve`.
   *
   * @param promptId - The prompt id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The prompt info record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
   */
  info(promptId: string, options?: RequestOptions): Promise<PromptObject> {
    return this.request<PromptObject>({
      method: 'GET',
      path: `/prompts/${encodeURIComponent(promptId)}/info`,
      options,
    });
  }

  /**
   * Render a `.prompt` (dotprompt) template and run a streaming
   * chat completion against it (`POST /prompts/test`).
   *
   * The proxy always streams the response. Returned `unknown` because the
   * exact stream-aggregated shape depends on the rendered model — callers
   * needing the streaming form should use `client.chat.completions` directly.
   *
   * @param params - Dotprompt content + variables + optional history.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Render + completion result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
   */
  test(params: PromptTestParams, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/prompts/test',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Convert a `.prompt` file upload to JSON
   * (`POST /utils/dotprompt_json_converter`).
   *
   * The endpoint accepts a multipart form with a single `file` field. The
   * SDK delegates body construction to the caller — pass either a `FormData`
   * containing the file under `file` or any value the runtime accepts.
   *
   * @param form - `FormData` containing the `.prompt` file under the `file` key.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Parsed dotprompt content + metadata.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
   */
  dotpromptJsonConverter(
    form: FormData,
    options?: RequestOptions,
  ): Promise<DotpromptJsonConverterResponse> {
    return this.request<DotpromptJsonConverterResponse>({
      method: 'POST',
      path: '/utils/dotprompt_json_converter',
      body: { kind: 'form', value: form },
      options,
    });
  }
}
