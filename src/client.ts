import { buildError, ConnectionError, TimeoutError, type LiteLLMErrorBody } from './errors';
import { parseSSEStream, Stream } from './streaming';
import { ChatResource } from './resources/chat';
import { CompletionsResource } from './resources/completions';
import { EmbeddingsResource } from './resources/embeddings';
import { ModelsResource } from './resources/models';
import { KeysResource } from './resources/keys';
import { UsersResource } from './resources/users';
import { TeamsResource } from './resources/teams';
import { BudgetsResource } from './resources/budgets';
import { HealthResource } from './resources/health';
import { FilesResource } from './resources/files';
import { BatchesResource } from './resources/batches';
import { AudioResource } from './resources/audio';
import { ImagesResource } from './resources/images';
import { ModerationsResource } from './resources/moderations';
import { RerankResource } from './resources/rerank';
import { ResponsesResource } from './resources/responses';
import { CustomersResource } from './resources/customers';
import { SpendResource } from './resources/spend';
import { FineTuningResource } from './resources/fine_tuning';
import { AssistantsResource } from './resources/assistants';
import { OrganizationsResource } from './resources/organizations';
import { TagsResource } from './resources/tags';
import { GuardrailsResource } from './resources/guardrails';
import { CredentialsResource } from './resources/credentials';
import { VectorStoresResource } from './resources/vector_stores';
import { McpResource } from './resources/mcp';
import { ContainersResource } from './resources/containers';
import { EvalsResource } from './resources/evals';
import { RealtimeResource } from './resources/realtime';
import { VideoResource } from './resources/videos';
import { OcrResource } from './resources/ocr';
import { SearchResource } from './resources/search';
import { RagResource } from './resources/rag';
import { AgentsResource } from './resources/agents';
import { PromptsResource } from './resources/prompts';
import { A2AResource } from './resources/a2a';
import { AnthropicResource } from './resources/anthropic';
import { GeminiResource } from './resources/gemini';
import { PassThroughResource } from './resources/pass_through';
import { ComplianceResource } from './resources/compliance';
import { UtilsResource } from './resources/utils';
import { CostResource } from './resources/cost';
import { CacheResource } from './resources/cache';
import { FallbacksResource } from './resources/fallbacks';
import { ToolsResource } from './resources/tools';
import { RouterSettingsResource } from './resources/router_settings';
import { CallbacksResource } from './resources/callbacks';
import { PoliciesResource } from './resources/policies';
import { JwtKeyMappingResource } from './resources/jwt';
import { AccessGroupsResource } from './resources/access_groups';
import { ScimResource } from './resources/scim';
import { PublicResource } from './resources/public';
import { PassThroughConfigResource } from './resources/pass_through_config';
import { AuditResource } from './resources/audit';
import { ClaudeCodeResource } from './resources/claude_code';
import { CloudZeroResource } from './resources/cloudzero';
import { VantageResource } from './resources/vantage';
import { DiscoveryResource } from './resources/discovery';
import { EmailEventsResource } from './resources/email_events';
import { MiscResource } from './resources/misc';
import { ProjectsResource } from './resources/projects';
import { SettingsResource } from './resources/settings';
import { UnifiedAccessGroupsResource } from './resources/unified_access_groups';
import { InteractionsResource } from './resources/interactions';
import { OpenAIPassthroughResource } from './resources/openai_passthrough';
import type { RequestOptions } from './types/request-options';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export interface LiteLLMClientConfig {
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
// Body kinds the client knows how to send
// ─────────────────────────────────────────────────────────────────────────────

export type RequestBodyKind =
  | { kind: 'json'; value: unknown }
  | { kind: 'form'; value: FormData }
  | { kind: 'text'; value: string; contentType?: string }
  | { kind: 'binary'; value: ArrayBuffer | Uint8Array | Blob; contentType?: string }
  | { kind: 'none' };

// ─────────────────────────────────────────────────────────────────────────────
// Public method signatures exposed to resource classes
// ─────────────────────────────────────────────────────────────────────────────

export interface InternalRequestParams {
  method: string;
  path: string;
  body?: RequestBodyKind;
  options?: RequestOptions;
}

export type RequestFn = <T = unknown>(params: InternalRequestParams) => Promise<T>;
export type RawRequestFn = (params: InternalRequestParams) => Promise<Response>;
export type StreamRequestFn = <T>(params: InternalRequestParams) => Promise<Stream<T>>;

// ─────────────────────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRIABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);

export class LiteLLMClient {
  readonly chat: ChatResource;
  readonly completions: CompletionsResource;
  readonly embeddings: EmbeddingsResource;
  readonly models: ModelsResource;
  readonly keys: KeysResource;
  readonly users: UsersResource;
  readonly teams: TeamsResource;
  readonly budgets: BudgetsResource;
  readonly health: HealthResource;
  readonly files: FilesResource;
  readonly batches: BatchesResource;
  readonly audio: AudioResource;
  readonly images: ImagesResource;
  readonly moderations: ModerationsResource;
  readonly rerank: RerankResource;
  readonly responses: ResponsesResource;
  readonly customers: CustomersResource;
  readonly spend: SpendResource;
  readonly fineTuning: FineTuningResource;
  readonly assistants: AssistantsResource;
  readonly organizations: OrganizationsResource;
  readonly tags: TagsResource;
  readonly guardrails: GuardrailsResource;
  readonly credentials: CredentialsResource;
  readonly vectorStores: VectorStoresResource;
  readonly mcp: McpResource;
  readonly containers: ContainersResource;
  readonly evals: EvalsResource;
  readonly realtime: RealtimeResource;
  readonly videos: VideoResource;
  readonly ocr: OcrResource;
  readonly search: SearchResource;
  readonly rag: RagResource;
  readonly agents: AgentsResource;
  readonly prompts: PromptsResource;
  readonly a2a: A2AResource;
  readonly anthropic: AnthropicResource;
  readonly gemini: GeminiResource;
  readonly passThrough: PassThroughResource;
  readonly compliance: ComplianceResource;
  readonly utils: UtilsResource;
  readonly cost: CostResource;
  readonly cache: CacheResource;
  readonly fallbacks: FallbacksResource;
  readonly tools: ToolsResource;
  readonly routerSettings: RouterSettingsResource;
  readonly callbacks: CallbacksResource;
  readonly policies: PoliciesResource;
  readonly jwt: JwtKeyMappingResource;
  readonly accessGroups: AccessGroupsResource;
  readonly public: PublicResource;
  readonly passThroughConfig: PassThroughConfigResource;
  readonly audit: AuditResource;
  readonly claudeCode: ClaudeCodeResource;
  readonly cloudzero: CloudZeroResource;
  readonly vantage: VantageResource;
  readonly discovery: DiscoveryResource;
  readonly emailEvents: EmailEventsResource;
  readonly misc: MiscResource;
  readonly projects: ProjectsResource;
  readonly scim: ScimResource;
  readonly settings: SettingsResource;
  readonly unifiedAccessGroups: UnifiedAccessGroupsResource;
  readonly interactions: InteractionsResource;
  readonly openaiPassthrough: OpenAIPassthroughResource;

  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config: LiteLLMClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);

    const request: RequestFn = this.request.bind(this);
    const rawRequest: RawRequestFn = this.rawRequest.bind(this);
    const streamRequest: StreamRequestFn = this.streamRequest.bind(this);

    this.chat = new ChatResource(request, streamRequest);
    this.completions = new CompletionsResource(request, streamRequest);
    this.embeddings = new EmbeddingsResource(request);
    this.models = new ModelsResource(request);
    this.keys = new KeysResource(request);
    this.users = new UsersResource(request);
    this.teams = new TeamsResource(request);
    this.budgets = new BudgetsResource(request);
    this.health = new HealthResource(request);
    this.files = new FilesResource(request, rawRequest);
    this.batches = new BatchesResource(request);
    this.audio = new AudioResource(request, rawRequest);
    this.images = new ImagesResource(request);
    this.moderations = new ModerationsResource(request);
    this.rerank = new RerankResource(request);
    this.responses = new ResponsesResource(request, streamRequest);
    this.customers = new CustomersResource(request);
    this.spend = new SpendResource(request);
    this.fineTuning = new FineTuningResource(request);
    this.assistants = new AssistantsResource(request);
    this.organizations = new OrganizationsResource(request);
    this.tags = new TagsResource(request);
    this.guardrails = new GuardrailsResource(request);
    this.credentials = new CredentialsResource(request);
    this.vectorStores = new VectorStoresResource(request);
    this.mcp = new McpResource(request, streamRequest);
    this.containers = new ContainersResource(request, rawRequest);
    this.evals = new EvalsResource(request);
    this.realtime = new RealtimeResource(request);
    this.videos = new VideoResource(request, rawRequest);
    this.ocr = new OcrResource(request);
    this.search = new SearchResource(request);
    this.rag = new RagResource(request);
    this.agents = new AgentsResource(request);
    this.prompts = new PromptsResource(request);
    this.a2a = new A2AResource(request);
    this.anthropic = new AnthropicResource(request, streamRequest);
    this.gemini = new GeminiResource(request, streamRequest);
    this.passThrough = new PassThroughResource(request, streamRequest);
    this.compliance = new ComplianceResource(request);
    this.utils = new UtilsResource(request);
    this.cost = new CostResource(request);
    this.cache = new CacheResource(request);
    this.fallbacks = new FallbacksResource(request);
    this.tools = new ToolsResource(request);
    this.routerSettings = new RouterSettingsResource(request);
    this.callbacks = new CallbacksResource(request);
    this.policies = new PoliciesResource(request);
    this.jwt = new JwtKeyMappingResource(request);
    this.accessGroups = new AccessGroupsResource(request);
    this.public = new PublicResource(request);
    this.passThroughConfig = new PassThroughConfigResource(request);
    this.audit = new AuditResource(request);
    this.claudeCode = new ClaudeCodeResource(request);
    this.cloudzero = new CloudZeroResource(request);
    this.vantage = new VantageResource(request);
    this.discovery = new DiscoveryResource(request);
    this.emailEvents = new EmailEventsResource(request);
    this.misc = new MiscResource(request, streamRequest);
    this.projects = new ProjectsResource(request);
    this.scim = new ScimResource(request);
    this.settings = new SettingsResource(request);
    this.unifiedAccessGroups = new UnifiedAccessGroupsResource(request);
    this.interactions = new InteractionsResource(request);
    this.openaiPassthrough = new OpenAIPassthroughResource(request);
  }

  // ─── Internal: JSON request with retry ───────────────────────────────────

  private async request<T = unknown>(params: InternalRequestParams): Promise<T> {
    const response = await this.rawRequest(params);

    if (!response.ok) {
      throw await this.parseError(response);
    }

    if (response.status === 204) return undefined as unknown as T;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    const text = await response.text();
    if (!text) return undefined as unknown as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  /** Internal: returns a raw Response (caller is responsible for body). */
  private async rawRequest(params: InternalRequestParams): Promise<Response> {
    const response = await this.fetchWithRetry(params);
    if (!response.ok) {
      throw await this.parseError(response);
    }
    return response;
  }

  // ─── Internal: SSE streaming request ─────────────────────────────────────

  private async streamRequest<T>(params: InternalRequestParams): Promise<Stream<T>> {
    const controller = new AbortController();
    const externalSignal = params.options?.signal;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const response = await this.rawFetch({
      ...params,
      options: { ...(params.options ?? {}), signal: controller.signal },
    });

    if (!response.ok) {
      throw await this.parseError(response);
    }
    if (!response.body) {
      throw new ConnectionError('Response body is null — streaming requires a readable body');
    }

    const iterable = parseSSEStream<T>(response.body);
    return new Stream<T>(iterable, controller);
  }

  private async parseError(response: Response): Promise<Error> {
    let errorBody: LiteLLMErrorBody | null = null;
    try {
      const text = await response.text();
      if (text) errorBody = JSON.parse(text) as LiteLLMErrorBody;
    } catch {
      // Body wasn't JSON
    }
    return buildError(response.status, response.headers, errorBody);
  }

  // ─── Internal: fetch with retry & timeout ────────────────────────────────

  private async fetchWithRetry(params: InternalRequestParams): Promise<Response> {
    const maxRetries = params.options?.maxRetries ?? this.maxRetries;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.rawFetch(params);
        if (response.ok || !RETRIABLE_STATUS_CODES.has(response.status)) {
          return response;
        }
        lastError = buildError(response.status, response.headers, null);

        if (attempt < maxRetries) {
          const retryAfter = response.headers.get('retry-after');
          const delayMs = retryAfter
            ? Math.min(parseInt(retryAfter, 10) * 1000, 30_000)
            : Math.min(500 * Math.pow(2, attempt), 30_000);
          await sleep(delayMs);
        }
      } catch (err) {
        if (err instanceof TimeoutError || err instanceof TypeError) {
          lastError =
            err instanceof TimeoutError ? err : new ConnectionError('Network error', err);
          if (attempt < maxRetries) {
            await sleep(500 * Math.pow(2, attempt));
          }
        } else {
          throw err;
        }
      }
    }

    throw lastError ?? new ConnectionError('Request failed after retries');
  }

  private async rawFetch(params: InternalRequestParams): Promise<Response> {
    const { method, path, body, options } = params;
    const url = this.buildUrl(path, options?.query);
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options?.headers ?? {}),
    };

    if (this.apiKey && !headers['authorization'] && !headers['Authorization']) {
      headers['authorization'] = `Bearer ${this.apiKey}`;
    }

    let fetchBody: BodyInit | undefined;
    if (body && body.kind === 'json' && body.value !== undefined) {
      headers['content-type'] = headers['content-type'] ?? 'application/json';
      fetchBody = JSON.stringify(body.value);
    } else if (body && body.kind === 'form') {
      delete headers['content-type'];
      delete headers['Content-Type'];
      fetchBody = body.value;
    } else if (body && body.kind === 'text') {
      if (body.contentType) headers['content-type'] = body.contentType;
      fetchBody = body.value;
    } else if (body && body.kind === 'binary') {
      if (body.contentType) headers['content-type'] = body.contentType;
      fetchBody =
        body.value instanceof Blob
          ? body.value
          : new Uint8Array(
              body.value instanceof Uint8Array ? body.value : new Uint8Array(body.value),
            );
    }

    const timeout = options?.timeout ?? this.timeout;
    const abortController = new AbortController();
    const externalSignal = options?.signal;
    if (externalSignal) {
      if (externalSignal.aborted) abortController.abort();
      else externalSignal.addEventListener('abort', () => abortController.abort(), { once: true });
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        abortController.abort();
      }, timeout);
    }

    try {
      return await this.fetchFn(url, {
        method,
        headers,
        body: fetchBody,
        signal: abortController.signal,
      });
    } catch (err) {
      if (timedOut) {
        throw new TimeoutError(`Request to ${method} ${path} timed out after ${timeout}ms`);
      }
      throw err;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    let url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (query) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        qs.append(k, String(v));
      }
      const s = qs.toString();
      if (s.length > 0) url += (url.includes('?') ? '&' : '?') + s;
    }
    return url;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
