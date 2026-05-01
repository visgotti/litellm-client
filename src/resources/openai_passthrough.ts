import type {
  OpenAIPassthroughConfig,
  OpenAIPassthroughCreateParams,
  OpenAIPassthroughDeleteResponse,
  OpenAIPassthroughPatchParams,
  OpenAIPassthroughReplaceParams,
} from '../types/openai_passthrough';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Admin CRUD for OpenAI passthrough configurations stored on the proxy
 * (`/openai_passthrough/{id}`).
 *
 * Distinct from the runtime escape-hatch under `/openai_passthrough/...`
 * (see `client.passThrough.openaiPassthrough`) which forwards request
 * payloads to the upstream OpenAI API. This resource manages the named
 * configuration records that drive that forwarding.
 */
export class OpenAIPassthroughResource {
  constructor(private request: RequestFn) {}

  /**
   * Retrieve a passthrough config (`GET /openai_passthrough/{id}`).
   *
   * @param id - The passthrough config identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The passthrough config record.
   */
  retrieve(id: string, options?: RequestOptions): Promise<OpenAIPassthroughConfig> {
    return this.request<OpenAIPassthroughConfig>({
      method: 'GET',
      path: `/openai_passthrough/${encodeURIComponent(id)}`,
      options,
    });
  }

  /**
   * Create a passthrough config (`POST /openai_passthrough/{id}`).
   *
   * @param id - The passthrough config identifier to create.
   * @param params - Configuration payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created passthrough config record.
   */
  create(
    id: string,
    params: OpenAIPassthroughCreateParams,
    options?: RequestOptions,
  ): Promise<OpenAIPassthroughConfig> {
    return this.request<OpenAIPassthroughConfig>({
      method: 'POST',
      path: `/openai_passthrough/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Patch a passthrough config (`PATCH /openai_passthrough/{id}`).
   *
   * @param id - The passthrough config identifier to update.
   * @param params - Partial replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated passthrough config record.
   */
  update(
    id: string,
    params: OpenAIPassthroughPatchParams,
    options?: RequestOptions,
  ): Promise<OpenAIPassthroughConfig> {
    return this.request<OpenAIPassthroughConfig>({
      method: 'PATCH',
      path: `/openai_passthrough/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Replace a passthrough config (`PUT /openai_passthrough/{id}`).
   *
   * @param id - The passthrough config identifier.
   * @param params - Full replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The replaced passthrough config record.
   */
  replace(
    id: string,
    params: OpenAIPassthroughReplaceParams,
    options?: RequestOptions,
  ): Promise<OpenAIPassthroughConfig> {
    return this.request<OpenAIPassthroughConfig>({
      method: 'PUT',
      path: `/openai_passthrough/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a passthrough config (`DELETE /openai_passthrough/{id}`).
   *
   * @param id - The passthrough config identifier to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   */
  delete(
    id: string,
    options?: RequestOptions,
  ): Promise<OpenAIPassthroughDeleteResponse> {
    return this.request<OpenAIPassthroughDeleteResponse>({
      method: 'DELETE',
      path: `/openai_passthrough/${encodeURIComponent(id)}`,
      options,
    });
  }
}
