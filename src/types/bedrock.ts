// ─────────────────────────────────────────────────────────────────────────────
// AWS Bedrock pass-through types — Converse, Invoke, Guardrails, KB, Agents.
// References:
//   https://docs.litellm.ai/docs/bedrock_converse
//   https://docs.litellm.ai/docs/bedrock_invoke
//   https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html
// ─────────────────────────────────────────────────────────────────────────────

// ─── Converse: content blocks ────────────────────────────────────────────────

export interface ConverseTextBlock {
  text: string;
}

export interface ConverseImageSourceBytes {
  bytes: string;
}
export interface ConverseImageSourceS3 {
  s3Location: { uri: string; bucketOwner?: string };
}
export type ConverseImageSource = ConverseImageSourceBytes | ConverseImageSourceS3;

export interface ConverseImageBlock {
  image: {
    format: 'png' | 'jpeg' | 'gif' | 'webp' | (string & {});
    source: ConverseImageSource;
  };
}

export interface ConverseDocumentBlock {
  document: {
    format: 'pdf' | 'csv' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'html' | 'txt' | 'md' | (string & {});
    name: string;
    source: { bytes: string } | { s3Location: { uri: string; bucketOwner?: string } };
  };
}

export interface ConverseVideoBlock {
  video: {
    format: 'mp4' | 'mov' | 'mkv' | 'webm' | 'flv' | 'mpeg' | 'mpg' | 'wmv' | 'three_gp' | (string & {});
    source: { bytes: string } | { s3Location: { uri: string; bucketOwner?: string } };
  };
}

export interface ConverseToolUseBlock {
  toolUse: {
    toolUseId: string;
    name: string;
    input: unknown;
  };
}

export interface ConverseToolResultBlock {
  toolResult: {
    toolUseId: string;
    content: Array<
      | { text: string }
      | { json: unknown }
      | { image: ConverseImageBlock['image'] }
      | { document: ConverseDocumentBlock['document'] }
      | { video: ConverseVideoBlock['video'] }
    >;
    status?: 'success' | 'error';
  };
}

export interface ConverseGuardContentBlock {
  guardContent: {
    text?: { text: string; qualifiers?: string[] };
    image?: ConverseImageBlock['image'];
  };
}

export interface ConverseReasoningContentBlock {
  reasoningContent: {
    reasoningText?: { text: string; signature?: string };
    redactedContent?: string;
  };
}

export type ConverseContentBlock =
  | ConverseTextBlock
  | ConverseImageBlock
  | ConverseDocumentBlock
  | ConverseVideoBlock
  | ConverseToolUseBlock
  | ConverseToolResultBlock
  | ConverseGuardContentBlock
  | ConverseReasoningContentBlock
  // Catch-all for blocks AWS may add in the future.
  | { [key: string]: unknown };

// ─── Converse: messages & system ─────────────────────────────────────────────

export interface ConverseMessage {
  role: 'user' | 'assistant';
  content: ConverseContentBlock[];
}

export type ConverseSystemBlock =
  | { text: string }
  | { guardContent: ConverseGuardContentBlock['guardContent'] }
  | { [key: string]: unknown };

// ─── Converse: inference config & tool config ────────────────────────────────

export interface ConverseInferenceConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface ConverseToolSpec {
  name: string;
  description?: string;
  inputSchema: { json: unknown };
}

export interface ConverseToolConfig {
  tools: Array<{ toolSpec: ConverseToolSpec } | { [key: string]: unknown }>;
  toolChoice?:
    | { auto: Record<string, never> }
    | { any: Record<string, never> }
    | { tool: { name: string } }
    | { [key: string]: unknown };
}

export interface ConverseGuardrailConfig {
  guardrailIdentifier: string;
  guardrailVersion: string;
  trace?: 'enabled' | 'disabled' | (string & {});
  streamProcessingMode?: 'sync' | 'async' | (string & {});
}

// ─── Converse: request & response ────────────────────────────────────────────

