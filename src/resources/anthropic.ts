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
  AnthropicSkillFileUpload,
  AnthropicSkillListParams,
  AnthropicSkillRetrieveParams,
  AnthropicSkillDeleteParams,
  AnthropicSkillListResponse,
  AnthropicSkillDeletedResponse,
} from '../types/anthropic';
import { ANTHROPIC_BETA_SKILLS } from '../types/anthropic';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';
import { toBlob } from '../internal/form';

export class AnthropicMessagesResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /**
   * Create a message via Anthropic's native `/v1/messages` endpoint.
   *
   * When `params.stream === true`, returns a {@link Stream} of
   * {@link MessageStreamEvent}; otherwise resolves to a complete
   * {@link AnthropicMessage}. `extra_headers` is forwarded to the upstream
   * Anthropic API on a per-request basis.
   *
   * @param params - Anthropic Messages request body (model, messages, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The completed message, or an event stream when `stream: true`.
   *
   * @see https://docs.litellm.ai/docs/anthropic_unified/
   */
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

  /**
   * Count tokens for an Anthropic Messages request without invoking the model.
   *
   * Useful for pre-flight cost estimation or context-window checks.
   *
   * @param params - Same shape as `create`'s body, minus sampling fields.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The token count breakdown for the request.
   *
   * @see https://docs.litellm.ai/docs/anthropic_count_tokens
   */
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

const SKILLS_HEADERS = { 'anthropic-beta': ANTHROPIC_BETA_SKILLS };

function withSkillsBeta(options?: RequestOptions): RequestOptions {
  return {
    ...(options ?? {}),
    headers: { ...SKILLS_HEADERS, ...(options?.headers ?? {}) },
  };
}

/** Build the query object for a skills request: defaults `beta=true`, optional `model`. */
function skillsQuery(
  params: { beta?: boolean; model?: string } | undefined,
  options?: RequestOptions,
): Record<string, string | number | boolean | undefined | null> {
  const beta = params?.beta ?? true;
  const out: Record<string, string | number | boolean | undefined | null> = {
    ...(options?.query ?? {}),
  };
  if (beta) out.beta = true;
  if (params?.model !== undefined) out.model = params.model;
  return out;
}

export class AnthropicSkillsResource {
  constructor(private request: RequestFn) {}

  /**
   * Upload a new Anthropic Skill (multipart/form-data) to `/v1/skills`.
   *
   * Automatically sets the required `anthropic-beta: skills-2025-10-02` header
   * and `beta=true` query param. Pass `model` for credential routing. Accepts a
   * single file payload, a single `{ file, filename }` upload, or an array of
   * `AnthropicSkillFileUpload` entries.
   *
   * @param params - `display_title`, the file(s) to upload, and optional `model` / `beta` overrides.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created skill object.
   *
   * @see https://docs.litellm.ai/docs/skills
   */
  create(
    params: AnthropicSkillCreateParams,
    options?: RequestOptions,
  ): Promise<AnthropicSkillObject> {
    const form = new FormData();
    form.append('display_title', params.display_title);

    const filesInput = params.files;
    const append = (
      data: ArrayBuffer | Uint8Array | Blob | string,
      filename: string,
      contentType?: string,
    ): void => {
      const blob = toBlob(data, contentType ?? 'application/octet-stream');
      form.append('files[]', blob, filename);
    };

    if (Array.isArray(filesInput)) {
      for (const entry of filesInput as AnthropicSkillFileUpload[]) {
        append(entry.file, entry.filename, entry.contentType);
      }
    } else if (
      typeof filesInput === 'object' &&
      filesInput !== null &&
      !(filesInput instanceof Blob) &&
      !(filesInput instanceof Uint8Array) &&
      !(filesInput instanceof ArrayBuffer) &&
      'file' in (filesInput as object) &&
      'filename' in (filesInput as object)
    ) {
      const single = filesInput as AnthropicSkillFileUpload;
      append(single.file, single.filename, single.contentType);
    } else {
      append(
        filesInput as ArrayBuffer | Uint8Array | Blob | string,
        params.filename ?? 'skill.zip',
        params.contentType,
      );
    }

    if (params.model !== undefined) form.append('model', params.model);

    return this.request<AnthropicSkillObject>({
      method: 'POST',
      path: '/v1/skills',
      body: { kind: 'form', value: form },
      options: {
        ...withSkillsBeta(options),
        query: skillsQuery({ beta: params.beta, model: params.model }, options),
      },
    });
  }

  /**
   * List Anthropic Skills available to the caller.
   *
   * Sets the skills beta header and forwards optional pagination/filter params
   * as query string entries.
   *
   * @param params - Optional `beta`, `model`, and pagination filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of skill objects.
   *
   * @see https://docs.litellm.ai/docs/skills
   */
  list(
    params: AnthropicSkillListParams = {},
    options?: RequestOptions,
  ): Promise<AnthropicSkillListResponse> {
    const { beta, model, ...rest } = params;
    const query = {
      ...skillsQuery({ beta, model }, options),
      ...rest,
    } as Record<string, string | number | boolean | undefined | null>;
    return this.request<AnthropicSkillListResponse>({
      method: 'GET',
      path: '/v1/skills',
      options: {
        ...withSkillsBeta(options),
        query,
      },
    });
  }

  /**
   * Retrieve a single Anthropic Skill by id.
   *
   * @param skillId - The skill identifier returned from `create`.
   * @param params - Optional `beta` / `model` query overrides.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The skill object.
   *
   * @see https://docs.litellm.ai/docs/skills
   */
  retrieve(
    skillId: string,
    params: AnthropicSkillRetrieveParams = {},
    options?: RequestOptions,
  ): Promise<AnthropicSkillObject> {
    return this.request<AnthropicSkillObject>({
      method: 'GET',
      path: `/v1/skills/${encodeURIComponent(skillId)}`,
      options: {
        ...withSkillsBeta(options),
        query: skillsQuery(params, options),
      },
    });
  }

  /**
   * Delete an Anthropic Skill by id.
   *
   * @param skillId - The skill identifier to remove.
   * @param params - Optional `beta` / `model` query overrides.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/skills
   */
  delete(
    skillId: string,
    params: AnthropicSkillDeleteParams = {},
    options?: RequestOptions,
  ): Promise<AnthropicSkillDeletedResponse> {
    return this.request<AnthropicSkillDeletedResponse>({
      method: 'DELETE',
      path: `/v1/skills/${encodeURIComponent(skillId)}`,
      options: {
        ...withSkillsBeta(options),
        query: skillsQuery(params, options),
      },
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
