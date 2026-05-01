// ─────────────────────────────────────────────────────────────────────────────
// Google Gemini native API types — /v1beta/models/{model}:generateContent
// Reference: https://ai.google.dev/api/generate-content
// ─────────────────────────────────────────────────────────────────────────────

export type GeminiRole = 'user' | 'model' | 'system' | 'function' | (string & {});

// ─── Parts ───────────────────────────────────────────────────────────────────
//
// Gemini's `Part` is a oneOf — exactly one of the variant keys is set on a
// given object. Streaming responses (`streamGenerateContent`) reuse the same
// shape: each chunk carries a `candidates[].content.parts[]` array of these
// parts. We model each variant so it carries *only* its own discriminator
// key (with the others set to `never`), giving proper narrowing inside
// `if ('text' in part)` style guards.
//
// Reference: https://ai.google.dev/api/generate-content#Part

/** Plain text part — used for both prompt and model-generated text. */
export interface GeminiTextPart {
  text: string;
  inlineData?: never;
  fileData?: never;
  functionCall?: never;
  functionResponse?: never;
  executableCode?: never;
  codeExecutionResult?: never;
  thought?: never;
}

/** Inline binary data (base64) — images, audio, etc. */
export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
  text?: never;
  fileData?: never;
  functionCall?: never;
  functionResponse?: never;
  executableCode?: never;
  codeExecutionResult?: never;
  thought?: never;
}

/** Reference to a file uploaded via the Files API or a URI. */
export interface GeminiFileDataPart {
  fileData: {
    mimeType?: string;
    fileUri: string;
  };
  text?: never;
  inlineData?: never;
  functionCall?: never;
  functionResponse?: never;
  executableCode?: never;
  codeExecutionResult?: never;
  thought?: never;
}

/** Model-emitted function call (tool use). */
export interface GeminiFunctionCallPart {
  functionCall: {
    name: string;
    args?: Record<string, unknown>;
  };
  text?: never;
  inlineData?: never;
  fileData?: never;
  functionResponse?: never;
  executableCode?: never;
  codeExecutionResult?: never;
  thought?: never;
}

/** Caller-supplied tool result for a previous function call. */
export interface GeminiFunctionResponsePart {
  functionResponse: {
    name: string;
    response: Record<string, unknown>;
  };
  text?: never;
  inlineData?: never;
  fileData?: never;
  functionCall?: never;
  executableCode?: never;
  codeExecutionResult?: never;
  thought?: never;
}

/** Executable code block emitted by the code-execution tool. */
export interface GeminiExecutableCodePart {
  executableCode: {
    language: 'PYTHON' | (string & {});
    code: string;
  };
  text?: never;
  inlineData?: never;
  fileData?: never;
  functionCall?: never;
  functionResponse?: never;
  codeExecutionResult?: never;
  thought?: never;
}

/** Result of a code-execution tool invocation. */
export interface GeminiCodeExecutionResultPart {
  codeExecutionResult: {
    outcome:
      | 'OUTCOME_UNSPECIFIED'
      | 'OUTCOME_OK'
      | 'OUTCOME_FAILED'
      | 'OUTCOME_DEADLINE_EXCEEDED'
      | (string & {});
    output?: string;
  };
  text?: never;
  inlineData?: never;
  fileData?: never;
  functionCall?: never;
  functionResponse?: never;
  executableCode?: never;
  thought?: never;
}

/**
 * "Thought" part emitted when `thinkingConfig.includeThoughts` is set —
 * carries the model's internal reasoning. The `text` field is optional
 * because some providers stream a pure flag with separate text.
 */
export interface GeminiThoughtPart {
  thought: boolean;
  text?: string;
  inlineData?: never;
  fileData?: never;
  functionCall?: never;
  functionResponse?: never;
  executableCode?: never;
  codeExecutionResult?: never;
}

/**
 * Strict discriminated union of *known* Gemini part variants. Each variant
 * has exactly one of the discriminator keys set; the others are typed as
 * `never` to give proper narrowing inside `if ('text' in part)` guards.
 */
export type KnownGeminiPart =
  | GeminiTextPart
  | GeminiInlineDataPart
  | GeminiFileDataPart
  | GeminiFunctionCallPart
  | GeminiFunctionResponsePart
  | GeminiExecutableCodePart
  | GeminiCodeExecutionResultPart
  | GeminiThoughtPart;

/**
 * Forward-compat fallback for unmodelled Gemini part variants. Surfaces
 * arbitrary fields as `unknown` via the index signature so consumers can
 * walk new part types without a cast when Google adds them. The known
 * discriminator keys are kept optional+`unknown` rather than `never` so
 * the open `GeminiPart` union remains assignable from any object literal.
 */
export interface UnknownGeminiPart {
  text?: unknown;
  inlineData?: unknown;
  fileData?: unknown;
  functionCall?: unknown;
  functionResponse?: unknown;
  executableCode?: unknown;
  codeExecutionResult?: unknown;
  thought?: unknown;
  [key: string]: unknown;
}