export interface ConverseRequest {
  messages: ConverseMessage[];
  system?: ConverseSystemBlock[];
  inferenceConfig?: ConverseInferenceConfig;
  toolConfig?: ConverseToolConfig;
  guardrailConfig?: ConverseGuardrailConfig;
  additionalModelRequestFields?: Record<string, unknown>;
  additionalModelResponseFieldPaths?: string[];
  promptVariables?: Record<string, { text: string } | { [key: string]: unknown }>;
  requestMetadata?: Record<string, string>;
}

export type ConverseStopReason =
  | 'end_turn'
  | 'tool_use'
  | 'max_tokens'
  | 'stop_sequence'
  | 'guardrail_intervened'
  | 'content_filtered'
  | (string & {});

export interface ConverseTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheReadInputTokens?: number;
  cacheWriteInputTokens?: number;
  [key: string]: unknown;
}

export interface ConverseMetrics {
  latencyMs: number;
  [key: string]: unknown;
}

export interface ConverseTrace {
  guardrail?: unknown;
  promptRouter?: unknown;
  [key: string]: unknown;
}

export interface ConverseResponse {
  output: {
    message: {
      role: 'assistant';
      content: ConverseContentBlock[];
    };
  };
  stopReason: ConverseStopReason;
  usage: ConverseTokenUsage;
  metrics: ConverseMetrics;
  additionalModelResponseFields?: Record<string, unknown>;
  trace?: ConverseTrace;
  performanceConfig?: { latency?: 'standard' | 'optimized' | (string & {}) };
  [key: string]: unknown;
}

// ─── Converse stream events ──────────────────────────────────────────────────

export interface ConverseStreamMessageStart {
  messageStart: { role: 'assistant' };
}

export interface ConverseStreamContentBlockStart {
  contentBlockStart: {
    contentBlockIndex: number;
    start: {
      toolUse?: { toolUseId: string; name: string };
      [key: string]: unknown;
    };
  };
}

export interface ConverseStreamContentBlockDelta {
  contentBlockDelta: {
    contentBlockIndex: number;
    delta: {
      text?: string;
      toolUse?: { input: string };
      reasoningContent?: { text?: string; redactedContent?: string; signature?: string };
      [key: string]: unknown;
    };
  };
}

export interface ConverseStreamContentBlockStop {
  contentBlockStop: { contentBlockIndex: number };
}

export interface ConverseStreamMessageStop {
  messageStop: {
    stopReason: ConverseStopReason;
    additionalModelResponseFields?: Record<string, unknown>;
  };
}

export interface ConverseStreamMetadata {
  metadata: {
    usage: ConverseTokenUsage;
    metrics: ConverseMetrics;
    trace?: ConverseTrace;
    performanceConfig?: { latency?: string };
  };
}

export type ConverseStreamEvent =
  | ConverseStreamMessageStart
  | ConverseStreamContentBlockStart
  | ConverseStreamContentBlockDelta
  | ConverseStreamContentBlockStop
  | ConverseStreamMessageStop
  | ConverseStreamMetadata
  | { [key: string]: unknown };

// ─── Guardrails ──────────────────────────────────────────────────────────────

export interface BedrockGuardrailTextContent {
  text: { text: string; qualifiers?: Array<'grounding_source' | 'query' | 'guard_content' | (string & {})> };
}

export interface BedrockGuardrailApplyParams {
  source: 'INPUT' | 'OUTPUT';
  content: BedrockGuardrailTextContent[];
}

export interface BedrockGuardrailAssessment {
  topicPolicy?: unknown;
  contentPolicy?: unknown;
  wordPolicy?: unknown;
  sensitiveInformationPolicy?: unknown;
  contextualGroundingPolicy?: unknown;
  invocationMetrics?: unknown;
  [key: string]: unknown;
}

