// ─────────────────────────────────────────────────────────────────────────────
// Google Gemini native API types — /v1beta/models/{model}:generateContent
// Reference: https://ai.google.dev/api/generate-content
// ─────────────────────────────────────────────────────────────────────────────

export type GeminiRole = 'user' | 'model' | 'system' | 'function' | (string & {});

// ─── Parts ───────────────────────────────────────────────────────────────────

export interface GeminiTextPart {
  text: string;
}

export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiFileDataPart {
  fileData: {
    mimeType?: string;
    fileUri: string;
  };
}

export interface GeminiFunctionCallPart {
  functionCall: {
    name: string;
    args?: Record<string, unknown>;
  };
}

export interface GeminiFunctionResponsePart {
  functionResponse: {
    name: string;
    response: Record<string, unknown>;
  };
}

export interface GeminiExecutableCodePart {
  executableCode: {
    language: 'PYTHON' | (string & {});
    code: string;
  };
}

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
}

export interface GeminiThoughtPart {
  thought: boolean;
  text?: string;
}

export type GeminiPart =
  | GeminiTextPart
  | GeminiInlineDataPart
  | GeminiFileDataPart
  | GeminiFunctionCallPart
  | GeminiFunctionResponsePart
  | GeminiExecutableCodePart
  | GeminiCodeExecutionResultPart
  | GeminiThoughtPart;

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

export interface GeminiInteractionObject {
  id: string;
  name?: string;
  state?:
    | 'STATE_UNSPECIFIED'
    | 'PENDING'
    | 'RUNNING'
    | 'SUCCEEDED'
    | 'CANCELLED'
    | 'FAILED'
    | (string & {});
  model?: import('./models-enum').GeminiModel | (string & {});
  contents?: GeminiContent[];
  createTime?: string;
  updateTime?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GeminiInteractionCreateParams {
  model?: import('./models-enum').GeminiModel | (string & {});
  contents?: GeminiContent[];
  systemInstruction?: GeminiContent;
  tools?: GeminiTool[];
  toolConfig?: GeminiToolConfig;
  safetySettings?: GeminiSafetySetting[];
  generationConfig?: GeminiGenerationConfig;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GeminiInteractionDeletedResponse {
  id: string;
  deleted: boolean;
}