/**
 * Open union of Gemini part variants. Includes a forward-compat fallback
 * for unmodelled future variants. For exhaustive narrowing on the modelled
 * variants, narrow to `KnownGeminiPart` first.
 */
export type GeminiPart = KnownGeminiPart | UnknownGeminiPart;

// ─── Content ─────────────────────────────────────────────────────────────────

export interface GeminiContent {
  role?: GeminiRole;
  parts: GeminiPart[];
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export interface GeminiFunctionDeclaration {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

export interface GeminiTool {
  functionDeclarations?: GeminiFunctionDeclaration[];
  googleSearch?: Record<string, unknown>;
  googleSearchRetrieval?: Record<string, unknown>;
  codeExecution?: Record<string, unknown>;
  urlContext?: Record<string, unknown>;
}

export interface GeminiToolConfig {
  functionCallingConfig?: {
    mode?: 'AUTO' | 'ANY' | 'NONE' | (string & {});
    allowedFunctionNames?: string[];
  };
}

// ─── Safety ──────────────────────────────────────────────────────────────────

export type GeminiHarmCategory =
  | 'HARM_CATEGORY_UNSPECIFIED'
  | 'HARM_CATEGORY_HATE_SPEECH'
  | 'HARM_CATEGORY_DANGEROUS_CONTENT'
  | 'HARM_CATEGORY_HARASSMENT'
  | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
  | 'HARM_CATEGORY_CIVIC_INTEGRITY'
  | (string & {});

export type GeminiHarmBlockThreshold =
  | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
  | 'BLOCK_LOW_AND_ABOVE'
  | 'BLOCK_MEDIUM_AND_ABOVE'
  | 'BLOCK_ONLY_HIGH'
  | 'BLOCK_NONE'
  | 'OFF'
  | (string & {});

export interface GeminiSafetySetting {
  category: GeminiHarmCategory;
  threshold: GeminiHarmBlockThreshold;
}

export interface GeminiSafetyRating {
  category: GeminiHarmCategory;
  probability:
    | 'HARM_PROBABILITY_UNSPECIFIED'
    | 'NEGLIGIBLE'
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | (string & {});
  blocked?: boolean;
  probabilityScore?: number;
  severity?: string;
  severityScore?: number;
}

// ─── Generation config ───────────────────────────────────────────────────────

export interface GeminiThinkingConfig {
  includeThoughts?: boolean;
  thinkingBudget?: number;
}

export interface GeminiGenerationConfig {
  stopSequences?: string[];
  candidateCount?: number;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  seed?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  responseLogprobs?: boolean;
  logprobs?: number;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  responseModalities?: Array<'TEXT' | 'IMAGE' | 'AUDIO' | (string & {})>;
  thinkingConfig?: GeminiThinkingConfig;
  speechConfig?: Record<string, unknown>;
  audioTimestamp?: boolean;
}

// ─── Request: generateContent ────────────────────────────────────────────────

export interface GenerateContentRequest {
  contents: GeminiContent[];
  systemInstruction?: GeminiContent;
  tools?: GeminiTool[];
  toolConfig?: GeminiToolConfig;
  safetySettings?: GeminiSafetySetting[];
  generationConfig?: GeminiGenerationConfig;
  cachedContent?: string;
  /** Extra headers forwarded to the provider via the proxy */
  extra_headers?: Record<string, string>;
}

// ─── Response: generateContent ───────────────────────────────────────────────

export type GeminiFinishReason =
  | 'FINISH_REASON_UNSPECIFIED'
  | 'STOP'
  | 'MAX_TOKENS'
  | 'SAFETY'
  | 'RECITATION'
  | 'LANGUAGE'
  | 'OTHER'
  | 'BLOCKLIST'
  | 'PROHIBITED_CONTENT'
  | 'SPII'
  | 'MALFORMED_FUNCTION_CALL'
  | 'IMAGE_SAFETY'
  | (string & {});

export interface GeminiCitationSource {
  startIndex?: number;
  endIndex?: number;
  uri?: string;
  license?: string;
}
export interface GeminiCitationMetadata {
  citationSources?: GeminiCitationSource[];
}

export interface GeminiGroundingChunk {
  web?: { uri?: string; title?: string };
  retrievedContext?: { uri?: string; title?: string; text?: string };
}

export interface GeminiGroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GeminiGroundingChunk[];
  groundingSupports?: unknown[];
  searchEntryPoint?: { renderedContent?: string };
  retrievalQueries?: string[];
}

export interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: GeminiFinishReason;
  index?: number;
  safetyRatings?: GeminiSafetyRating[];
  citationMetadata?: GeminiCitationMetadata;
  tokenCount?: number;
  groundingMetadata?: GeminiGroundingMetadata;
  avgLogprobs?: number;
  logprobsResult?: unknown;
  finishMessage?: string;
}

