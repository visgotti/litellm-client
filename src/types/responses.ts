import type { Usage } from './common';
import type { ChatModel } from './models-enum';

// ─────────────────────────────────────────────────────────────────────────────
// Responses API (POST /v1/responses)
// ─────────────────────────────────────────────────────────────────────────────

export type ResponseRole = 'system' | 'user' | 'assistant' | 'developer' | 'tool';

export interface ResponseInputContentText {
  type: 'input_text';
  text: string;
}
export interface ResponseInputContentImage {
  type: 'input_image';
  image_url: string;
  detail?: 'auto' | 'low' | 'high';
}
export interface ResponseInputContentFile {
  type: 'input_file';
  file_id?: string;
  file_data?: string;
  filename?: string;
}
export type ResponseInputContent =
  | ResponseInputContentText
  | ResponseInputContentImage
  | ResponseInputContentFile;

export interface ResponseInputMessage {
  type?: 'message';
  role: ResponseRole;
  content: string | ResponseInputContent[];
}

/** Input can be a plain string, a list of messages, or a list of input items. */
export type ResponseInput =
  | string
  | Array<ResponseInputMessage | Record<string, unknown>>;

export interface ResponseToolFunction {
  type: 'function';
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
}
export interface ResponseToolFileSearch {
  type: 'file_search';
  vector_store_ids?: string[];
  max_num_results?: number;
}
export interface ResponseToolWebSearch {
  type: 'web_search_preview' | 'web_search';
  search_context_size?: 'low' | 'medium' | 'high';
  user_location?: Record<string, unknown>;
}
export interface ResponseToolImageGen {
  type: 'image_generation';
  size?: string;
  quality?: string;
  output_format?: string;
  background?: string;
}
export interface ResponseToolCodeInterpreter {
  type: 'code_interpreter';
  container?: string;
}
export type ResponseTool =
  | ResponseToolFunction
  | ResponseToolFileSearch
  | ResponseToolWebSearch
  | ResponseToolImageGen
  | ResponseToolCodeInterpreter
  | { type: string; [k: string]: unknown };

export interface ResponseCreateParamsBase {
  model: ChatModel;
  input: ResponseInput;
  background?: boolean;
  include?: string[];
  instructions?: string | null;
  max_output_tokens?: number | null;
  metadata?: Record<string, unknown> | null;
  parallel_tool_calls?: boolean;
  previous_response_id?: string | null;
  reasoning?: { effort?: 'low' | 'medium' | 'high' | 'minimal'; summary?: 'auto' | 'concise' | 'detailed' };
  service_tier?: 'auto' | 'default' | 'flex';
  store?: boolean;
  temperature?: number | null;
  text?: { format?: { type: 'text' | 'json_object' | 'json_schema' } & Record<string, unknown> };
  tool_choice?:
    | 'none'
    | 'auto'
    | 'required'
    | { type: 'function'; name: string }
    | { type: string };
  tools?: ResponseTool[];
  top_p?: number | null;
  truncation?: 'auto' | 'disabled';
  user?: string;
  tags?: string[];
}

export interface ResponseCreateParamsNonStreaming extends ResponseCreateParamsBase {
  stream?: false | null;
}
export interface ResponseCreateParamsStreaming extends ResponseCreateParamsBase {
  stream: true;
}
export type ResponseCreateParams =
  | ResponseCreateParamsNonStreaming
  | ResponseCreateParamsStreaming;

// ─── Output items ────────────────────────────────────────────────────────────

export interface OutputContentText {
  type: 'output_text';
  text: string;
  annotations?: unknown[];
}
export interface OutputContentRefusal {
  type: 'refusal';
  refusal: string;
}
export type OutputContent = OutputContentText | OutputContentRefusal;

export interface OutputMessage {
  type: 'message';
  id: string;
  status: 'in_progress' | 'completed' | 'incomplete' | (string & {});
  role: 'assistant';
  content: OutputContent[];
}

export interface OutputFunctionCall {
  type: 'function_call';
  id: string;
  call_id: string;
  name: string;
  arguments: string;
  status?: string;
}

export type OutputItem =
  | OutputMessage
  | OutputFunctionCall
  | { type: string; id?: string; [k: string]: unknown };

export interface ResponseUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_tokens_details?: { cached_tokens?: number; text_tokens?: number; image_tokens?: number };
  output_tokens_details?: { reasoning_tokens?: number };
}

export interface ResponseObject {
  id: string;
  object: 'response';
  created_at: number;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | (string & {});
  error: { code?: string; message?: string } | null;
  incomplete_details: { reason?: string } | null;
  instructions: string | null;
  max_output_tokens: number | null;
  model: string;
  output: OutputItem[];
  parallel_tool_calls?: boolean;
  previous_response_id?: string | null;
  reasoning?: Record<string, unknown> | null;
  store?: boolean;
  temperature?: number | null;
  text?: Record<string, unknown>;
  tool_choice?: unknown;
  tools?: ResponseTool[];
  top_p?: number | null;
  truncation?: string;
  usage?: ResponseUsage;
  user?: string | null;
  metadata?: Record<string, unknown> | null;
  /** Convenience field returned by SDKs (concatenated text). */
  output_text?: string;
  [key: string]: unknown;
}

/** Discriminated union approximation of streaming events. */
export interface ResponseStreamEvent {
  type: string;
  response?: ResponseObject;
  delta?: string;
  output_index?: number;
  item?: OutputItem;
  content_index?: number;
  /** All other fields. */
  [key: string]: unknown;
}

export interface ResponseDeleteResponse {
  id: string;
  object: 'response.deleted' | (string & {});
  deleted: boolean;
}

export interface ResponseListInputItemsParams {
  after?: string;
  before?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  include?: string[];
}

export interface ResponseInputItemsList {
  object: 'list';
  data: Array<Record<string, unknown>>;
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}

export interface ResponseCompactParams {
  response_id?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
export interface ResponseCompactResponse {
  id?: string;
  object?: string;
  [key: string]: unknown;
}

export type { Usage };
