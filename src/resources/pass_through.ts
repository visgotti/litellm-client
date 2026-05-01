import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';
import { PASS_THROUGH_PREFIXES } from '../types/pass_through';
import type {
  ConverseRequest,
  ConverseResponse,
  ConverseStreamEvent,
  BedrockGuardrailApplyParams,
  BedrockGuardrailApplyResponse,
  BedrockKBRetrieveParams,
  BedrockKBRetrieveResponse,
  BedrockKBRetrieveAndGenerateParams,
  BedrockKBRetrieveAndGenerateResponse,
  BedrockAgentInvokeParams,
  BedrockAgentInvokeStreamEvent,
} from '../types/bedrock';
import type {
  CursorMeResponse,
  CursorModelsResponse,
  CursorRepositoriesResponse,
  CursorAgentsListParams,
  CursorAgentsListResponse,
  CursorAgentLaunchParams,
  CursorAgent,
  CursorAgentRetrieveResponse,
  CursorAgentDeleteResponse,
  CursorAgentConversationResponse,
  CursorAgentFollowupParams,
  CursorAgentFollowupResponse,
  CursorAgentStopResponse,
} from '../types/cursor';
import type {
  VertexGenerateContentParams,
  VertexGenerateContentResponse,
  VertexEmbedContentParams,
  VertexEmbedContentResponse,
  VertexPredictParams,
  VertexPredictResponse,
  VertexBatchPredictionJobCreateParams,
  VertexBatchPredictionJob,
  VertexBatchPredictionJobListResponse,
} from '../types/vertex';
import type {
  CohereChatParams,
  CohereChatResponse,
  CohereChatV2Params,
  CohereChatV2Response,
  CohereEmbedParams,
  CohereEmbedResponse,
  CohereRerankParams,
  CohereRerankResponse,
  CohereClassifyParams,
  CohereClassifyResponse,
  CohereGenerateParams,
  CohereGenerateResponse,
  CohereTokenizeParams,
  CohereTokenizeResponse,
  CohereDetokenizeParams,
  CohereDetokenizeResponse,
} from '../types/cohere';
import type {
  MistralChatCompletionCreateParams,
  MistralChatCompletion,
  MistralEmbeddingCreateParams,
  MistralEmbeddingResponse,
  MistralFIMCompletionCreateParams,
  MistralFIMCompletion,
  MistralAgentsCompletionCreateParams,
  MistralAgentsCompletion,
  MistralModelsListResponse,
} from '../types/mistral';
import type {
  VLLMChatCompletionCreateParams,
  VLLMChatCompletion,
  VLLMCompletionCreateParams,
  VLLMCompletion,
  VLLMEmbeddingCreateParams,
  VLLMEmbeddingResponse,
  VLLMModelsListResponse,
} from '../types/vllm';
import type {
  MilvusCollectionsListParams,
  MilvusCollectionsListResponse,
  MilvusCollectionCreateParams,
  MilvusEmptyResponse,
  MilvusCollectionDropParams,
  MilvusCollectionDescribeParams,
  MilvusCollectionDescribeResponse,
  MilvusSearchParams,
  MilvusSearchResponse,
  MilvusInsertParams,
  MilvusInsertResponse,
  MilvusUpsertParams,
  MilvusUpsertResponse,
  MilvusDeleteParams,
  MilvusDeleteResponse,
  MilvusQueryParams,
  MilvusQueryResponse,
  MilvusPartitionListParams,
  MilvusPartitionListResponse,
  MilvusPartitionParams,
  MilvusPartitionMultiParams,
  MilvusPartitionHasResponse,
  MilvusIndexCreateParams,
  MilvusIndexDropParams,
  MilvusIndexDescribeParams,
  MilvusIndexDescribeResponse,
  MilvusIndexListParams,
  MilvusIndexListResponse,
} from '../types/milvus';
import type {
  AzureChatCompletionCreateParams,
  AzureChatCompletion,
  AzureCompletionCreateParams,
  AzureCompletion,
  AzureEmbeddingCreateParams,
  AzureEmbeddingResponse,
  AzureImageGenerateParams,
  AzureImageResponse,
  AzureTranscriptionCreateParams,
  AzureTranscription,
  AzureTranscriptionVerbose,
} from '../types/azure';
import { DEFAULT_AZURE_API_VERSION } from '../types/azure';
import type {
  LangfuseTracesListParams,
  LangfuseTracesListResponse,
  LangfuseTrace,
  LangfuseObservationsListParams,
  LangfuseObservationsListResponse,
  LangfuseObservation,
  LangfuseSpanCreateParams,
  LangfuseSpan,
  LangfuseScoresListParams,
  LangfuseScoresListResponse,
  LangfuseScoreCreateParams,
  LangfuseScore,
  LangfuseDatasetsListResponse,
  LangfuseDataset,
  LangfuseDatasetCreateParams,
  LangfusePromptsListResponse,
  LangfusePrompt,
  LangfusePromptCreateParams,
} from '../types/langfuse';
import type {
  AssemblyAITranscriptCreateParams,
  AssemblyAITranscript,
  AssemblyAITranscriptListParams,
  AssemblyAITranscriptListResponse,
  AssemblyAITranscriptDeleteResponse,
  AssemblyAISubtitleFormat,
  AssemblyAISentencesResponse,
  AssemblyAIParagraphsResponse,
  AssemblyAILemurTaskParams,
  AssemblyAILemurTaskResponse,
  AssemblyAILemurSummaryParams,
  AssemblyAILemurSummaryResponse,
  AssemblyAILemurQuestionAnswerParams,
  AssemblyAILemurQuestionAnswerResponse,
  AssemblyAIRealtimeTokenParams,
  AssemblyAIRealtimeTokenResponse,
  AssemblyAIUploadResponse,
} from '../types/assemblyai';

/**
 * Generic typed escape hatch for a single pass-through provider on the
 * LiteLLM proxy. Forwards arbitrary HTTP requests to the proxy's
 * `<prefix>/<path>` catch-all route.
 */
export class PassThroughProvider {
  protected readonly prefix: string;

  constructor(
    protected request: RequestFn,
    prefix: string,
  ) {
    // Normalize: ensure exactly one leading slash, no trailing slash.
    const trimmed = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
    this.prefix = `/${trimmed}`;
  }

  protected buildPath(path: string): string {
    const cleaned = String(path ?? '').replace(/^\/+/, '');
    return `${this.prefix}/${cleaned}`;
  }

