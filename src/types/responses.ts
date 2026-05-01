import type { Usage, LiteLLMForwardingOverrides } from './common';
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

export interface ResponseCreateParamsBase extends LiteLLMForwardingOverrides {
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
  /**
   * Context-management policy controlling automatic compaction / clearing
   * of conversation history. Spec is sparse; left open with index sigs.
   */
  context_management?: {
    trigger?: { type?: string; [k: string]: unknown };
    clear?: Array<{ type?: string; [k: string]: unknown }>;
    [k: string]: unknown;
  };
  /**
   * When true, route the Responses request through the chat-completions
   * implementation under the hood (LiteLLM compatibility shim).
   */
  use_chat_completions_api?: boolean;
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

export interface OutputImageGenerationCall {
  type: 'image_generation_call';
  id?: string;
  status?: string;
  /** Final base64-encoded image, when available. */
  result?: string;
  /** Streaming partial-image previews (base64). */
  partial_images?: string[];
  [k: string]: unknown;
}

export type OutputItem =
  | OutputMessage
  | OutputFunctionCall
  | OutputImageGenerationCall
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

// ─── Streaming events ────────────────────────────────────────────────────────
// References:
//   https://platform.openai.com/docs/api-reference/responses-streaming
//   https://docs.litellm.ai/docs/response_api
//
// Each event carries a `type` discriminator (e.g. `response.output_text.delta`)
// and an optional `event_id` for client-side correlation. We expose both a
// strict `KnownResponseStreamEvent` union (exhaustive `switch` narrowing) and
// an open `ResponseStreamEvent` (= Known | Unknown) for forward-compat.

/** Common envelope fields present on every Responses streaming event. */
export interface ResponseStreamEventCommon {
  /** Server-generated identifier echoed for client-side correlation. */
  event_id?: string;
  /** Discriminator. Each concrete event narrows this to a string literal. */
  type: string;
}

/** A streamed content part inside an output item. Mirrors `OutputContent`. */
export type ResponseContentPart =
  | OutputContentText
  | OutputContentRefusal
  | { type: string; [key: string]: unknown };

/** Top-level lifecycle: initial response object emitted on stream open. */
export interface ResponseCreatedEvent extends ResponseStreamEventCommon {
  type: 'response.created';
  response: ResponseObject;
}

/** Top-level lifecycle: response is actively running. */
export interface ResponseInProgressEvent extends ResponseStreamEventCommon {
  type: 'response.in_progress';
  response: ResponseObject;
}

/** Top-level lifecycle: response finished successfully. */
export interface ResponseCompletedEvent extends ResponseStreamEventCommon {
  type: 'response.completed';
  response: ResponseObject;
}

/** Top-level lifecycle: response failed. */
export interface ResponseFailedEvent extends ResponseStreamEventCommon {
  type: 'response.failed';
  response: ResponseObject;
}

/** Top-level lifecycle: response stopped early (token cap, content filter, etc). */
export interface ResponseIncompleteEvent extends ResponseStreamEventCommon {
  type: 'response.incomplete';
  response: ResponseObject;
}

/** A new top-level output item was added. */
export interface ResponseOutputItemAddedEvent extends ResponseStreamEventCommon {
  type: 'response.output_item.added';
  output_index: number;
  item: OutputItem;
}

/** A top-level output item finished streaming. */
export interface ResponseOutputItemDoneEvent extends ResponseStreamEventCommon {
  type: 'response.output_item.done';
  output_index: number;
  item: OutputItem;
}

/** A new content part started inside an output item. */
export interface ResponseContentPartAddedEvent extends ResponseStreamEventCommon {
  type: 'response.content_part.added';
  output_index: number;
  content_index: number;
  /** Optional item id of the parent output item, when the server includes it. */
  item_id?: string;
  part: ResponseContentPart;
}

/** A content part finished streaming. */
export interface ResponseContentPartDoneEvent extends ResponseStreamEventCommon {
  type: 'response.content_part.done';
  output_index: number;
  content_index: number;
  item_id?: string;
  part: ResponseContentPart;
}

/** Incremental text delta for an `output_text` content part. */
export interface ResponseOutputTextDeltaEvent extends ResponseStreamEventCommon {
  type: 'response.output_text.delta';
  output_index: number;
  content_index: number;
  item_id?: string;
  delta: string;
}

/** Final text for an `output_text` content part. */
export interface ResponseOutputTextDoneEvent extends ResponseStreamEventCommon {
  type: 'response.output_text.done';
  output_index: number;
  content_index: number;
  item_id?: string;
  text: string;
}

/** Incremental refusal-text delta. */
export interface ResponseRefusalDeltaEvent extends ResponseStreamEventCommon {
  type: 'response.refusal.delta';
  output_index: number;
  content_index: number;
  item_id?: string;
  delta: string;
}

/** Final refusal text. */
export interface ResponseRefusalDoneEvent extends ResponseStreamEventCommon {
  type: 'response.refusal.done';
  output_index: number;
  content_index: number;
  item_id?: string;
  refusal: string;
}

/** Incremental delta of a function call's argument JSON string. */
export interface ResponseFunctionCallArgumentsDeltaEvent extends ResponseStreamEventCommon {
  type: 'response.function_call_arguments.delta';
  output_index: number;
  item_id?: string;
  delta: string;
}

/** Function call's full argument JSON string is finalised. */
export interface ResponseFunctionCallArgumentsDoneEvent extends ResponseStreamEventCommon {
  type: 'response.function_call_arguments.done';
  output_index: number;
  item_id?: string;
  arguments: string;
}

/** File-search tool: the call has been initialised. */
export interface ResponseFileSearchCallInProgressEvent extends ResponseStreamEventCommon {
  type: 'response.file_search_call.in_progress';
  output_index: number;
  item_id?: string;
}

/** File-search tool: the search query is running upstream. */
export interface ResponseFileSearchCallSearchingEvent extends ResponseStreamEventCommon {
  type: 'response.file_search_call.searching';
  output_index: number;
  item_id?: string;
}

/** File-search tool: results are ready. */
export interface ResponseFileSearchCallCompletedEvent extends ResponseStreamEventCommon {
  type: 'response.file_search_call.completed';
  output_index: number;
  item_id?: string;
}

/** Web-search tool: the call has been initialised. */
export interface ResponseWebSearchCallInProgressEvent extends ResponseStreamEventCommon {
  type: 'response.web_search_call.in_progress';
  output_index: number;
  item_id?: string;
}

/** Web-search tool: the search query is running upstream. */
export interface ResponseWebSearchCallSearchingEvent extends ResponseStreamEventCommon {
  type: 'response.web_search_call.searching';
  output_index: number;
  item_id?: string;
}

/** Web-search tool: results are ready. */
export interface ResponseWebSearchCallCompletedEvent extends ResponseStreamEventCommon {
  type: 'response.web_search_call.completed';
  output_index: number;
  item_id?: string;
}

/** Image-generation tool: a partial preview image is available (base64). */
export interface ResponseImageGenerationCallPartialImageEvent extends ResponseStreamEventCommon {
  type: 'response.image_generation_call.partial_image';
  output_index: number;
  item_id?: string;
  /** Base64-encoded preview image bytes. */
  partial_image_b64?: string;
  /** 0-based index of the preview frame in the partial sequence. */
  partial_image_index?: number;
}

/** Image-generation tool: final image is available. */
export interface ResponseImageGenerationCallCompletedEvent extends ResponseStreamEventCommon {
  type: 'response.image_generation_call.completed';
  output_index: number;
  item_id?: string;
}

/** Incremental binary audio delta from the model (base64). */
export interface ResponseAudioDeltaEvent extends ResponseStreamEventCommon {
  type: 'response.audio.delta';
  output_index?: number;
  content_index?: number;
  item_id?: string;
  /** Base64-encoded audio bytes. */
  delta: string;
}

/** Audio streaming finished. */
export interface ResponseAudioDoneEvent extends ResponseStreamEventCommon {
  type: 'response.audio.done';
  output_index?: number;
  content_index?: number;
  item_id?: string;
}

/** Incremental audio-transcript delta. */
export interface ResponseAudioTranscriptDeltaEvent extends ResponseStreamEventCommon {
  type: 'response.audio_transcript.delta';
  output_index?: number;
  content_index?: number;
  item_id?: string;
  delta: string;
}

/** Final audio transcript. */
export interface ResponseAudioTranscriptDoneEvent extends ResponseStreamEventCommon {
  type: 'response.audio_transcript.done';
  output_index?: number;
  content_index?: number;
  item_id?: string;
  transcript: string;
}

/** Top-level error event (e.g. provider failure surfaced mid-stream). */
export interface ResponseErrorEvent extends ResponseStreamEventCommon {
  type: 'response.error';
  error: { message: string; type?: string; code?: string };
}

/**
 * Strict discriminated union of *known* Responses streaming events. Use
 * this when you want exhaustive `switch` narrowing on `event.type`.
 */
export type KnownResponseStreamEvent =
  | ResponseCreatedEvent
  | ResponseInProgressEvent
  | ResponseCompletedEvent
  | ResponseFailedEvent
  | ResponseIncompleteEvent
  | ResponseOutputItemAddedEvent
  | ResponseOutputItemDoneEvent
  | ResponseContentPartAddedEvent
  | ResponseContentPartDoneEvent
  | ResponseOutputTextDeltaEvent
  | ResponseOutputTextDoneEvent
  | ResponseRefusalDeltaEvent
  | ResponseRefusalDoneEvent
  | ResponseFunctionCallArgumentsDeltaEvent
  | ResponseFunctionCallArgumentsDoneEvent
  | ResponseFileSearchCallInProgressEvent
  | ResponseFileSearchCallSearchingEvent
  | ResponseFileSearchCallCompletedEvent
  | ResponseWebSearchCallInProgressEvent
  | ResponseWebSearchCallSearchingEvent
  | ResponseWebSearchCallCompletedEvent
  | ResponseImageGenerationCallPartialImageEvent
  | ResponseImageGenerationCallCompletedEvent
  | ResponseAudioDeltaEvent
  | ResponseAudioDoneEvent
  | ResponseAudioTranscriptDeltaEvent
  | ResponseAudioTranscriptDoneEvent
  | ResponseErrorEvent;

/**
 * Forward-compat fallback for unmodelled streaming event types. The
 * `string & {}` discriminator preserves IntelliSense on the modelled
 * literals while still accepting any future value at runtime.
 */
export interface UnknownResponseStreamEvent {
  type: string & {};
  event_id?: string;
  [key: string]: unknown;
}

/**
 * Open discriminated union of Responses streaming events. Includes a
 * forward-compat fallback so payloads carrying new `type` literals do not
 * require casts. For exhaustive narrowing on the modelled literals (e.g.
 * inside a `switch`), narrow to `KnownResponseStreamEvent` first.
 */
export type ResponseStreamEvent = KnownResponseStreamEvent | UnknownResponseStreamEvent;

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
  /** Existing response to compact (chains with `previous_response_id`). */
  response_id?: string;
  /** Model used to drive the compaction summary. */
  model?: string;
  /** New input appended to the compacted history. */
  input?: string | unknown[];
  /** Optional system instructions for the compaction step. */
  instructions?: string;
  /** Previous response in the chain. */
  previous_response_id?: string;
  /** Free-form additional fields (forwarding overrides, tool config, etc.). */
  [key: string]: unknown;
}

export interface ResponseCompactResponse {
  id?: string;
  /** Always `"response.compaction"` per docs. */
  object?: 'response.compaction' | string;
  created_at?: number;
  output?: OutputItem[];
  usage?: Usage;
  [key: string]: unknown;
}

/**
 * Query parameters for `GET /v1/responses` (alias `/responses`).
 *
 * Mirrors OpenAI's standard pagination knobs. Loose-shaped to allow proxy
 * extensions.
 */
export interface ResponseListParams {
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc' | (string & {});
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `GET /v1/responses`. */
export interface ResponseListResponse {
  object?: 'list' | (string & {});
  data?: ResponseObject[];
  has_more?: boolean;
  first_id?: string | null;
  last_id?: string | null;
  [key: string]: unknown;
}

export type { Usage };
