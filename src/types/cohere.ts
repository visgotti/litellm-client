// ─────────────────────────────────────────────────────────────────────────────
// Cohere pass-through types.
// References:
//   https://docs.cohere.com/reference/about
//   https://docs.cohere.com/reference/chat (v1)
//   https://docs.cohere.com/v2/reference/chat (v2)
//   https://docs.cohere.com/reference/embed
//   https://docs.cohere.com/reference/rerank
// ─────────────────────────────────────────────────────────────────────────────

// ─── Common ──────────────────────────────────────────────────────────────────

export interface CohereTokenUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  search_units?: number;
  classifications?: number;
  [key: string]: unknown;
}

export interface CohereMeta {
  api_version?: { version?: string; is_deprecated?: boolean; is_experimental?: boolean };
  billed_units?: CohereTokenUsage;
  tokens?: CohereTokenUsage;
  warnings?: string[];
  [key: string]: unknown;
}

// ─── Chat (v1) ───────────────────────────────────────────────────────────────

export type CohereChatRole = 'USER' | 'CHATBOT' | 'SYSTEM' | 'TOOL' | (string & {});

export interface CohereChatHistoryMessage {
  role: CohereChatRole;
  message?: string;
  tool_calls?: Array<Record<string, unknown>>;
  tool_results?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface CohereConnector {
  id: string;
  user_access_token?: string;
  continue_on_failure?: boolean;
  options?: Record<string, unknown>;
}

export interface CohereDocument {
  [key: string]: unknown;
}

export interface CohereTool {
  name: string;
  description: string;
  parameter_definitions?: Record<
    string,
    { description?: string; type: string; required?: boolean }
  >;
}

export interface CohereToolResult {
  call: { name: string; parameters: Record<string, unknown> };
  outputs: Array<Record<string, unknown>>;
}

export type CoherePromptTruncation = 'OFF' | 'AUTO' | 'AUTO_PRESERVE_ORDER' | (string & {});
export type CohereCitationQuality = 'fast' | 'accurate' | 'off' | (string & {});

export interface CohereChatParams {
  message: string;
  model?: string;
  preamble?: string;
  chat_history?: CohereChatHistoryMessage[];
  conversation_id?: string;
  prompt_truncation?: CoherePromptTruncation;
  connectors?: CohereConnector[];
  documents?: CohereDocument[];
  citation_quality?: CohereCitationQuality;
  temperature?: number;
  max_tokens?: number;
  max_input_tokens?: number;
  k?: number;
  p?: number;
  seed?: number;
  stop_sequences?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  tools?: CohereTool[];
  tool_results?: CohereToolResult[];
  force_single_step?: boolean;
  response_format?: { type: 'text' | 'json_object' | (string & {}); schema?: unknown };
  safety_mode?: 'CONTEXTUAL' | 'STRICT' | 'NONE' | (string & {});
  search_queries_only?: boolean;
  stream?: boolean;
  [key: string]: unknown;
}

export type CohereChatFinishReason =
  | 'COMPLETE'
  | 'STOP_SEQUENCE'
  | 'ERROR'
  | 'ERROR_TOXIC'
  | 'ERROR_LIMIT'
  | 'USER_CANCEL'
  | 'MAX_TOKENS'
  | (string & {});

export interface CohereChatCitation {
  start: number;
  end: number;
  text: string;
  document_ids: string[];
}

export interface CohereChatResponse {
  text: string;
  generation_id?: string;
  response_id?: string;
  finish_reason?: CohereChatFinishReason;
  chat_history?: CohereChatHistoryMessage[];
  citations?: CohereChatCitation[];
  documents?: CohereDocument[];
  search_queries?: Array<{ text: string; generation_id?: string }>;
  search_results?: Array<Record<string, unknown>>;
  tool_calls?: Array<{ name: string; parameters: Record<string, unknown> }>;
  meta?: CohereMeta;
  [key: string]: unknown;
}

// ─── Chat (v2) ───────────────────────────────────────────────────────────────

export type CohereChatV2Role = 'user' | 'assistant' | 'system' | 'tool' | (string & {});

export interface CohereChatV2Message {
  role: CohereChatV2Role;
  content?: string | Array<Record<string, unknown>>;
  tool_calls?: Array<Record<string, unknown>>;
  tool_call_id?: string;
  [key: string]: unknown;
}

export interface CohereChatV2Params {
  model: string;
  messages: CohereChatV2Message[];
  tools?: Array<{
    type: 'function' | (string & {});
    function: { name: string; description?: string; parameters?: Record<string, unknown> };
  }>;
  documents?: CohereDocument[];
  citation_options?: { mode?: 'fast' | 'accurate' | 'off' | (string & {}) };
  response_format?: { type: 'text' | 'json_object' | (string & {}); schema?: unknown };
  safety_mode?: 'CONTEXTUAL' | 'STRICT' | 'NONE' | (string & {});
  max_tokens?: number;
  stop_sequences?: string[];
  temperature?: number;
  seed?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  k?: number;
  p?: number;
  stream?: boolean;
  [key: string]: unknown;
}

export interface CohereChatV2ResponseMessage {
  role: 'assistant' | (string & {});
  content?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  tool_plan?: string;
  tool_calls?: Array<{
    id?: string;
    type?: 'function' | (string & {});
    function?: { name: string; arguments: string };
  }>;
  citations?: Array<Record<string, unknown>>;
}

export interface CohereChatV2Response {
  id: string;
  message: CohereChatV2ResponseMessage;
  finish_reason?: CohereChatFinishReason;
  usage?: { tokens?: CohereTokenUsage; billed_units?: CohereTokenUsage };
  [key: string]: unknown;
}

// ─── Embed ───────────────────────────────────────────────────────────────────

export type CohereEmbedInputType =
  | 'search_document'
  | 'search_query'
  | 'classification'
  | 'clustering'
  | 'image'
  | (string & {});

export type CohereEmbeddingType = 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary' | (string & {});

export interface CohereEmbedParams {
  model: string;
  input_type: CohereEmbedInputType;
  texts?: string[];
  images?: string[];
  embedding_types?: CohereEmbeddingType[];
  truncate?: 'NONE' | 'START' | 'END' | (string & {});
  [key: string]: unknown;
}

export interface CohereEmbedResponse {
  id?: string;
  embeddings:
    | number[][]
    | {
        float?: number[][];
        int8?: number[][];
        uint8?: number[][];
        binary?: number[][];
        ubinary?: number[][];
        [key: string]: number[][] | undefined;
      };
  texts?: string[];
  images?: Array<Record<string, unknown>>;
  meta?: CohereMeta;
  response_type?: string;
  [key: string]: unknown;
}

// ─── Rerank ──────────────────────────────────────────────────────────────────

export interface CohereRerankParams {
  model: string;
  query: string;
  documents: Array<string | { text: string; [key: string]: unknown }>;
  top_n?: number;
  rank_fields?: string[];
  return_documents?: boolean;
  max_chunks_per_doc?: number;
  [key: string]: unknown;
}

export interface CohereRerankResult {
  index: number;
  relevance_score: number;
  document?: { text: string; [key: string]: unknown };
}

export interface CohereRerankResponse {
  id?: string;
  results: CohereRerankResult[];
  meta?: CohereMeta;
  [key: string]: unknown;
}

// ─── Classify ────────────────────────────────────────────────────────────────

export interface CohereClassifyExample {
  text: string;
  label: string;
}

export interface CohereClassifyParams {
  inputs: string[];
  model?: string;
  examples?: CohereClassifyExample[];
  preset?: string;
  truncate?: 'NONE' | 'START' | 'END' | (string & {});
  [key: string]: unknown;
}

export interface CohereClassifyClassification {
  id?: string;
  input?: string;
  prediction?: string;
  predictions?: string[];
  confidence?: number;
  confidences?: number[];
  labels?: Record<string, { confidence: number }>;
  classification_type?: string;
}

export interface CohereClassifyResponse {
  id?: string;
  classifications: CohereClassifyClassification[];
  meta?: CohereMeta;
  [key: string]: unknown;
}

// ─── Generate (legacy) ───────────────────────────────────────────────────────

export interface CohereGenerateParams {
  prompt: string;
  model?: string;
  num_generations?: number;
  max_tokens?: number;
  truncate?: 'NONE' | 'START' | 'END' | (string & {});
  temperature?: number;
  preset?: string;
  end_sequences?: string[];
  stop_sequences?: string[];
  k?: number;
  p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  return_likelihoods?: 'GENERATION' | 'ALL' | 'NONE' | (string & {});
  raw_prompting?: boolean;
  stream?: boolean;
  [key: string]: unknown;
}

export interface CohereGenerationResult {
  id: string;
  text: string;
  index?: number;
  finish_reason?: string;
  likelihood?: number;
  token_likelihoods?: Array<{ token: string; likelihood?: number }>;
}

export interface CohereGenerateResponse {
  id?: string;
  generations: CohereGenerationResult[];
  prompt?: string;
  meta?: CohereMeta;
  [key: string]: unknown;
}

// ─── Tokenize / Detokenize ───────────────────────────────────────────────────

export interface CohereTokenizeParams {
  text: string;
  model?: string;
  [key: string]: unknown;
}

export interface CohereTokenizeResponse {
  tokens: number[];
  token_strings: string[];
  meta?: CohereMeta;
  [key: string]: unknown;
}

export interface CohereDetokenizeParams {
  tokens: number[];
  model?: string;
  [key: string]: unknown;
}

export interface CohereDetokenizeResponse {
  text: string;
  meta?: CohereMeta;
  [key: string]: unknown;
}

// ─── Error body ──────────────────────────────────────────────────────────────

/**
 * Provider-native error body returned by Cohere when a request fails. The
 * proxy passes this shape through under `LiteLLMError.body` when routing to
 * Cohere.
 *
 * Reference: https://docs.cohere.com/reference/errors
 */
export interface CohereErrorBody {
  message: string;
  /** Optional Cohere-specific error code. */
  code?: string;
}