  /**
   * Issue a raw `GET` request against the provider's pass-through prefix.
   *
   * Generic escape hatch — use this for any provider endpoint that does not
   * have a typed first-class method on the parent resource.
   *
   * @param path - Sub-path appended to the provider prefix (leading slash is normalized).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The decoded JSON response body, typed as the caller's `T`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/intro
   */
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'GET',
      path: this.buildPath(path),
      options,
    });
  }

  /**
   * Issue a raw `POST` request against the provider's pass-through prefix.
   *
   * Generic escape hatch — use this for any provider endpoint that does not
   * have a typed first-class method on the parent resource. The body is
   * JSON-encoded automatically; pass `undefined` for an empty body.
   *
   * @param path - Sub-path appended to the provider prefix (leading slash is normalized).
   * @param body - Optional JSON-serializable request body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The decoded JSON response body, typed as the caller's `T`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/intro
   */
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'POST',
      path: this.buildPath(path),
      body: body === undefined ? { kind: 'none' } : { kind: 'json', value: body },
      options,
    });
  }

  /**
   * Issue a raw `PUT` request against the provider's pass-through prefix.
   *
   * Generic escape hatch — use this for any provider endpoint that does not
   * have a typed first-class method on the parent resource. The body is
   * JSON-encoded automatically; pass `undefined` for an empty body.
   *
   * @param path - Sub-path appended to the provider prefix (leading slash is normalized).
   * @param body - Optional JSON-serializable request body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The decoded JSON response body, typed as the caller's `T`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/intro
   */
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      path: this.buildPath(path),
      body: body === undefined ? { kind: 'none' } : { kind: 'json', value: body },
      options,
    });
  }

  /**
   * Issue a raw `PATCH` request against the provider's pass-through prefix.
   *
   * Generic escape hatch — use this for any provider endpoint that does not
   * have a typed first-class method on the parent resource. The body is
   * JSON-encoded automatically; pass `undefined` for an empty body.
   *
   * @param path - Sub-path appended to the provider prefix (leading slash is normalized).
   * @param body - Optional JSON-serializable request body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The decoded JSON response body, typed as the caller's `T`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/intro
   */
  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      path: this.buildPath(path),
      body: body === undefined ? { kind: 'none' } : { kind: 'json', value: body },
      options,
    });
  }

  /**
   * Issue a raw `DELETE` request against the provider's pass-through prefix.
   *
   * Generic escape hatch — use this for any provider endpoint that does not
   * have a typed first-class method on the parent resource.
   *
   * @param path - Sub-path appended to the provider prefix (leading slash is normalized).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The decoded JSON response body, typed as the caller's `T`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/intro
   */
  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      path: this.buildPath(path),
      options,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bedrock typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export class BedrockGuardrailsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Apply a Bedrock guardrail to user/model content.
   *
   * Calls `POST /bedrock/guardrail/{guardrailId}/version/{version}/apply` —
   * the proxy forwards to AWS Bedrock's `ApplyGuardrail` action which evaluates
   * the supplied content against the guardrail's configured policies.
   *
   * @param guardrailId - The Bedrock guardrail identifier.
   * @param version - The guardrail version (e.g. `"1"` or `"DRAFT"`).
   * @param params - Source classification and content blocks to evaluate.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The guardrail evaluation result with action, assessments, and any masked output.
   *
   * @see https://docs.litellm.ai/docs/bedrock_invoke
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ApplyGuardrail.html
   */
  apply(
    guardrailId: string,
    version: string,
    params: BedrockGuardrailApplyParams,
    options?: RequestOptions,
  ): Promise<BedrockGuardrailApplyResponse> {
    return this.request<BedrockGuardrailApplyResponse>({
      method: 'POST',
      path: `${this.prefix}/guardrail/${encodeURIComponent(guardrailId)}/version/${encodeURIComponent(
        version,
      )}/apply`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class BedrockKnowledgeBasesResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Retrieve relevant chunks from a Bedrock Knowledge Base.
   *
   * Calls `POST /bedrock/knowledgebases/{knowledgeBaseId}/retrieve` — the
   * proxy forwards to AWS Bedrock Agent Runtime's `Retrieve` action which
   * performs semantic search over the indexed data sources.
   *
   * @param knowledgeBaseId - The Bedrock Knowledge Base identifier.
   * @param params - Retrieval query and optional retrieval configuration.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The matching retrieval results with content, location, and scores.
   *
   * @see https://docs.litellm.ai/docs/bedrock_invoke
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_Retrieve.html
   */
  retrieve(
    knowledgeBaseId: string,
    params: BedrockKBRetrieveParams,
    options?: RequestOptions,
  ): Promise<BedrockKBRetrieveResponse> {
    return this.request<BedrockKBRetrieveResponse>({
      method: 'POST',
      path: `${this.prefix}/knowledgebases/${encodeURIComponent(knowledgeBaseId)}/retrieve`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve from a Knowledge Base and generate a grounded response.
   *
   * Calls `POST /bedrock/knowledgebases/retrieveAndGenerate` — the proxy
   * forwards to AWS Bedrock Agent Runtime's `RetrieveAndGenerate` which
   * combines retrieval with foundation-model generation in one call.
   *
   * @param params - Input query plus the knowledge base + model configuration.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The generated answer plus the retrieval citations used.
   *
   * @see https://docs.litellm.ai/docs/bedrock_invoke
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_RetrieveAndGenerate.html
   */
  retrieveAndGenerate(
    params: BedrockKBRetrieveAndGenerateParams,
    options?: RequestOptions,
  ): Promise<BedrockKBRetrieveAndGenerateResponse> {
    return this.request<BedrockKBRetrieveAndGenerateResponse>({
      method: 'POST',
      path: `${this.prefix}/knowledgebases/retrieveAndGenerate`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class BedrockAgentsResource {
  constructor(
    private streamRequest: StreamRequestFn,
    private prefix: string,
  ) {}

  /**
   * Invoke a Bedrock Agent and stream its response events.
   *
   * Calls `POST /bedrock/agent/{agentId}/agentAlias/{agentAliasId}/session/{sessionId}/text`
   * — Bedrock's `InvokeAgent` always returns an event-stream, so this method
   * yields a `Stream` of `BedrockAgentInvokeStreamEvent` chunks (chunks,
   * traces, returnControl, etc.).
   *
   * @param agentId - The Bedrock agent identifier.
   * @param agentAliasId - The agent alias to invoke (e.g. `TSTALIASID`).
   * @param sessionId - The conversation session identifier (caller-provided).
   * @param params - Input text and optional session/agent configuration.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An async-iterable `Stream` of agent invocation events.
   *
   * @see https://docs.litellm.ai/docs/bedrock_invoke
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_InvokeAgent.html
   */
  invoke(
    agentId: string,
    agentAliasId: string,
    sessionId: string,
    params: BedrockAgentInvokeParams,
    options?: RequestOptions,
  ): Promise<Stream<BedrockAgentInvokeStreamEvent>> {
    return this.streamRequest<BedrockAgentInvokeStreamEvent>({
      method: 'POST',
      path: `${this.prefix}/agent/${encodeURIComponent(agentId)}/agentAlias/${encodeURIComponent(
        agentAliasId,
      )}/session/${encodeURIComponent(sessionId)}/text`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/**
 * Typed AWS Bedrock pass-through resource. Adds first-class methods for the
 * stable, well-documented surfaces (Converse / Invoke / Guardrails / KB /
 * Agents) while still exposing the generic `get/post/put/patch/delete` escape
 * hatches inherited from `PassThroughProvider`.
 */
export class BedrockPassThroughResource extends PassThroughProvider {
  readonly guardrails: BedrockGuardrailsResource;
  readonly knowledgeBases: BedrockKnowledgeBasesResource;
  readonly agents: BedrockAgentsResource;

  constructor(
    request: RequestFn,
    private streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.bedrock,
  ) {
    super(request, prefix);
    this.guardrails = new BedrockGuardrailsResource(request, this.prefix);
    this.knowledgeBases = new BedrockKnowledgeBasesResource(request, this.prefix);
    this.agents = new BedrockAgentsResource(streamRequest, this.prefix);
  }

  /**
   * Send a unified Converse request to a Bedrock foundation model.
   *
   * Calls `POST /bedrock/model/{modelId}/converse` — Bedrock's provider-agnostic
   * chat surface that normalizes message structure across model families
   * (Anthropic, Mistral, Cohere, etc.).
   *
   * @param modelId - The Bedrock model identifier or inference-profile ARN.
   * @param params - Converse messages, system prompt, tool config, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Converse response with output message, stop reason, and token usage.
   *
   * @see https://docs.litellm.ai/docs/bedrock_converse
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html
   */
  converse(
    modelId: string,
    params: ConverseRequest,
    options?: RequestOptions,
  ): Promise<ConverseResponse> {
    return this.request<ConverseResponse>({
      method: 'POST',
      path: `${this.prefix}/model/${encodeURIComponent(modelId)}/converse`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Stream a unified Converse request to a Bedrock foundation model.
   *
   * Calls `POST /bedrock/model/{modelId}/converse-stream` — same input shape as
   * {@link converse} but returns an event-stream of incremental message
   * deltas, content-block events, and metadata.
   *
   * @param modelId - The Bedrock model identifier or inference-profile ARN.
   * @param params - Converse messages, system prompt, tool config, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An async-iterable `Stream` of `ConverseStreamEvent` chunks.
   *
   * @see https://docs.litellm.ai/docs/bedrock_converse
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ConverseStream.html
   */
  converseStream(
    modelId: string,
    params: ConverseRequest,
    options?: RequestOptions,
  ): Promise<Stream<ConverseStreamEvent>> {
    return this.streamRequest<ConverseStreamEvent>({
      method: 'POST',
      path: `${this.prefix}/model/${encodeURIComponent(modelId)}/converse-stream`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Invoke a Bedrock foundation model with a model-family-specific payload.
   *
   * Calls `POST /bedrock/model/{modelId}/invoke`. The request/response shapes
   * for `InvokeModel` are model-family specific (Anthropic, Titan, Cohere,
   * etc.), so the body and response are typed as `unknown`. Pass `contentType`
   * to override the default `application/json`.
   *
   * @param modelId - The Bedrock model identifier or inference-profile ARN.
   * @param body - The model-family-specific request payload.
   * @param contentType - Optional MIME type override for the request body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The model-family-specific response, typed as the caller's `TResponse`.
   *
   * @see https://docs.litellm.ai/docs/bedrock_invoke
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html
   */
  invoke<TResponse = unknown>(
    modelId: string,
    body: unknown,
    contentType?: string,
    options?: RequestOptions,
  ): Promise<TResponse> {
    const headers = contentType
      ? { 'content-type': contentType, ...(options?.headers ?? {}) }
      : options?.headers;
    return this.request<TResponse>({
      method: 'POST',
      path: `${this.prefix}/model/${encodeURIComponent(modelId)}/invoke`,
      body: { kind: 'json', value: body },
      options: headers ? { ...(options ?? {}), headers } : options,
    });
  }

  /**
   * Invoke a Bedrock foundation model and stream a model-family-specific event-stream.
   *
   * Calls `POST /bedrock/model/{modelId}/invoke-with-response-stream`. The
   * event shapes are model-family specific, so `TEvent` is left to the caller.
   *
   * @param modelId - The Bedrock model identifier or inference-profile ARN.
   * @param body - The model-family-specific request payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An async-iterable `Stream` of model-family-specific events.
   *
   * @see https://docs.litellm.ai/docs/bedrock_invoke
   * @see https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModelWithResponseStream.html
   */
  invokeWithResponseStream<TEvent = unknown>(
    modelId: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<Stream<TEvent>> {
    return this.streamRequest<TEvent>({
      method: 'POST',
      path: `${this.prefix}/model/${encodeURIComponent(modelId)}/invoke-with-response-stream`,
      body: { kind: 'json', value: body },
      options,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cursor Cloud Agents typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export class CursorAgentsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List Cursor background agents with optional pagination.
   *
   * Calls `GET /cursor/agents`.
   *
   * @param params - Optional `cursor` and `limit` for pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of Cursor agents and a `nextCursor` for further pagination.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  list(
    params: CursorAgentsListParams = {},
    options?: RequestOptions,
  ): Promise<CursorAgentsListResponse> {
    const query: Record<string, string | number | boolean | undefined | null> = {
      ...(options?.query ?? {}),
    };
    if (params.cursor !== undefined) query.cursor = params.cursor;
    if (params.limit !== undefined) query.limit = params.limit;
    return this.request<CursorAgentsListResponse>({
      method: 'GET',
      path: `${this.prefix}/agents`,
      options: { ...(options ?? {}), query },
    });
  }

  /**
   * Launch a new Cursor background agent.
   *
   * Calls `POST /cursor/agents`.
   *
   * @param params - Prompt, source repository/branch, model, and optional webhook configuration.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created Cursor agent record.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  launch(params: CursorAgentLaunchParams, options?: RequestOptions): Promise<CursorAgent> {
    return this.request<CursorAgent>({
      method: 'POST',
      path: `${this.prefix}/agents`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve the current state of a Cursor background agent.
   *
   * Calls `GET /cursor/agents/{id}`.
   *
   * @param agentId - The Cursor agent identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent record with status, summary, and target details.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  get(agentId: string, options?: RequestOptions): Promise<CursorAgentRetrieveResponse> {
    return this.request<CursorAgentRetrieveResponse>({
      method: 'GET',
      path: `${this.prefix}/agents/${encodeURIComponent(agentId)}`,
      options,
    });
  }

  /**
   * Delete a Cursor background agent.
   *
   * Calls `DELETE /cursor/agents/{id}`.
   *
   * @param agentId - The Cursor agent identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The deletion acknowledgement payload.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  delete(agentId: string, options?: RequestOptions): Promise<CursorAgentDeleteResponse> {
    return this.request<CursorAgentDeleteResponse>({
      method: 'DELETE',
      path: `${this.prefix}/agents/${encodeURIComponent(agentId)}`,
      options,
    });
  }

  /**
   * Fetch the full conversation transcript for a Cursor agent.
   *
   * Calls `GET /cursor/agents/{id}/conversation`.
   *
   * @param agentId - The Cursor agent identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent's message history (user prompts, agent replies, tool turns).
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  conversation(
    agentId: string,
    options?: RequestOptions,
  ): Promise<CursorAgentConversationResponse> {
    return this.request<CursorAgentConversationResponse>({
      method: 'GET',
      path: `${this.prefix}/agents/${encodeURIComponent(agentId)}/conversation`,
      options,
    });
  }

  /**
   * Send a follow-up prompt to a running Cursor agent.
   *
   * Calls `POST /cursor/agents/{id}/followup`.
   *
   * @param agentId - The Cursor agent identifier.
   * @param params - The follow-up prompt body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The follow-up acknowledgement.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  followup(
    agentId: string,
    params: CursorAgentFollowupParams,
    options?: RequestOptions,
  ): Promise<CursorAgentFollowupResponse> {
    return this.request<CursorAgentFollowupResponse>({
      method: 'POST',
      path: `${this.prefix}/agents/${encodeURIComponent(agentId)}/followup`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Stop a running Cursor background agent.
   *
   * Calls `POST /cursor/agents/{id}/stop` with no body.
   *
   * @param agentId - The Cursor agent identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The stop acknowledgement payload.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  stop(agentId: string, options?: RequestOptions): Promise<CursorAgentStopResponse> {
    return this.request<CursorAgentStopResponse>({
      method: 'POST',
      path: `${this.prefix}/agents/${encodeURIComponent(agentId)}/stop`,
      body: { kind: 'none' },
      options,
    });
  }
}

/**
 * Typed Cursor Cloud Agents pass-through resource. Adds first-class methods for
 * the 10 stable Cursor API endpoints while still exposing
 * `get/post/put/patch/delete` for forward-compatibility.
 */
export class CursorPassThroughResource extends PassThroughProvider {
  readonly agents: CursorAgentsResource;

  constructor(request: RequestFn, prefix: string = PASS_THROUGH_PREFIXES.cursor) {
    super(request, prefix);
    this.agents = new CursorAgentsResource(request, this.prefix);
  }

  /**
   * Fetch the authenticated Cursor account profile.
   *
   * Calls `GET /cursor/me`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The authenticated user's profile.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  me(options?: RequestOptions): Promise<CursorMeResponse> {
    return this.request<CursorMeResponse>({
      method: 'GET',
      path: `${this.prefix}/me`,
      options,
    });
  }

  /**
   * List the models available to the authenticated Cursor account.
   *
   * Calls `GET /cursor/models`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The catalog of model identifiers usable for `agents.launch`.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  models(options?: RequestOptions): Promise<CursorModelsResponse> {
    return this.request<CursorModelsResponse>({
      method: 'GET',
      path: `${this.prefix}/models`,
      options,
    });
  }

  /**
   * List repositories the authenticated Cursor account can target with agents.
   *
   * Calls `GET /cursor/repositories`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The catalog of available source repositories.
   *
   * @see https://docs.cursor.com/en/background-agent/api/overview
   */
  repositories(options?: RequestOptions): Promise<CursorRepositoriesResponse> {
    return this.request<CursorRepositoriesResponse>({
      method: 'GET',
      path: `${this.prefix}/repositories`,
      options,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vertex AI typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export class VertexBatchPredictionJobsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create a Vertex AI batchPredictionJob.
   *
   * Calls `POST {prefix}/{path}` where `path` is the Vertex AI resource path
   * under the proxy prefix, e.g.
   * `v1/projects/{project}/locations/{location}/batchPredictionJobs`.
   *
   * @param path - The Vertex resource path beneath the proxy prefix.
   * @param params - The batch prediction job request body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `BatchPredictionJob` resource.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.batchPredictionJobs/create
   */
  create(
    path: string,
    params: VertexBatchPredictionJobCreateParams,
    options?: RequestOptions,
  ): Promise<VertexBatchPredictionJob> {
    return this.request<VertexBatchPredictionJob>({
      method: 'POST',
      path: `${this.prefix}/${path.replace(/^\/+/, '')}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Fetch a Vertex AI batchPredictionJob by its full resource name.
   *
   * Calls `GET {prefix}/{path}` where `path` is the full job resource name
   * (e.g. `v1/projects/{project}/locations/{location}/batchPredictionJobs/{id}`).
   *
   * @param path - The Vertex job resource path beneath the proxy prefix.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `BatchPredictionJob` resource.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.batchPredictionJobs/get
   */
  get(path: string, options?: RequestOptions): Promise<VertexBatchPredictionJob> {
    return this.request<VertexBatchPredictionJob>({
      method: 'GET',
      path: `${this.prefix}/${path.replace(/^\/+/, '')}`,
      options,
    });
  }

  /**
   * List Vertex AI batchPredictionJobs under a parent path.
   *
   * Calls `GET {prefix}/{path}` where `path` is the parent collection path
   * (e.g. `v1/projects/{project}/locations/{location}/batchPredictionJobs`).
   *
   * @param path - The Vertex parent collection path beneath the proxy prefix.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of `BatchPredictionJob` resources.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.batchPredictionJobs/list
   */
  list(path: string, options?: RequestOptions): Promise<VertexBatchPredictionJobListResponse> {
    return this.request<VertexBatchPredictionJobListResponse>({
      method: 'GET',
      path: `${this.prefix}/${path.replace(/^\/+/, '')}`,
      options,
    });
  }

  /**
   * Cancel a running Vertex AI batchPredictionJob.
   *
   * Calls `POST {prefix}/{path}:cancel` where `path` is the full job resource
   * name. Cancellation is best-effort and asynchronous on the Vertex side.
   *
   * @param path - The Vertex job resource path beneath the proxy prefix.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The cancellation acknowledgement (typically an empty object).
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.batchPredictionJobs/cancel
   */
  cancel(path: string, options?: RequestOptions): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'POST',
      path: `${this.prefix}/${path.replace(/^\/+/, '')}:cancel`,
      body: { kind: 'none' },
      options,
    });
  }
}

/**
 * Typed Google Vertex AI pass-through resource.
 *
 * The Vertex REST API uses fully-qualified resource paths
 * (`v1/projects/{project}/locations/{location}/...`). The proxy mounts Vertex
 * at the `/vertex_ai` prefix and forwards the rest of the path verbatim, so
 * the typed methods below take a `path` argument that the caller composes,
 * along with the typed body/response.
 *
 * For convenience the most common Gemini-on-Vertex endpoints (generateContent,
 * streamGenerateContent, embedContent, predict) are exposed as helpers that
 * accept the model resource path (e.g.
 * `v1/projects/p/locations/us-central1/publishers/google/models/gemini-1.5-pro`)
 * and append the operation suffix.
 */
export class VertexPassThroughResource extends PassThroughProvider {
  readonly batchPredictionJobs: VertexBatchPredictionJobsResource;

  constructor(
    request: RequestFn,
    private streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.vertex,
  ) {
    super(request, prefix);
    this.batchPredictionJobs = new VertexBatchPredictionJobsResource(request, this.prefix);
  }

  /**
   * Generate content with a Gemini model on Vertex AI.
   *
   * Calls `POST {prefix}/{modelPath}:generateContent` where `modelPath` is the
   * publisher model resource path under the proxy prefix, e.g.
   * `v1/projects/{project}/locations/{location}/publishers/google/models/gemini-1.5-pro`.
   *
   * @param modelPath - The Vertex publisher-model resource path.
   * @param params - Generation contents, system instruction, tools, and config.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Vertex `GenerateContentResponse` with candidates and usage metadata.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/generateContent
   */
  generateContent(
    modelPath: string,
    params: VertexGenerateContentParams,
    options?: RequestOptions,
  ): Promise<VertexGenerateContentResponse> {
    return this.request<VertexGenerateContentResponse>({
      method: 'POST',
      path: `${this.prefix}/${modelPath.replace(/^\/+/, '')}:generateContent`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Stream content generation with a Gemini model on Vertex AI.
   *
   * Calls `POST {prefix}/{modelPath}:streamGenerateContent` and returns an
   * SSE stream of `VertexGenerateContentResponse` chunks.
   *
   * @param modelPath - The Vertex publisher-model resource path.
   * @param params - Generation contents, system instruction, tools, and config.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An async-iterable `Stream` of incremental generate-content chunks.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/streamGenerateContent
   */
  streamGenerateContent(
    modelPath: string,
    params: VertexGenerateContentParams,
    options?: RequestOptions,
  ): Promise<Stream<VertexGenerateContentResponse>> {
    return this.streamRequest<VertexGenerateContentResponse>({
      method: 'POST',
      path: `${this.prefix}/${modelPath.replace(/^\/+/, '')}:streamGenerateContent`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Compute an embedding from a Gemini embedding model on Vertex AI.
   *
   * Calls `POST {prefix}/{modelPath}:embedContent`.
   *
   * @param modelPath - The Vertex publisher-model resource path for an embedding model.
   * @param params - The content to embed and optional task type / output dimensionality.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The embedding vector and statistics.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/embedContent
   */
  embedContent(
    modelPath: string,
    params: VertexEmbedContentParams,
    options?: RequestOptions,
  ): Promise<VertexEmbedContentResponse> {
    return this.request<VertexEmbedContentResponse>({
      method: 'POST',
      path: `${this.prefix}/${modelPath.replace(/^\/+/, '')}:embedContent`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Run online prediction against a Vertex AI endpoint or publisher model.
   *
   * Calls `POST {prefix}/{endpointPath}:predict` where `endpointPath` is the
   * endpoint or publisher-model resource path used for online prediction, e.g.
   * `v1/projects/{project}/locations/{location}/endpoints/{endpoint}` or
   * `v1/projects/{project}/locations/{location}/publishers/google/models/{model}`.
   *
   * @param endpointPath - The Vertex endpoint or publisher-model resource path.
   * @param params - The list of prediction instances and optional parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Vertex prediction response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vertex_ai
   * @see https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.endpoints/predict
   */
  predict(
    endpointPath: string,
    params: VertexPredictParams,
    options?: RequestOptions,
  ): Promise<VertexPredictResponse> {
    return this.request<VertexPredictResponse>({
      method: 'POST',
      path: `${this.prefix}/${endpointPath.replace(/^\/+/, '')}:predict`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cohere typed pass-through resource
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Typed Cohere pass-through resource. Adds first-class methods for the stable
 * Cohere REST endpoints (chat / embed / rerank / classify / generate /
 * tokenize / detokenize) while still exposing the generic
 * `get/post/put/patch/delete` escape hatches inherited from
 * `PassThroughProvider`.
 */
export class CoherePassThroughResource extends PassThroughProvider {
  // streamRequest is intentionally unused right now — kept on the class so the
  // public constructor signature is symmetric with the other typed providers
  // and so streaming variants can be added without a breaking change.
  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.cohere,
  ) {
    super(request, prefix);
  }

  /**
   * Send a Cohere v1 Chat request.
   *
   * Calls `POST /cohere/v1/chat`.
   *
   * @param params - Chat message, conversation history, model, and tool config.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Cohere chat response with text, citations, and metadata.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/chat
   */
  chat(params: CohereChatParams, options?: RequestOptions): Promise<CohereChatResponse> {
    return this.request<CohereChatResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/chat`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Send a Cohere v2 Chat request.
   *
   * Calls `POST /cohere/v2/chat` — the v2 API uses a unified `messages` array
   * (similar to OpenAI chat completions) instead of v1's `message` + `chat_history`.
   *
   * @param params - Chat messages, model, and tool config.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Cohere v2 chat response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/chat
   */
  chatV2(params: CohereChatV2Params, options?: RequestOptions): Promise<CohereChatV2Response> {
    return this.request<CohereChatV2Response>({
      method: 'POST',
      path: `${this.prefix}/v2/chat`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Compute embeddings with a Cohere embed model.
   *
   * Calls `POST /cohere/v1/embed`.
   *
   * @param params - Texts/images, model, input type, and embedding types.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The embedding vectors and metadata.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/embed
   */
  embed(params: CohereEmbedParams, options?: RequestOptions): Promise<CohereEmbedResponse> {
    return this.request<CohereEmbedResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/embed`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Rerank a list of documents against a query with a Cohere rerank model.
   *
   * Calls `POST /cohere/v1/rerank`.
   *
   * @param params - Query, candidate documents, model, and `top_n` cutoff.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The relevance-ranked results.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/rerank
   */
  rerank(params: CohereRerankParams, options?: RequestOptions): Promise<CohereRerankResponse> {
    return this.request<CohereRerankResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/rerank`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Classify inputs into labels with a Cohere classify model.
   *
   * Calls `POST /cohere/v1/classify`.
   *
   * @param params - Inputs to classify and the labelled examples / preset.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The classification predictions.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/classify
   */
  classify(
    params: CohereClassifyParams,
    options?: RequestOptions,
  ): Promise<CohereClassifyResponse> {
    return this.request<CohereClassifyResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/classify`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Generate text with a Cohere generation model (legacy completion-style API).
   *
   * Calls `POST /cohere/v1/generate`.
   *
   * @param params - Prompt, model, and generation parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Cohere generation response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/generate
   */
  generate(
    params: CohereGenerateParams,
    options?: RequestOptions,
  ): Promise<CohereGenerateResponse> {
    return this.request<CohereGenerateResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/generate`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Tokenize text using a Cohere model's tokenizer.
   *
   * Calls `POST /cohere/v1/tokenize`.
   *
   * @param params - Text input and the model whose tokenizer to use.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The token IDs and string token pieces.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/tokenize
   */
  tokenize(
    params: CohereTokenizeParams,
    options?: RequestOptions,
  ): Promise<CohereTokenizeResponse> {
    return this.request<CohereTokenizeResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/tokenize`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Detokenize a list of token IDs back into text using a Cohere model's tokenizer.
   *
   * Calls `POST /cohere/v1/detokenize`.
   *
   * @param params - Token IDs and the model whose tokenizer to use.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The reconstructed text.
   *
   * @see https://docs.litellm.ai/docs/pass_through/cohere
   * @see https://docs.cohere.com/reference/detokenize
   */
  detokenize(
    params: CohereDetokenizeParams,
    options?: RequestOptions,
  ): Promise<CohereDetokenizeResponse> {
    return this.request<CohereDetokenizeResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/detokenize`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mistral typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

class MistralChatCompletionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create a chat completion against the Mistral chat-completions API.
   *
   * Calls `POST /mistral/v1/chat/completions`.
   *
   * @param params - Messages, model, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Mistral chat completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/mistral
   * @see https://docs.mistral.ai/api/#tag/chat
   */
  create(
    params: MistralChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<MistralChatCompletion> {
    return this.request<MistralChatCompletion>({
      method: 'POST',
      path: `${this.prefix}/v1/chat/completions`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class MistralChatResource {
  readonly completions: MistralChatCompletionsResource;
  constructor(request: RequestFn, prefix: string) {
    this.completions = new MistralChatCompletionsResource(request, prefix);
  }
}

export class MistralEmbeddingsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Compute embeddings with a Mistral embedding model.
   *
   * Calls `POST /mistral/v1/embeddings`.
   *
   * @param params - Input texts and the embedding model identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Mistral embeddings response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/mistral
   * @see https://docs.mistral.ai/api/#tag/embeddings
   */
  create(
    params: MistralEmbeddingCreateParams,
    options?: RequestOptions,
  ): Promise<MistralEmbeddingResponse> {
    return this.request<MistralEmbeddingResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/embeddings`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

class MistralFimCompletionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create a fill-in-the-middle (FIM) completion with a Mistral code model.
   *
   * Calls `POST /mistral/v1/fim/completions`.
   *
   * @param params - Prompt prefix/suffix, model, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Mistral FIM completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/mistral
   * @see https://docs.mistral.ai/api/#tag/fim
   */
  create(
    params: MistralFIMCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<MistralFIMCompletion> {
    return this.request<MistralFIMCompletion>({
      method: 'POST',
      path: `${this.prefix}/v1/fim/completions`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class MistralFimResource {
  readonly completions: MistralFimCompletionsResource;
  constructor(request: RequestFn, prefix: string) {
    this.completions = new MistralFimCompletionsResource(request, prefix);
  }
}

class MistralAgentsCompletionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create an agents completion against a Mistral agent.
   *
   * Calls `POST /mistral/v1/agents/completions`.
   *
   * @param params - Agent identifier, messages, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Mistral agents completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/mistral
   * @see https://docs.mistral.ai/api/#tag/agents
   */
  create(
    params: MistralAgentsCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<MistralAgentsCompletion> {
    return this.request<MistralAgentsCompletion>({
      method: 'POST',
      path: `${this.prefix}/v1/agents/completions`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class MistralAgentsResource {
  readonly completions: MistralAgentsCompletionsResource;
  constructor(request: RequestFn, prefix: string) {
    this.completions = new MistralAgentsCompletionsResource(request, prefix);
  }
}

export class MistralModelsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List the models available to the authenticated Mistral account.
   *
   * Calls `GET /mistral/v1/models`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Mistral models catalog.
   *
   * @see https://docs.litellm.ai/docs/pass_through/mistral
   * @see https://docs.mistral.ai/api/#tag/models
   */
  list(options?: RequestOptions): Promise<MistralModelsListResponse> {
    return this.request<MistralModelsListResponse>({
      method: 'GET',
      path: `${this.prefix}/v1/models`,
      options,
    });
  }
}

/**
 * Typed Mistral pass-through resource. Adds first-class methods for the stable
 * Mistral REST endpoints (chat / embeddings / FIM / agents / models) while
 * still exposing the generic `get/post/put/patch/delete` escape hatches.
 */
export class MistralPassThroughResource extends PassThroughProvider {
  readonly chat: MistralChatResource;
  readonly embeddings: MistralEmbeddingsResource;
  readonly fim: MistralFimResource;
  readonly agents: MistralAgentsResource;
  readonly models: MistralModelsResource;

  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.mistral,
  ) {
    super(request, prefix);
    this.chat = new MistralChatResource(request, this.prefix);
    this.embeddings = new MistralEmbeddingsResource(request, this.prefix);
    this.fim = new MistralFimResource(request, this.prefix);
    this.agents = new MistralAgentsResource(request, this.prefix);
    this.models = new MistralModelsResource(request, this.prefix);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// vLLM typed sub-resources (OpenAI-compatible)
// ─────────────────────────────────────────────────────────────────────────────

class VllmChatCompletionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create a chat completion against a vLLM-hosted model (OpenAI-compatible).
   *
   * Calls `POST /vllm/v1/chat/completions`.
   *
   * @param params - OpenAI-style messages, model, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The chat completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vllm
   * @see https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
   */
  create(
    params: VLLMChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<VLLMChatCompletion> {
    return this.request<VLLMChatCompletion>({
      method: 'POST',
      path: `${this.prefix}/v1/chat/completions`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class VllmChatResource {
  readonly completions: VllmChatCompletionsResource;
  constructor(request: RequestFn, prefix: string) {
    this.completions = new VllmChatCompletionsResource(request, prefix);
  }
}

export class VllmCompletionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create a (legacy) completion against a vLLM-hosted model (OpenAI-compatible).
   *
   * Calls `POST /vllm/v1/completions`.
   *
   * @param params - OpenAI-style prompt, model, and inference parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vllm
   * @see https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
   */
  create(
    params: VLLMCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<VLLMCompletion> {
    return this.request<VLLMCompletion>({
      method: 'POST',
      path: `${this.prefix}/v1/completions`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class VllmEmbeddingsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Compute embeddings against a vLLM-hosted embedding model (OpenAI-compatible).
   *
   * Calls `POST /vllm/v1/embeddings`.
   *
   * @param params - OpenAI-style input texts and model identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The embeddings response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vllm
   * @see https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
   */
  create(
    params: VLLMEmbeddingCreateParams,
    options?: RequestOptions,
  ): Promise<VLLMEmbeddingResponse> {
    return this.request<VLLMEmbeddingResponse>({
      method: 'POST',
      path: `${this.prefix}/v1/embeddings`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class VllmModelsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List models served by the vLLM backend.
   *
   * Calls `GET /vllm/v1/models`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OpenAI-style models catalog as exposed by vLLM.
   *
   * @see https://docs.litellm.ai/docs/pass_through/vllm
   * @see https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
   */
  list(options?: RequestOptions): Promise<VLLMModelsListResponse> {
    return this.request<VLLMModelsListResponse>({
      method: 'GET',
      path: `${this.prefix}/v1/models`,
      options,
    });
  }
}

/**
 * Typed vLLM pass-through resource. vLLM exposes an OpenAI-compatible HTTP
 * surface, so the typed methods accept the same OpenAI-style params
 * (re-exported as `VLLM*`) and return the same response shapes.
 */
export class VllmPassThroughResource extends PassThroughProvider {
  readonly chat: VllmChatResource;
  readonly completions: VllmCompletionsResource;
  readonly embeddings: VllmEmbeddingsResource;
  readonly models: VllmModelsResource;

  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.vllm,
  ) {
    super(request, prefix);
    this.chat = new VllmChatResource(request, this.prefix);
    this.completions = new VllmCompletionsResource(request, this.prefix);
    this.embeddings = new VllmEmbeddingsResource(request, this.prefix);
    this.models = new VllmModelsResource(request, this.prefix);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Milvus typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export class MilvusCollectionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List collections in the configured Milvus database.
   *
   * Calls `POST /milvus/v2/vectordb/collections/list`.
   *
   * @param params - Optional database name filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of collection names.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  list(
    params: MilvusCollectionsListParams = {},
    options?: RequestOptions,
  ): Promise<MilvusCollectionsListResponse> {
    return this.request<MilvusCollectionsListResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/collections/list`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Create a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/collections/create`.
   *
   * @param params - Collection name, schema, dimension, and index params.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  create(
    params: MilvusCollectionCreateParams,
    options?: RequestOptions,
  ): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/collections/create`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Drop a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/collections/drop`. This is destructive —
   * the collection and its data are removed.
   *
   * @param params - The target collection name (and optional database name).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  drop(
    params: MilvusCollectionDropParams,
    options?: RequestOptions,
  ): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/collections/drop`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Describe a Milvus collection's schema and metadata.
   *
   * Calls `POST /milvus/v2/vectordb/collections/describe`.
   *
   * @param params - The target collection name (and optional database name).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The collection schema, fields, and load state.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  describe(
    params: MilvusCollectionDescribeParams,
    options?: RequestOptions,
  ): Promise<MilvusCollectionDescribeResponse> {
    return this.request<MilvusCollectionDescribeResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/collections/describe`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class MilvusEntitiesResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Vector-similarity search over a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/entities/search`.
   *
   * @param params - Collection name, query vectors, output fields, and search params.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The matching entities with similarity scores.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  search(params: MilvusSearchParams, options?: RequestOptions): Promise<MilvusSearchResponse> {
    return this.request<MilvusSearchResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/entities/search`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Insert entities into a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/entities/insert`.
   *
   * @param params - Collection name and the rows to insert.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Insert counts and primary keys.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  insert(params: MilvusInsertParams, options?: RequestOptions): Promise<MilvusInsertResponse> {
    return this.request<MilvusInsertResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/entities/insert`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Upsert entities into a Milvus collection (insert-or-replace by primary key).
   *
   * Calls `POST /milvus/v2/vectordb/entities/upsert`.
   *
   * @param params - Collection name and rows keyed by primary field.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Upsert counts and primary keys.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  upsert(params: MilvusUpsertParams, options?: RequestOptions): Promise<MilvusUpsertResponse> {
    return this.request<MilvusUpsertResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/entities/upsert`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete entities from a Milvus collection by filter or primary key.
   *
   * Calls `POST /milvus/v2/vectordb/entities/delete`.
   *
   * @param params - Collection name and the filter / primary keys to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The delete counts.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  delete(params: MilvusDeleteParams, options?: RequestOptions): Promise<MilvusDeleteResponse> {
    return this.request<MilvusDeleteResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/entities/delete`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Run a scalar (boolean-expression) query over a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/entities/query`.
   *
   * @param params - Collection name, filter expression, and output fields.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The matching entities.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  query(params: MilvusQueryParams, options?: RequestOptions): Promise<MilvusQueryResponse> {
    return this.request<MilvusQueryResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/entities/query`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class MilvusPartitionsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List partitions of a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/partitions/list`.
   *
   * @param params - The target collection (and optional database name).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of partition names.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  list(
    params: MilvusPartitionListParams,
    options?: RequestOptions,
  ): Promise<MilvusPartitionListResponse> {
    return this.request<MilvusPartitionListResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/partitions/list`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Create a partition under a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/partitions/create`.
   *
   * @param params - Collection name and partition name to create.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  create(params: MilvusPartitionParams, options?: RequestOptions): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/partitions/create`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Drop a partition from a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/partitions/drop`. Destructive — the
   * partition's data is removed.
   *
   * @param params - Collection name and partition name to drop.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  drop(params: MilvusPartitionParams, options?: RequestOptions): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/partitions/drop`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Check whether a partition exists in a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/partitions/has`.
   *
   * @param params - Collection name and partition name to check.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns `{ has: boolean }` indicating whether the partition exists.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  has(
    params: MilvusPartitionParams,
    options?: RequestOptions,
  ): Promise<MilvusPartitionHasResponse> {
    return this.request<MilvusPartitionHasResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/partitions/has`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Load partitions of a Milvus collection into memory for search/query.
   *
   * Calls `POST /milvus/v2/vectordb/partitions/load`.
   *
   * @param params - Collection name and partitions to load.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  load(
    params: MilvusPartitionMultiParams,
    options?: RequestOptions,
  ): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/partitions/load`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Release loaded partitions of a Milvus collection from memory.
   *
   * Calls `POST /milvus/v2/vectordb/partitions/release`.
   *
   * @param params - Collection name and partitions to release.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  release(
    params: MilvusPartitionMultiParams,
    options?: RequestOptions,
  ): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/partitions/release`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class MilvusIndexesResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create an index on a Milvus collection field.
   *
   * Calls `POST /milvus/v2/vectordb/indexes/create`.
   *
   * @param params - Collection name, field name, and index parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  create(params: MilvusIndexCreateParams, options?: RequestOptions): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/indexes/create`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Drop an index from a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/indexes/drop`.
   *
   * @param params - Collection name and the index name to drop.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An empty acknowledgement on success.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  drop(params: MilvusIndexDropParams, options?: RequestOptions): Promise<MilvusEmptyResponse> {
    return this.request<MilvusEmptyResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/indexes/drop`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Describe an index on a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/indexes/describe`.
   *
   * @param params - Collection name and index name to describe.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The index parameters and build state.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  describe(
    params: MilvusIndexDescribeParams,
    options?: RequestOptions,
  ): Promise<MilvusIndexDescribeResponse> {
    return this.request<MilvusIndexDescribeResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/indexes/describe`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List indexes on a Milvus collection.
   *
   * Calls `POST /milvus/v2/vectordb/indexes/list`.
   *
   * @param params - The target collection (and optional database name).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of indexes defined on the collection.
   *
   * @see https://docs.litellm.ai/docs/pass_through/milvus
   * @see https://milvus.io/docs/restful_v2.md
   */
  list(
    params: MilvusIndexListParams,
    options?: RequestOptions,
  ): Promise<MilvusIndexListResponse> {
    return this.request<MilvusIndexListResponse>({
      method: 'POST',
      path: `${this.prefix}/v2/vectordb/indexes/list`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/**
 * Typed Milvus pass-through resource. Wraps the v2 RESTful API surfaces
 * (collections / entities / partitions / indexes) while still exposing
 * `get/post/put/patch/delete` for forward-compatibility.
 */
export class MilvusPassThroughResource extends PassThroughProvider {
  readonly collections: MilvusCollectionsResource;
  readonly entities: MilvusEntitiesResource;
  readonly partitions: MilvusPartitionsResource;
  readonly indexes: MilvusIndexesResource;

  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.milvus,
  ) {
    super(request, prefix);
    this.collections = new MilvusCollectionsResource(request, this.prefix);
    this.entities = new MilvusEntitiesResource(request, this.prefix);
    this.partitions = new MilvusPartitionsResource(request, this.prefix);
    this.indexes = new MilvusIndexesResource(request, this.prefix);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Azure OpenAI typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

function azureQuery(
  apiVersion: string | undefined,
  options?: RequestOptions,
): RequestOptions {
  const query: Record<string, string | number | boolean | undefined | null> = {
    ...(options?.query ?? {}),
  };
  query['api-version'] = apiVersion ?? DEFAULT_AZURE_API_VERSION;
  return { ...(options ?? {}), query };
}

export class AzureImagesResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Generate images via an Azure OpenAI image deployment.
   *
   * Calls `POST /azure/openai/deployments/{deployment}/images/generations?api-version=...`.
   *
   * @param deployment - The Azure OpenAI deployment name.
   * @param params - The image generation request body (prompt, size, n, etc.).
   * @param apiVersion - Override the `api-version` query parameter (defaults to `DEFAULT_AZURE_API_VERSION`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The generated image response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/azure
   */
  generations(
    deployment: string,
    params: AzureImageGenerateParams,
    apiVersion?: string,
    options?: RequestOptions,
  ): Promise<AzureImageResponse> {
    return this.request<AzureImageResponse>({
      method: 'POST',
      path: `${this.prefix}/openai/deployments/${encodeURIComponent(deployment)}/images/generations`,
      body: { kind: 'json', value: params },
      options: azureQuery(apiVersion, options),
    });
  }
}

export class AzureAudioResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Transcribe an audio file via an Azure OpenAI Whisper deployment.
   *
   * Calls `POST /azure/openai/deployments/{deployment}/audio/transcriptions?api-version=...`.
   * The request is sent as `multipart/form-data` (mirrors `audio.transcriptions.create`).
   *
   * @param deployment - The Azure OpenAI Whisper deployment name.
   * @param params - The audio file plus transcription parameters.
   * @param apiVersion - Override the `api-version` query parameter (defaults to `DEFAULT_AZURE_API_VERSION`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The transcription as JSON, verbose JSON, or plain text depending on `response_format`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/azure
   */
  transcriptions(
    deployment: string,
    params: AzureTranscriptionCreateParams,
    apiVersion?: string,
    options?: RequestOptions,
  ): Promise<AzureTranscription | AzureTranscriptionVerbose | string> {
    const form = new FormData();
    const file = params.file;
    const blob =
      file instanceof Blob
        ? file
        : new Blob([file as ArrayBuffer], { type: params.contentType ?? 'application/octet-stream' });
    form.append('file', blob, params.filename ?? 'audio');
    form.append('model', params.model);
    if (params.language !== undefined) form.append('language', params.language);
    if (params.prompt !== undefined) form.append('prompt', params.prompt);
    if (params.response_format !== undefined)
      form.append('response_format', params.response_format);
    if (params.temperature !== undefined) form.append('temperature', String(params.temperature));
    const granularities = params['timestamp_granularities[]'];
    if (granularities) {
      for (const g of granularities) form.append('timestamp_granularities[]', g);
    }
    return this.request<AzureTranscription | AzureTranscriptionVerbose | string>({
      method: 'POST',
      path: `${this.prefix}/openai/deployments/${encodeURIComponent(deployment)}/audio/transcriptions`,
      body: { kind: 'form', value: form },
      options: azureQuery(apiVersion, options),
    });
  }
}

/**
 * Typed Azure OpenAI pass-through resource.
 *
 * Azure OpenAI uses deployment-scoped paths
 * (`/openai/deployments/{deployment}/...`) and an `api-version` query
 * parameter. The typed methods take a `deployment` argument plus an optional
 * `apiVersion` (default: `DEFAULT_AZURE_API_VERSION`) and append the standard
 * OpenAI suffix.
 */
export class AzurePassThroughResource extends PassThroughProvider {
  readonly images: AzureImagesResource;
  readonly audio: AzureAudioResource;

  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.azure,
  ) {
    super(request, prefix);
    this.images = new AzureImagesResource(request, this.prefix);
    this.audio = new AzureAudioResource(request, this.prefix);
  }

  /**
   * Create a chat completion via an Azure OpenAI deployment.
   *
   * Calls `POST /azure/openai/deployments/{deployment}/chat/completions?api-version=...`.
   *
   * @param deployment - The Azure OpenAI chat deployment name.
   * @param params - OpenAI-style chat completion request body.
   * @param apiVersion - Override the `api-version` query parameter (defaults to `DEFAULT_AZURE_API_VERSION`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The chat completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/azure
   */
  chatCompletions(
    deployment: string,
    params: AzureChatCompletionCreateParams,
    apiVersion?: string,
    options?: RequestOptions,
  ): Promise<AzureChatCompletion> {
    return this.request<AzureChatCompletion>({
      method: 'POST',
      path: `${this.prefix}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`,
      body: { kind: 'json', value: params },
      options: azureQuery(apiVersion, options),
    });
  }

  /**
   * Create a (legacy) completion via an Azure OpenAI deployment.
   *
   * Calls `POST /azure/openai/deployments/{deployment}/completions?api-version=...`.
   *
   * @param deployment - The Azure OpenAI completion deployment name.
   * @param params - OpenAI-style completion request body.
   * @param apiVersion - Override the `api-version` query parameter (defaults to `DEFAULT_AZURE_API_VERSION`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The completion response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/azure
   */
  completions(
    deployment: string,
    params: AzureCompletionCreateParams,
    apiVersion?: string,
    options?: RequestOptions,
  ): Promise<AzureCompletion> {
    return this.request<AzureCompletion>({
      method: 'POST',
      path: `${this.prefix}/openai/deployments/${encodeURIComponent(deployment)}/completions`,
      body: { kind: 'json', value: params },
      options: azureQuery(apiVersion, options),
    });
  }

  /**
   * Compute embeddings via an Azure OpenAI embedding deployment.
   *
   * Calls `POST /azure/openai/deployments/{deployment}/embeddings?api-version=...`.
   *
   * @param deployment - The Azure OpenAI embedding deployment name.
   * @param params - OpenAI-style embedding request body.
   * @param apiVersion - Override the `api-version` query parameter (defaults to `DEFAULT_AZURE_API_VERSION`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The embedding response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/azure
   */
  embeddings(
    deployment: string,
    params: AzureEmbeddingCreateParams,
    apiVersion?: string,
    options?: RequestOptions,
  ): Promise<AzureEmbeddingResponse> {
    return this.request<AzureEmbeddingResponse>({
      method: 'POST',
      path: `${this.prefix}/openai/deployments/${encodeURIComponent(deployment)}/embeddings`,
      body: { kind: 'json', value: params },
      options: azureQuery(apiVersion, options),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Langfuse typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

function toQuery(
  params: Record<string, unknown> | undefined,
  options?: RequestOptions,
): RequestOptions | undefined {
  if (!params) return options;
  const query: Record<string, string | number | boolean | undefined | null> = {
    ...(options?.query ?? {}),
  };
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      query[k] = v.join(',');
    } else if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      v === null
    ) {
      query[k] = v;
    } else {
      query[k] = String(v);
    }
  }
  return { ...(options ?? {}), query };
}

export class LangfuseTracesResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List Langfuse traces matching optional filters.
   *
   * Calls `GET /langfuse/api/public/traces`.
   *
   * @param params - Optional filter / pagination parameters (page, limit, userId, tags, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of Langfuse traces.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  list(
    params: LangfuseTracesListParams = {},
    options?: RequestOptions,
  ): Promise<LangfuseTracesListResponse> {
    return this.request<LangfuseTracesListResponse>({
      method: 'GET',
      path: `${this.prefix}/api/public/traces`,
      options: toQuery(params, options),
    });
  }

  /**
   * Fetch a Langfuse trace by ID.
   *
   * Calls `GET /langfuse/api/public/traces/{traceId}`.
   *
   * @param traceId - The Langfuse trace identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full trace with observations.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  get(traceId: string, options?: RequestOptions): Promise<LangfuseTrace> {
    return this.request<LangfuseTrace>({
      method: 'GET',
      path: `${this.prefix}/api/public/traces/${encodeURIComponent(traceId)}`,
      options,
    });
  }

  /**
   * Delete a Langfuse trace by ID.
   *
   * Calls `DELETE /langfuse/api/public/traces/{traceId}`.
   *
   * @param traceId - The Langfuse trace identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The deletion acknowledgement payload.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  delete(traceId: string, options?: RequestOptions): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `${this.prefix}/api/public/traces/${encodeURIComponent(traceId)}`,
      options,
    });
  }
}

export class LangfuseObservationsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List Langfuse observations matching optional filters.
   *
   * Calls `GET /langfuse/api/public/observations`.
   *
   * @param params - Optional filter / pagination parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of Langfuse observations.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  list(
    params: LangfuseObservationsListParams = {},
    options?: RequestOptions,
  ): Promise<LangfuseObservationsListResponse> {
    return this.request<LangfuseObservationsListResponse>({
      method: 'GET',
      path: `${this.prefix}/api/public/observations`,
      options: toQuery(params, options),
    });
  }

  /**
   * Fetch a Langfuse observation by ID.
   *
   * Calls `GET /langfuse/api/public/observations/{observationId}`.
   *
   * @param observationId - The Langfuse observation identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Langfuse observation.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  get(observationId: string, options?: RequestOptions): Promise<LangfuseObservation> {
    return this.request<LangfuseObservation>({
      method: 'GET',
      path: `${this.prefix}/api/public/observations/${encodeURIComponent(observationId)}`,
      options,
    });
  }
}

export class LangfuseSpansResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Create a Langfuse span observation.
   *
   * Calls `POST /langfuse/api/public/spans`.
   *
   * @param params - The span body (id, name, traceId, input/output, timestamps).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created span observation.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  create(params: LangfuseSpanCreateParams, options?: RequestOptions): Promise<LangfuseSpan> {
    return this.request<LangfuseSpan>({
      method: 'POST',
      path: `${this.prefix}/api/public/spans`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update a Langfuse span observation in place.
   *
   * Calls `PATCH /langfuse/api/public/spans` — typically used to fill in the
   * `endTime` / `output` fields once a span has finished.
   *
   * @param params - The span fields to update; the span `id` selects the target.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated span observation.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  update(params: LangfuseSpanCreateParams, options?: RequestOptions): Promise<LangfuseSpan> {
    return this.request<LangfuseSpan>({
      method: 'PATCH',
      path: `${this.prefix}/api/public/spans`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class LangfuseScoresResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List Langfuse scores matching optional filters.
   *
   * Calls `GET /langfuse/api/public/scores`.
   *
   * @param params - Optional filter / pagination parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of Langfuse scores.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  list(
    params: LangfuseScoresListParams = {},
    options?: RequestOptions,
  ): Promise<LangfuseScoresListResponse> {
    return this.request<LangfuseScoresListResponse>({
      method: 'GET',
      path: `${this.prefix}/api/public/scores`,
      options: toQuery(params, options),
    });
  }

  /**
   * Create (ingest) a Langfuse score.
   *
   * Calls `POST /langfuse/api/public/scores`.
   *
   * @param params - The score body (name, value, traceId or observationId, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created score record.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  create(params: LangfuseScoreCreateParams, options?: RequestOptions): Promise<LangfuseScore> {
    return this.request<LangfuseScore>({
      method: 'POST',
      path: `${this.prefix}/api/public/scores`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a Langfuse score by ID.
   *
   * Calls `DELETE /langfuse/api/public/scores/{scoreId}`.
   *
   * @param scoreId - The Langfuse score identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The deletion acknowledgement payload.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  delete(scoreId: string, options?: RequestOptions): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `${this.prefix}/api/public/scores/${encodeURIComponent(scoreId)}`,
      options,
    });
  }
}

export class LangfuseDatasetsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List all Langfuse datasets in the project.
   *
   * Calls `GET /langfuse/api/public/datasets`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of datasets.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  list(options?: RequestOptions): Promise<LangfuseDatasetsListResponse> {
    return this.request<LangfuseDatasetsListResponse>({
      method: 'GET',
      path: `${this.prefix}/api/public/datasets`,
      options,
    });
  }

  /**
   * Fetch a Langfuse dataset by name.
   *
   * Calls `GET /langfuse/api/public/datasets/{name}`.
   *
   * @param name - The dataset name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The dataset metadata and items.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  get(name: string, options?: RequestOptions): Promise<LangfuseDataset> {
    return this.request<LangfuseDataset>({
      method: 'GET',
      path: `${this.prefix}/api/public/datasets/${encodeURIComponent(name)}`,
      options,
    });
  }

  /**
   * Create a Langfuse dataset.
   *
   * Calls `POST /langfuse/api/public/datasets`.
   *
   * @param params - The dataset creation body (name, description, metadata).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created dataset.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  create(params: LangfuseDatasetCreateParams, options?: RequestOptions): Promise<LangfuseDataset> {
    return this.request<LangfuseDataset>({
      method: 'POST',
      path: `${this.prefix}/api/public/datasets`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class LangfusePromptsResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * List Langfuse v2 prompts in the project.
   *
   * Calls `GET /langfuse/api/public/v2/prompts`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of prompts.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  list(options?: RequestOptions): Promise<LangfusePromptsListResponse> {
    return this.request<LangfusePromptsListResponse>({
      method: 'GET',
      path: `${this.prefix}/api/public/v2/prompts`,
      options,
    });
  }

  /**
   * Fetch a Langfuse v2 prompt by name.
   *
   * Calls `GET /langfuse/api/public/v2/prompts/{name}`.
   *
   * @param name - The prompt name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The prompt with current production version content.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  get(name: string, options?: RequestOptions): Promise<LangfusePrompt> {
    return this.request<LangfusePrompt>({
      method: 'GET',
      path: `${this.prefix}/api/public/v2/prompts/${encodeURIComponent(name)}`,
      options,
    });
  }

  /**
   * Create (or version) a Langfuse v2 prompt.
   *
   * Calls `POST /langfuse/api/public/v2/prompts`.
   *
   * @param params - The prompt content, type (text or chat), labels, and metadata.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created prompt version.
   *
   * @see https://docs.litellm.ai/docs/pass_through/langfuse
   * @see https://api.reference.langfuse.com/
   */
  create(params: LangfusePromptCreateParams, options?: RequestOptions): Promise<LangfusePrompt> {
    return this.request<LangfusePrompt>({
      method: 'POST',
      path: `${this.prefix}/api/public/v2/prompts`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/**
 * Typed Langfuse pass-through resource. Adds first-class methods for the
 * stable public Langfuse REST endpoints (traces / observations / spans /
 * scores / datasets / prompts) while still exposing the generic
 * `get/post/put/patch/delete` escape hatches.
 */
export class LangfusePassThroughResource extends PassThroughProvider {
  readonly traces: LangfuseTracesResource;
  readonly observations: LangfuseObservationsResource;
  readonly spans: LangfuseSpansResource;
  readonly scores: LangfuseScoresResource;
  readonly datasets: LangfuseDatasetsResource;
  readonly prompts: LangfusePromptsResource;

  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.langfuse,
  ) {
    super(request, prefix);
    this.traces = new LangfuseTracesResource(request, this.prefix);
    this.observations = new LangfuseObservationsResource(request, this.prefix);
    this.spans = new LangfuseSpansResource(request, this.prefix);
    this.scores = new LangfuseScoresResource(request, this.prefix);
    this.datasets = new LangfuseDatasetsResource(request, this.prefix);
    this.prompts = new LangfusePromptsResource(request, this.prefix);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AssemblyAI typed sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export class AssemblyAiTranscriptResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Submit an audio URL for transcription.
   *
   * Calls `POST /assemblyai/transcript`. The transcript is processed
   * asynchronously — poll {@link get} or use a webhook to fetch the final result.
   *
   * @param params - The audio URL plus optional transcription features (speaker labels, redaction, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly queued transcript record.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/submit
   */
  create(
    params: AssemblyAITranscriptCreateParams,
    options?: RequestOptions,
  ): Promise<AssemblyAITranscript> {
    return this.request<AssemblyAITranscript>({
      method: 'POST',
      path: `${this.prefix}/transcript`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List transcripts in the AssemblyAI account.
   *
   * Calls `GET /assemblyai/transcript`.
   *
   * @param params - Optional pagination / filter parameters (limit, status, before/after timestamps).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of transcripts.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/list
   */
  list(
    params: AssemblyAITranscriptListParams = {},
    options?: RequestOptions,
  ): Promise<AssemblyAITranscriptListResponse> {
    return this.request<AssemblyAITranscriptListResponse>({
      method: 'GET',
      path: `${this.prefix}/transcript`,
      options: toQuery(params, options),
    });
  }

  /**
   * Fetch a transcript by ID.
   *
   * Calls `GET /assemblyai/transcript/{transcriptId}`. Use this to poll for
   * completion after {@link create}.
   *
   * @param transcriptId - The transcript identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The transcript with its current status and any completed text.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/get
   */
  get(transcriptId: string, options?: RequestOptions): Promise<AssemblyAITranscript> {
    return this.request<AssemblyAITranscript>({
      method: 'GET',
      path: `${this.prefix}/transcript/${encodeURIComponent(transcriptId)}`,
      options,
    });
  }

  /**
   * Delete (redact) a transcript by ID.
   *
   * Calls `DELETE /assemblyai/transcript/{transcriptId}`.
   *
   * @param transcriptId - The transcript identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The deletion acknowledgement payload.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/delete
   */
  delete(
    transcriptId: string,
    options?: RequestOptions,
  ): Promise<AssemblyAITranscriptDeleteResponse> {
    return this.request<AssemblyAITranscriptDeleteResponse>({
      method: 'DELETE',
      path: `${this.prefix}/transcript/${encodeURIComponent(transcriptId)}`,
      options,
    });
  }

  /**
   * Fetch the subtitle file for a completed transcript.
   *
   * Calls `GET /assemblyai/transcript/{transcriptId}/{format}` and returns the
   * raw subtitle text (`srt` or `vtt`).
   *
   * @param transcriptId - The transcript identifier.
   * @param format - The subtitle format (`"srt"` or `"vtt"`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The subtitle file contents as a string.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/get-subtitles
   */
  subtitles(
    transcriptId: string,
    format: AssemblyAISubtitleFormat,
    options?: RequestOptions,
  ): Promise<string> {
    return this.request<string>({
      method: 'GET',
      path: `${this.prefix}/transcript/${encodeURIComponent(transcriptId)}/${encodeURIComponent(format)}`,
      options,
    });
  }

  /**
   * Fetch the sentence-level breakdown of a completed transcript.
   *
   * Calls `GET /assemblyai/transcript/{transcriptId}/sentences`.
   *
   * @param transcriptId - The transcript identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of sentences with timestamps and confidences.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/get-sentences
   */
  sentences(
    transcriptId: string,
    options?: RequestOptions,
  ): Promise<AssemblyAISentencesResponse> {
    return this.request<AssemblyAISentencesResponse>({
      method: 'GET',
      path: `${this.prefix}/transcript/${encodeURIComponent(transcriptId)}/sentences`,
      options,
    });
  }

  /**
   * Fetch the paragraph-level breakdown of a completed transcript.
   *
   * Calls `GET /assemblyai/transcript/{transcriptId}/paragraphs`.
   *
   * @param transcriptId - The transcript identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of paragraphs with timestamps and confidences.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/get-paragraphs
   */
  paragraphs(
    transcriptId: string,
    options?: RequestOptions,
  ): Promise<AssemblyAIParagraphsResponse> {
    return this.request<AssemblyAIParagraphsResponse>({
      method: 'GET',
      path: `${this.prefix}/transcript/${encodeURIComponent(transcriptId)}/paragraphs`,
      options,
    });
  }

  /**
   * Fetch the redacted-audio metadata for a transcript.
   *
   * Calls `GET /assemblyai/transcript/{transcriptId}/redacted-audio` —
   * available only when transcription was created with PII audio redaction.
   *
   * @param transcriptId - The transcript identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The redacted-audio status and download URL when ready.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/transcripts/get-redacted-audio
   */
  redactedAudio(
    transcriptId: string,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'GET',
      path: `${this.prefix}/transcript/${encodeURIComponent(transcriptId)}/redacted-audio`,
      options,
    });
  }
}

export class AssemblyAiLemurResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Run a free-form LeMUR task over one or more transcripts.
   *
   * Calls `POST /assemblyai/lemur/v3/generate/task`.
   *
   * @param params - The custom prompt plus transcript IDs / input text and model selection.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The LeMUR task response with `response` text and request metadata.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/lemur/task
   */
  task(
    params: AssemblyAILemurTaskParams,
    options?: RequestOptions,
  ): Promise<AssemblyAILemurTaskResponse> {
    return this.request<AssemblyAILemurTaskResponse>({
      method: 'POST',
      path: `${this.prefix}/lemur/v3/generate/task`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Generate a LeMUR summary of one or more transcripts.
   *
   * Calls `POST /assemblyai/lemur/v3/generate/summary`.
   *
   * @param params - Transcript IDs / input text plus optional `context` and `answer_format`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The LeMUR summary response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/lemur/summary
   */
  summary(
    params: AssemblyAILemurSummaryParams,
    options?: RequestOptions,
  ): Promise<AssemblyAILemurSummaryResponse> {
    return this.request<AssemblyAILemurSummaryResponse>({
      method: 'POST',
      path: `${this.prefix}/lemur/v3/generate/summary`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Run LeMUR question-answer over one or more transcripts.
   *
   * Calls `POST /assemblyai/lemur/v3/generate/question-answer`.
   *
   * @param params - Transcript IDs / input text and the list of `questions` to answer.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The LeMUR question-answer response with per-question answers.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/lemur/question-answer
   */
  questionAnswer(
    params: AssemblyAILemurQuestionAnswerParams,
    options?: RequestOptions,
  ): Promise<AssemblyAILemurQuestionAnswerResponse> {
    return this.request<AssemblyAILemurQuestionAnswerResponse>({
      method: 'POST',
      path: `${this.prefix}/lemur/v3/generate/question-answer`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class AssemblyAiRealtimeResource {
  constructor(
    private request: RequestFn,
    private prefix: string,
  ) {}

  /**
   * Mint a temporary AssemblyAI Realtime authentication token.
   *
   * Calls `POST /assemblyai/realtime/token`. The returned token is used by
   * browser clients to authenticate the realtime WebSocket without exposing
   * the long-lived API key.
   *
   * @param params - Optional `expires_in` (token lifetime in seconds).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The realtime token response.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/streaming/generate-token
   */
  token(
    params: AssemblyAIRealtimeTokenParams = {},
    options?: RequestOptions,
  ): Promise<AssemblyAIRealtimeTokenResponse> {
    return this.request<AssemblyAIRealtimeTokenResponse>({
      method: 'POST',
      path: `${this.prefix}/realtime/token`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/**
 * Typed AssemblyAI pass-through resource. Wraps the stable AssemblyAI REST
 * endpoints (transcript / LeMUR / realtime / upload) while still exposing the
 * generic `get/post/put/patch/delete` escape hatches.
 *
 * Used for both `assemblyAi` and `assemblyAiEu` — only the prefix differs.
 */
export class AssemblyAiPassThroughResource extends PassThroughProvider {
  readonly transcript: AssemblyAiTranscriptResource;
  readonly lemur: AssemblyAiLemurResource;
  readonly realtime: AssemblyAiRealtimeResource;

  constructor(
    request: RequestFn,
    _streamRequest: StreamRequestFn,
    prefix: string = PASS_THROUGH_PREFIXES.assemblyAi,
  ) {
    super(request, prefix);
    this.transcript = new AssemblyAiTranscriptResource(request, this.prefix);
    this.lemur = new AssemblyAiLemurResource(request, this.prefix);
    this.realtime = new AssemblyAiRealtimeResource(request, this.prefix);
  }

  /**
   * Upload a local audio file to AssemblyAI.
   *
   * Calls `POST /assemblyai/upload`. The body is sent as a raw binary stream;
   * pass `options.contentType` to override the default `application/octet-stream`.
   * The returned `upload_url` should be supplied to {@link AssemblyAiTranscriptResource.create}.
   *
   * @param file - The audio bytes to upload (`ArrayBuffer`, `Uint8Array`, or `Blob`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc., plus an optional `contentType`.
   * @returns The upload response with the temporary `upload_url`.
   *
   * @see https://docs.litellm.ai/docs/pass_through/assembly_ai
   * @see https://www.assemblyai.com/docs/api-reference/upload
   */
  upload(
    file: ArrayBuffer | Uint8Array | Blob,
    options?: RequestOptions & { contentType?: string },
  ): Promise<AssemblyAIUploadResponse> {
    const contentType = options?.contentType ?? 'application/octet-stream';
    const { contentType: _omit, ...rest } = options ?? {};
    void _omit;
    return this.request<AssemblyAIUploadResponse>({
      method: 'POST',
      path: `${this.prefix}/upload`,
      body: { kind: 'binary', value: file, contentType },
      options: rest,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass-through resource — registers every provider sub-resource.
// ─────────────────────────────────────────────────────────────────────────────

export class PassThroughResource {
  /**
   * Anthropic pass-through (raw HTTP only).
   *
   * Exposes only the generic `get/post/put/patch/delete` escape hatches against
   * the `/anthropic` prefix. For typed Anthropic endpoints prefer the dedicated
   * `client.anthropic` resource, which wraps `/v1/messages` and friends.
   */
  readonly anthropic: PassThroughProvider;
  /**
   * Google Gemini (Generative Language API) pass-through (raw HTTP only).
   *
   * Exposes only the generic `get/post/put/patch/delete` escape hatches against
   * the `/gemini` prefix. For typed Gemini endpoints prefer the dedicated
   * `client.gemini` resource.
   */
  readonly gemini: PassThroughProvider;
  /** Google Vertex AI pass-through with typed `generateContent`, `embedContent`, `predict`, and `batchPredictionJobs`. */
  readonly vertex: VertexPassThroughResource;
  /** Cohere pass-through with typed `chat`, `chatV2`, `embed`, `rerank`, `classify`, `generate`, `tokenize`, and `detokenize`. */
  readonly cohere: CoherePassThroughResource;
  /** Mistral pass-through with typed `chat`, `embeddings`, `fim`, `agents`, and `models` sub-resources. */
  readonly mistral: MistralPassThroughResource;
  /** vLLM pass-through (OpenAI-compatible) with typed `chat`, `completions`, `embeddings`, and `models` sub-resources. */
  readonly vllm: VllmPassThroughResource;
  /** Milvus pass-through with typed `collections`, `entities`, `partitions`, and `indexes` sub-resources. */
  readonly milvus: MilvusPassThroughResource;
  /** AWS Bedrock pass-through with typed Converse, Invoke, Guardrails, KnowledgeBases, and Agents helpers. */
  readonly bedrock: BedrockPassThroughResource;
  /** AssemblyAI pass-through with typed `transcript`, `lemur`, `realtime`, and `upload` helpers. */
  readonly assemblyAi: AssemblyAiPassThroughResource;
  /** AssemblyAI EU pass-through. Mirrors `assemblyAi` against the `/eu.assemblyai` prefix. */
  readonly assemblyAiEu: AssemblyAiPassThroughResource;
  /** Azure OpenAI pass-through with typed deployment-scoped helpers (chat, completions, embeddings, images, audio). */
  readonly azure: AzurePassThroughResource;
  /**
   * OpenAI pass-through routed through `/openai` (raw HTTP only).
   *
   * @deprecated The LiteLLM docs recommend the `/openai_passthrough` prefix
   * (see {@link openaiPassthrough}) to avoid clashing with native
   * OpenAI-compatible routes such as `/openai/v1/chat/completions`. Kept for
   * backwards compatibility.
   */
  readonly openai: PassThroughProvider;
  /** OpenAI pass-through using the recommended `/openai_passthrough` prefix (raw HTTP only). */
  readonly openaiPassthrough: PassThroughProvider;
  /** Cursor Cloud Agents pass-through with typed `me`, `models`, `repositories`, and `agents.*` helpers. */
  readonly cursor: CursorPassThroughResource;
  /** Langfuse pass-through with typed `traces`, `observations`, `spans`, `scores`, `datasets`, and `prompts` sub-resources. */
  readonly langfuse: LangfusePassThroughResource;

  constructor(request: RequestFn, streamRequest: StreamRequestFn) {
    this.anthropic = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.anthropic);
    this.gemini = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.gemini);
    this.vertex = new VertexPassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.vertex,
    );
    this.cohere = new CoherePassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.cohere,
    );
    this.mistral = new MistralPassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.mistral,
    );
    this.vllm = new VllmPassThroughResource(request, streamRequest, PASS_THROUGH_PREFIXES.vllm);
    this.milvus = new MilvusPassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.milvus,
    );
    this.bedrock = new BedrockPassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.bedrock,
    );
    this.assemblyAi = new AssemblyAiPassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.assemblyAi,
    );
    this.assemblyAiEu = new AssemblyAiPassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.assemblyAiEu,
    );
    this.azure = new AzurePassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.azure,
    );
    this.openai = new PassThroughProvider(request, PASS_THROUGH_PREFIXES.openai);
    this.openaiPassthrough = new PassThroughProvider(
      request,
      PASS_THROUGH_PREFIXES.openaiPassthrough,
    );
    this.cursor = new CursorPassThroughResource(request, PASS_THROUGH_PREFIXES.cursor);
    this.langfuse = new LangfusePassThroughResource(
      request,
      streamRequest,
      PASS_THROUGH_PREFIXES.langfuse,
    );
  }
}
