import { buildError, ConnectionError, TimeoutError, type LiteLLMErrorBody } from './errors';
import { parseSSEStream, Stream } from './streaming';
import { ChatResource } from './resources/chat';
import { EmbeddingsResource } from './resources/embeddings';
import { ModelsResource } from './resources/models';
import { KeysResource } from './resources/keys';
import { UsersResource } from './resources/users';
import { TeamsResource } from './resources/teams';
import { BudgetsResource } from './resources/budgets';
import { HealthResource } from './resources/health';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export interface LiteLLMProxyClientConfig {
  /** Base URL of the LiteLLM proxy (e.g. "http://localhost:4000") */
  baseUrl: string;
  /** API key sent via Authorization: Bearer header */
  apiKey?: string;
  /** Request timeout in ms (default: 60 000) */
  timeout?: number;
  /** Max retries for 429 / 5xx errors (default: 2) */
  maxRetries?: number;
  /** Extra headers sent with every request */
  defaultHeaders?: Record<string, string>;
  /** Custom fetch implementation (for testing or edge runtimes) */
  fetch?: typeof globalThis.fetch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public method signatures exposed to resource classes
// ─────────────────────────────────────────────────────────────────────────────

export type RequestFn = <T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
) => Promise<T>;

export type StreamRequestFn = <T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
) => Promise<Stream<T>>;

// ─────────────────────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRIABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export class LiteLLMProxyClient {
  readonly chat: ChatResource;
  readonly embeddings: EmbeddingsResource;
  readonly models: ModelsResource;
  readonly keys: KeysResource;
  readonly users: UsersResource;
  readonly teams: TeamsResource;
  readonly budgets: BudgetsResource;
  readonly health: HealthResource;

  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config: LiteLLMProxyClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);

    // Bind request helpers so resource classes can use them
    const request: RequestFn = this.request.bind(this);
    const streamRequest: StreamRequestFn = this.streamRequest.bind(this);

    this.chat = new ChatResource(request, streamRequest);
    this.embeddings = new EmbeddingsResource(request);
    this.models = new ModelsResource(request);
    this.keys = new KeysResource(request);
    this.users = new UsersResource(request);
    this.teams = new TeamsResource(request);
    this.budgets = new BudgetsResource(request);
    this.health = new HealthResource(request);
  }

  // ─── Internal: JSON request with retry ───────────────────────────────────

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const response = await this.fetchWithRetry(method, path, body, extraHeaders);

    if (!response.ok) {
      let errorBody: LiteLLMErrorBody | null = null;
      try {
        errorBody = await response.json() as LiteLLMErrorBody;
      } catch {
        // Body couldn't be parsed as JSON
      }
      throw buildError(response.status, response.headers, errorBody);
    }

    return response.json() as Promise<T>;
  }

  // ─── Internal: SSE streaming request ─────────────────────────────────────

  private async streamRequest<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<Stream<T>> {
    const controller = new AbortController();
    const response = await this.rawFetch(method, path, body, extraHeaders, controller.signal);

    if (!response.ok) {
      let errorBody: LiteLLMErrorBody | null = null;
      try {
        errorBody = await response.json() as LiteLLMErrorBody;
      } catch {
        // Couldn't parse error body
      }
      throw buildError(response.status, response.headers, errorBody);
    }

    if (!response.body) {
      throw new ConnectionError('Response body is null — streaming requires a readable body');
    }

    const iterable = parseSSEStream(response.body) as unknown as AsyncIterable<T>;
    return new Stream(iterable, controller);
  }

  // ─── Internal: fetch with retry & timeout ────────────────────────────────

  private async fetchWithRetry(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<Response> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.rawFetch(method, path, body, extraHeaders);

        if (response.ok || !RETRIABLE_STATUS_CODES.has(response.status)) {
          return response;
        }

        // Retriable status — wait and try again
        lastError = buildError(response.status, response.headers, null);

        if (attempt < this.maxRetries) {
          const retryAfter = response.headers.get('retry-after');
          const delayMs = retryAfter
            ? Math.min(parseInt(retryAfter, 10) * 1000, 30_000)
            : Math.min(500 * Math.pow(2, attempt), 30_000);
          await sleep(delayMs);
        }
      } catch (err) {
        if (err instanceof TimeoutError || err instanceof TypeError) {
          lastError = err instanceof TimeoutError ? err : new ConnectionError('Network error', err);
          if (attempt < this.maxRetries) {
            await sleep(500 * Math.pow(2, attempt));
          }
        } else {
          throw err;
        }
      }
    }

    throw lastError ?? new ConnectionError('Request failed after retries');
  }

  private async rawFetch(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      'content-type': 'application/json',
      ...extraHeaders,
    };

    if (this.apiKey) {
      headers['authorization'] = `Bearer ${this.apiKey}`;
    }

    const abortController = new AbortController();
    const externalSignal = signal;

    // Combine external signal with timeout
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (this.timeout > 0) {
      timeoutId = setTimeout(() => abortController.abort(), this.timeout);
    }

    if (externalSignal) {
      externalSignal.addEventListener('abort', () => abortController.abort(), { once: true });
    }

    try {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal: abortController.signal,
      });
      return response;
    } catch (err) {
      if (abortController.signal.aborted && !externalSignal?.aborted) {
        throw new TimeoutError(`Request to ${method} ${path} timed out after ${this.timeout}ms`);
      }
      throw err;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