export interface BedrockGuardrailApplyResponse {
  action: 'NONE' | 'GUARDRAIL_INTERVENED' | (string & {});
  outputs?: Array<{ text: string }>;
  assessments?: BedrockGuardrailAssessment[];
  usage?: {
    topicPolicyUnits?: number;
    contentPolicyUnits?: number;
    wordPolicyUnits?: number;
    sensitiveInformationPolicyUnits?: number;
    sensitiveInformationPolicyFreeUnits?: number;
    contextualGroundingPolicyUnits?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ─── Knowledge bases: retrieve ───────────────────────────────────────────────

export interface BedrockKBRetrievalQuery {
  text: string;
}

export interface BedrockKBRetrievalConfiguration {
  vectorSearchConfiguration?: {
    numberOfResults?: number;
    overrideSearchType?: 'HYBRID' | 'SEMANTIC' | (string & {});
    filter?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BedrockKBRetrieveParams {
  retrievalQuery: BedrockKBRetrievalQuery;
  retrievalConfiguration?: BedrockKBRetrievalConfiguration;
  nextToken?: string;
  guardrailConfiguration?: {
    guardrailId: string;
    guardrailVersion: string;
  };
}

export interface BedrockKBRetrievalResultLocation {
  type: 'S3' | 'WEB' | 'CONFLUENCE' | 'SALESFORCE' | 'SHAREPOINT' | 'CUSTOM' | (string & {});
  s3Location?: { uri: string };
  webLocation?: { url: string };
  [key: string]: unknown;
}

export interface BedrockKBRetrievalResult {
  content: { text?: string; type?: string; [key: string]: unknown };
  location?: BedrockKBRetrievalResultLocation;
  metadata?: Record<string, unknown>;
  score?: number;
  [key: string]: unknown;
}

export interface BedrockKBRetrieveResponse {
  retrievalResults: BedrockKBRetrievalResult[];
  nextToken?: string;
  guardrailAction?: string;
  [key: string]: unknown;
}

// ─── Knowledge bases: retrieveAndGenerate ────────────────────────────────────

export interface BedrockKBRetrieveAndGenerateInput {
  text: string;
}

export interface BedrockKBRetrieveAndGenerateConfiguration {
  type: 'KNOWLEDGE_BASE' | 'EXTERNAL_SOURCES' | (string & {});
  knowledgeBaseConfiguration?: {
    knowledgeBaseId: string;
    modelArn: string;
    retrievalConfiguration?: BedrockKBRetrievalConfiguration;
    generationConfiguration?: unknown;
    orchestrationConfiguration?: unknown;
    [key: string]: unknown;
  };
  externalSourcesConfiguration?: unknown;
}

export interface BedrockKBRetrieveAndGenerateParams {
  input: BedrockKBRetrieveAndGenerateInput;
  retrieveAndGenerateConfiguration?: BedrockKBRetrieveAndGenerateConfiguration;
  sessionConfiguration?: { kmsKeyArn: string };
  sessionId?: string;
}

export interface BedrockKBRetrieveAndGenerateResponse {
  output: { text: string };
  citations?: Array<{
    generatedResponsePart?: unknown;
    retrievedReferences?: Array<{
      content?: { text?: string };
      location?: BedrockKBRetrievalResultLocation;
      metadata?: Record<string, unknown>;
    }>;
  }>;
  sessionId: string;
  guardrailAction?: string;
  [key: string]: unknown;
}

// ─── Agents: invoke ──────────────────────────────────────────────────────────

export interface BedrockAgentInvokeParams {
  inputText: string;
  enableTrace?: boolean;
  endSession?: boolean;
  sessionState?: Record<string, unknown>;
  memoryId?: string;
  bedrockModelConfigurations?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Bedrock InvokeAgent returns a streaming event-stream response. We expose it as
 * an opaque stream of events (each event payload's exact shape varies by trace
 * configuration); typical fields include `chunk.bytes` for output tokens and
 * `trace` events when `enableTrace` is set.
 */
export interface BedrockAgentInvokeStreamEvent {
  chunk?: { bytes?: string; attribution?: unknown };
  trace?: unknown;
  returnControl?: unknown;
  files?: unknown;
  [key: string]: unknown;
}

// ─── Error body ──────────────────────────────────────────────────────────────

/**
 * Provider-native error body returned by AWS Bedrock when a request fails.
 * The proxy passes this shape through under `LiteLLMError.body` when routing
 * to Bedrock.
 *
 * Reference: https://docs.aws.amazon.com/bedrock/latest/APIReference/CommonErrors.html
 */
export interface BedrockErrorBody {
  message: string;
  /** AWS error code, e.g. `'AccessDeniedException'`, `'ValidationException'`, `'ThrottlingException'`. */
  __type?: string;
}
