import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';
import { PASS_THROUGH_PREFIXES } from '../types/pass_through';

/**
 * Generic typed escape hatch for a single pass-through provider on the
 * LiteLLM proxy. Forwards arbitrary HTTP requests to the proxy's
 * `<prefix>/<path>` catch-all route.
 */
export class PassThroughProvider {
  private readonly prefix: string;

  constructor(
    private request: RequestFn,
    prefix: string,
  ) {
    // Normalize: ensure exactly one leading slash, no trailing slash.
    const trimmed = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
    this.prefix = `/${trimmed}`;
  }

  private buildPath(path: string): string {
    const cleaned = String(path ?? '').replace(/^\/+/, '');
    return `${this.prefix}/${cleaned}`;
  }

  get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'GET',
      path: this.buildPath(path),
      options,
    });
  }

  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'POST',
      path: this.buildPath(path),
      body: body === undefined ? { kind: 'none' } : { kind: 'json', value: body },
      options,
    });
  }

  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      path: this.buildPath(path),
      body: body === undefined ? { kind: 'none' } : { kind: 'json', value: body },
      options,
    });
  }

  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      path: this.buildPath(path),
      body: body === undefined ? { kind: 'none' } : { kind: 'json', value: body },
      options,
    });
  }

  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      path: this.buildPath(path),
      options,
    });
  }
}

export class PassThroughResource {
  readonly anthropic: PassThroughProvider;
  readonly gemini: PassThroughProvider;
  readonly vertex: PassThroughProvider;
  readonly cohere: PassThroughProvider;
  readonly mistral: PassThroughProvider;
  readonly vllm: PassThroughProvider;
  readonly milvus: PassThroughProvider;
  readonly bedrock: PassThroughProvider;
  readonly assemblyAi: PassThroughProvider;
  readonly azure: PassThroughProvider;
  readonly openai: PassThroughProvider;
  readonly cursor: PassThroughProvider;
  readonly langfuse: PassThroughProvider;

  constructor(request: RequestFn) {
    this.anthropic = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.anthropic);
    this.gemini = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.gemini);
    this.vertex = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.vertex);
    this.cohere = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.cohere);
    this.mistral = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.mistral);
    this.vllm = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.vllm);
    this.milvus = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.milvus);
    this.bedrock = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.bedrock);
    this.assemblyAi = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.assemblyAi);
    this.azure = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.azure);
    this.openai = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.openai);
    this.cursor = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.cursor);
    this.langfuse = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.langfuse);
  }
}