export interface GeminiPromptFeedback {
  blockReason?: 'BLOCK_REASON_UNSPECIFIED' | 'SAFETY' | 'OTHER' | (string & {});
  blockReasonMessage?: string;
  safetyRatings?: GeminiSafetyRating[];
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  cachedContentTokenCount?: number;
  thoughtsTokenCount?: number;
  toolUsePromptTokenCount?: number;
}

export interface GenerateContentResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: GeminiPromptFeedback;
  usageMetadata?: GeminiUsageMetadata;
  modelVersion?: string;
  responseId?: string;
}

// ─── countTokens ─────────────────────────────────────────────────────────────

export interface GeminiCountTokensRequest {
  contents?: GeminiContent[];
  generateContentRequest?: GenerateContentRequest;
}

export interface GeminiCountTokensResponse {
  totalTokens: number;
  cachedContentTokenCount?: number;
}

// ─── Interactions ────────────────────────────────────────────────────────────
// LiteLLM /v1beta/interactions adapter — distinct from the raw Gemini native
// API above. Per https://docs.litellm.ai/docs/interactions the proxy exposes a
// snake_case shape that wraps any chat-completion-capable provider, not just
// Gemini. The docs only describe POST (create) and GET (retrieve) operations
// and are sparse on the `tools` / `generation_config` substructures, so those
// are kept open and an index signature is preserved for forward-compat.

export interface GeminiInteractionUsage {
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_tokens?: number;
  [key: string]: unknown;
}

export interface GeminiInteractionOutput {
  type: 'text' | (string & {});
  text?: string;
  [key: string]: unknown;
}

export interface GeminiInteractionObject {
  id: string;
  object?: 'interaction' | (string & {});
  model?: import('./models-enum').GeminiModel | (string & {});
  status?:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | (string & {});
  created?: string;
  updated?: string;
  role?: 'model' | 'user' | 'system' | (string & {});
  outputs?: GeminiInteractionOutput[];
  usage?: GeminiInteractionUsage;
  [key: string]: unknown;
}

export interface GeminiInteractionCreateParams {
  /** Model to use (e.g. `gemini/gemini-2.5-flash`). Required per docs. */
  model: import('./models-enum').GeminiModel | (string & {});
  /** The input text for the interaction. Required per docs. */
  input: string;
  /** ID of a previous interaction to thread context from. */
  previous_interaction_id?: string;
  /** Enable streaming responses. */
  stream?: boolean;
  /** System instructions for the model. */
  system_instruction?: string;
  /** Provider-specific generation configuration. */
  generation_config?: Record<string, unknown>;
  /** Tools available to the model. */
  tools?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface GeminiInteractionDeletedResponse {
  id: string;
  deleted: boolean;
  object?: 'interaction.deleted' | (string & {});
  [key: string]: unknown;
}

// ─── Models surface ──────────────────────────────────────────────────────────

/**
 * Description of a single Gemini model exposed by the proxy at
 * `GET /v1/models/{model}` (alias `/models/{model}`).
 *
 * Mirrors the shape returned by Google Generative Language's `models.get`.
 */
export interface GeminiModelObject {
  /** Resource name (e.g. `models/gemini-1.5-pro`). */
  name?: string;
  /** Base model identifier. */
  baseModelId?: string;
  /** Version string. */
  version?: string;
  /** Display name. */
  displayName?: string;
  /** Free-form description. */
  description?: string;
  /** Maximum input token window. */
  inputTokenLimit?: number;
  /** Maximum output token window. */
  outputTokenLimit?: number;
  /** Methods supported by the model (e.g. `generateContent`). */
  supportedGenerationMethods?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Error body ──────────────────────────────────────────────────────────────

/**
 * Provider-native error body returned by Google's Gemini API when a request
 * fails. The proxy passes this shape through under `LiteLLMError.body` when
 * routing to Gemini.
 *
 * Reference: https://ai.google.dev/gemini-api/docs/troubleshooting
 */
export interface GeminiErrorBody {
  error: {
    code: number;
    message: string;
    status?:
      | 'CANCELLED'
      | 'UNKNOWN'
      | 'INVALID_ARGUMENT'
      | 'DEADLINE_EXCEEDED'
      | 'NOT_FOUND'
      | 'ALREADY_EXISTS'
      | 'PERMISSION_DENIED'
      | 'UNAUTHENTICATED'
      | 'RESOURCE_EXHAUSTED'
      | 'FAILED_PRECONDITION'
      | 'ABORTED'
      | 'OUT_OF_RANGE'
      | 'UNIMPLEMENTED'
      | 'INTERNAL'
      | 'UNAVAILABLE'
      | 'DATA_LOSS'
      | (string & {});
    details?: Array<Record<string, unknown>>;
  };
}
