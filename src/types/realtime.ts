// ─────────────────────────────────────────────────────────────────────────────
// Realtime API (WebRTC) — /v1/realtime/client_secrets, /v1/realtime/calls
// Mirrors litellm.types.realtime
// ─────────────────────────────────────────────────────────────────────────────

/** Expiration config for a realtime client secret. */
export interface RealtimeExpiresAfter {
  anchor?: 'created_at' | (string & {});
  seconds?: number;
}

/**
 * Session configuration nested inside the client_secrets request body.
 * Mirrors OpenAI's RealtimeSessionCreateRequest (type=realtime) and
 * RealtimeTranscriptionSessionCreateRequest (type=transcription).
 * Unknown extra fields are passed through.
 */
export interface RealtimeSessionConfig {
  type?: 'realtime' | 'transcription' | (string & {});
  model?: import('./models-enum').OpenAIModel | (string & {});
  instructions?: string;
  audio?: Record<string, unknown>;
  include?: string[];
  max_output_tokens?: number | string;
  output_modalities?: string[];
  tool_choice?: unknown;
  tools?: Array<Record<string, unknown>>;
  tracing?: unknown;
  truncation?: unknown;
  prompt?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RealtimeClientSecretCreateParams {
  expires_after?: RealtimeExpiresAfter;
  session?: RealtimeSessionConfig;
  /** LiteLLM-only routing hint — stripped before forwarding upstream. */
  model?: import('./models-enum').OpenAIModel | (string & {});
  [key: string]: unknown;
}

export interface RealtimeClientSecretResponse {
  /** Unix-seconds expiration of the issued ephemeral secret. */
  expires_at?: number | null;
  /**
   * Encrypted ephemeral key. Use as the Bearer token for
   * POST /v1/realtime/calls (and the WebRTC SDP exchange).
   */
  value: string;
  /** Echo of the (encrypted) session payload — passed through as a raw dict. */
  session?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/**
 * Body for POST /v1/realtime/calls. Per the OpenAI WebRTC spec the body is
 * the raw SDP offer (text/plain). Optional `model` query param is also
 * supported for backwards compatibility.
 */
export interface RealtimeCallCreateParams {
  /** SDP offer string. */
  sdp: string;
  /** Optional explicit model override (legacy compatibility). */
  model?: import('./models-enum').OpenAIModel | (string & {});
}

/**
 * Response body for POST /v1/realtime/calls. The proxy returns the upstream
 * SDP answer (application/sdp) along with a Location header containing the
 * call ID; we normalise it into a small object for the SDK.
 */
export interface RealtimeCallCreateResponse {
  /** SDP answer returned by the upstream realtime endpoint. */
  sdp: string;
  /** Call ID extracted from the Location header (if present). */
  call_id?: string | null;
}

/**
 * Response body for `GET /v1/realtime` (alias `/realtime`). The proxy returns
 * the active realtime sessions / calls registered against the calling key.
 *
 * Loose-shaped because the proxy may add additional fields over time.
 */
export interface RealtimeListResponse {
  /** Records returned in `data`-style envelopes. */
  data?: Array<Record<string, unknown>>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Realtime event protocol (WebSocket / WebRTC data channel)
//
// The LiteLLM proxy forwards Realtime events between the client and the
// upstream provider (OpenAI / Azure / xAI) unchanged. The shapes below mirror
// the OpenAI Realtime API event protocol described at
// https://platform.openai.com/docs/api-reference/realtime and surfaced through
// LiteLLM at https://docs.litellm.ai/docs/realtime and
// https://docs.litellm.ai/docs/proxy/realtime_webrtc.
//
// These types are pure compile-time aids for consumer code that owns the
// WebSocket / RTCDataChannel — the SDK itself only handles the HTTP setup
// (`createClientSecret`, `createCall`).
//
// All events share a `type` discriminator and an optional `event_id` echoed
// by the server on related responses. Each top-level union ends in a generic
// fallback variant so unknown future event types do not require casts.
// ─────────────────────────────────────────────────────────────────────────────

/** Common fields shared by every Realtime event in either direction. */
export interface RealtimeEventCommon {
  /**
   * Optional client-supplied identifier echoed by the server on the matching
   * response event(s). Server-emitted events also populate this with a
   * server-generated id.
   */
  event_id?: string;
  /** Discriminator. Each concrete event narrows this to a string literal. */
  type: string;
}

// ── Supporting payload shapes ────────────────────────────────────────────────

/** A single audio-format string (e.g. `"pcm16"`, `"g711_ulaw"`, `"g711_alaw"`). */
export type RealtimeAudioFormat = 'pcm16' | 'g711_ulaw' | 'g711_alaw' | (string & {});

/** Modality enum used by `session` and `response` payloads. */
export type RealtimeModality = 'text' | 'audio' | (string & {});

/** Voice option for output audio. Open string union — providers add new voices regularly. */
export type RealtimeVoice =
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'coral'
  | 'echo'
  | 'sage'
  | 'shimmer'
  | 'verse'
  | (string & {});

/** Server-side voice-activity detection / turn-detection config. */
export interface RealtimeTurnDetection {
  type?: 'server_vad' | 'semantic_vad' | 'none' | (string & {});
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
  create_response?: boolean;
  interrupt_response?: boolean;
  [key: string]: unknown;
}

/** Optional automatic transcription config for input audio. */
export interface RealtimeInputAudioTranscription {
  model?: string;
  language?: string;
  prompt?: string;
  [key: string]: unknown;
}

/**
 * A function tool exposed to the realtime model. Mirrors the OpenAI tool
 * definition shape. Open-ended to allow other tool variants the docs surface
 * (e.g. `mcp`, `file_search`).
 */
export interface RealtimeTool {
  type: 'function' | (string & {});
  name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Tool-choice for a session or response. Either a preset string or an
 * object specifying a particular tool by name.
 */
export type RealtimeToolChoice =
  | 'auto'
  | 'none'
  | 'required'
  | { type: 'function'; name: string }
  | (string & {})
  | Record<string, unknown>;

/**
 * Full session config sent on `session.update` and echoed on `session.created`
 * / `session.updated`. All fields are optional — `session.update` is a partial
 * patch.
 */
export interface RealtimeSession {
  modalities?: RealtimeModality[];
  instructions?: string;
  voice?: RealtimeVoice;
  input_audio_format?: RealtimeAudioFormat;
  output_audio_format?: RealtimeAudioFormat;
  input_audio_transcription?: RealtimeInputAudioTranscription | null;
  turn_detection?: RealtimeTurnDetection | null;
  tools?: RealtimeTool[];
  tool_choice?: RealtimeToolChoice;
  temperature?: number;
  /** `number` of tokens, `"inf"` for unbounded. */
  max_response_output_tokens?: number | 'inf' | (string & {});
  /** Provider-specific or future fields are passed through. */
  [key: string]: unknown;
}

/** A single content part within a `message` conversation item. */
export interface RealtimeContent {
  type: 'input_text' | 'input_audio' | 'text' | 'audio' | (string & {});
  /** Text content for `input_text` / `text` parts. */
  text?: string;
  /** Base64-encoded audio for `input_audio` / `audio` parts. */
  audio?: string;
  /** Transcript of an `input_audio` / `audio` part, when available. */
  transcript?: string;
  [key: string]: unknown;
}

/**
 * A conversation item. The `type` discriminator selects which fields apply,
 * but the shape is kept loose because LiteLLM passes the upstream payload
 * through verbatim and providers add new item subtypes over time.
 */
export interface RealtimeConversationItem {
  id?: string;
  type?: 'message' | 'function_call' | 'function_call_output' | (string & {});
  status?: 'completed' | 'in_progress' | 'incomplete' | (string & {});
  /** Only set when `type === 'message'`. */
  role?: 'system' | 'user' | 'assistant' | (string & {});
  /** Only set when `type === 'message'`. */
  content?: RealtimeContent[];
  /** `function_call` fields. */
  call_id?: string;
  name?: string;
  arguments?: string;
  /** `function_call_output` field. */
  output?: string;
  [key: string]: unknown;
}

/** Token-usage breakdown attached to a completed response. */
export interface RealtimeResponseUsage {
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  input_token_details?: Record<string, unknown>;
  output_token_details?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Response object emitted on `response.created` / `response.done` and used as
 * the body of the client-side `response.create` event.
 */
export interface RealtimeResponse {
  id?: string;
  object?: 'realtime.response' | (string & {});
  status?:
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'failed'
    | 'incomplete'
    | (string & {});
  status_details?: Record<string, unknown> | null;
  output?: RealtimeConversationItem[];
  usage?: RealtimeResponseUsage | null;
  modalities?: RealtimeModality[];
  instructions?: string;
  voice?: RealtimeVoice;
  output_audio_format?: RealtimeAudioFormat;
  tools?: RealtimeTool[];
  tool_choice?: RealtimeToolChoice;
  temperature?: number;
  max_output_tokens?: number | 'inf' | (string & {});
  conversation?: 'auto' | 'none' | (string & {});
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Per-window rate-limit slice surfaced via `rate_limits.updated`. */
export interface RealtimeRateLimit {
  name?: 'requests' | 'tokens' | (string & {});
  limit?: number;
  remaining?: number;
  reset_seconds?: number;
  [key: string]: unknown;
}

/**
 * Realtime error payload. Emitted as the `error` field on the top-level
 * `error` event and on guardrail / validation failures.
 */
export interface RealtimeError {
  type?: string;
  code?: string | null;
  message?: string;
  param?: string | null;
  /** ID of the client event that triggered this error, if any. */
  event_id?: string | null;
  [key: string]: unknown;
}

// ── Client → server events ───────────────────────────────────────────────────

/** Update one or more fields of the active session config. */
export interface RealtimeSessionUpdateEvent extends RealtimeEventCommon {
  type: 'session.update';
  session: RealtimeSession;
}

/** Append a chunk of base64-encoded audio to the input audio buffer. */
export interface RealtimeInputAudioBufferAppendEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.append';
  /** Base64-encoded audio bytes in the session's `input_audio_format`. */
  audio: string;
}

/** Commit the current input audio buffer as a user message item. */
export interface RealtimeInputAudioBufferCommitEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.commit';
}

/** Discard the current input audio buffer without committing. */
export interface RealtimeInputAudioBufferClearEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.clear';
}

/** Insert a new conversation item (message, function_call, or function_call_output). */
export interface RealtimeConversationItemCreateEvent extends RealtimeEventCommon {
  type: 'conversation.item.create';
  /** ID of the item this new item should follow, or `null` to append. */
  previous_item_id?: string | null;
  item: RealtimeConversationItem;
}

/** Truncate the audio of an assistant message at the given sample offset. */
export interface RealtimeConversationItemTruncateEvent extends RealtimeEventCommon {
  type: 'conversation.item.truncate';
  item_id: string;
  content_index: number;
  audio_end_ms: number;
}

/** Remove an item from the conversation. */
export interface RealtimeConversationItemDeleteEvent extends RealtimeEventCommon {
  type: 'conversation.item.delete';
  item_id: string;
}

/**
 * Trigger the model to generate a response. The optional `response` object
 * overrides session defaults for this turn only.
 */
export interface RealtimeResponseCreateEvent extends RealtimeEventCommon {
  type: 'response.create';
  response?: RealtimeResponse;
}

/** Cancel the in-flight response, if any. */
export interface RealtimeResponseCancelEvent extends RealtimeEventCommon {
  type: 'response.cancel';
  /** Specific response ID to cancel. Defaults to the active one. */
  response_id?: string;
}

/**
 * Forward-compat fallback for client-to-server event types not yet modelled.
 * Keeps the discriminated union open so consumers do not need to cast for
 * unknown future events. The `string & {}` discriminator preserves
 * IntelliSense on the modelled literals while still accepting any future
 * value at runtime; arbitrary fields are surfaced as `unknown` via the
 * index signature.
 */
export interface RealtimeUnknownClientEvent {
  type: string & {};
  event_id?: string;
  [key: string]: unknown;
}

/**
 * Strict discriminated union of *known* client-to-server Realtime events.
 * Use this when you want exhaustive `switch` narrowing on `event.type`.
 */
export type RealtimeKnownClientEvent =
  | RealtimeSessionUpdateEvent
  | RealtimeInputAudioBufferAppendEvent
  | RealtimeInputAudioBufferCommitEvent
  | RealtimeInputAudioBufferClearEvent
  | RealtimeConversationItemCreateEvent
  | RealtimeConversationItemTruncateEvent
  | RealtimeConversationItemDeleteEvent
  | RealtimeResponseCreateEvent
  | RealtimeResponseCancelEvent;

/**
 * Open discriminated union of client-to-server Realtime events. Includes a
 * forward-compat fallback so payloads carrying new `type` literals do not
 * require casts. For exhaustive narrowing on the modelled literals (e.g.
 * inside a `switch`), narrow to `RealtimeKnownClientEvent` first via the
 * `isKnownRealtimeClientEvent`-style guard you control, or check
 * `event.type` against the known literal set.
 */
export type RealtimeClientEvent = RealtimeKnownClientEvent | RealtimeUnknownClientEvent;

// ── Server → client events ───────────────────────────────────────────────────

/** Sent immediately after the WebSocket / data channel opens. */
export interface RealtimeSessionCreatedEvent extends RealtimeEventCommon {
  type: 'session.created';
  session: RealtimeSession & { id?: string; object?: string };
}

/** Acknowledgement of a `session.update` with the merged config. */
export interface RealtimeSessionUpdatedEvent extends RealtimeEventCommon {
  type: 'session.updated';
  session: RealtimeSession & { id?: string; object?: string };
}

/** Initial conversation object created for the session. */
export interface RealtimeConversationCreatedEvent extends RealtimeEventCommon {
  type: 'conversation.created';
  conversation: { id?: string; object?: string; [key: string]: unknown };
}

/** A new conversation item has been added (by the client or the model). */
export interface RealtimeConversationItemCreatedEvent extends RealtimeEventCommon {
  type: 'conversation.item.created';
  previous_item_id?: string | null;
  item: RealtimeConversationItem;
}

/** Whisper-style transcription of a user audio item completed successfully. */
export interface RealtimeConversationItemInputAudioTranscriptionCompletedEvent
  extends RealtimeEventCommon {
  type: 'conversation.item.input_audio_transcription.completed';
  item_id: string;
  content_index: number;
  transcript: string;
}

/** Transcription of a user audio item failed. */
export interface RealtimeConversationItemInputAudioTranscriptionFailedEvent
  extends RealtimeEventCommon {
  type: 'conversation.item.input_audio_transcription.failed';
  item_id: string;
  content_index: number;
  error: RealtimeError;
}

/** Confirmation that an assistant audio item has been truncated. */
export interface RealtimeConversationItemTruncatedEvent extends RealtimeEventCommon {
  type: 'conversation.item.truncated';
  item_id: string;
  content_index: number;
  audio_end_ms: number;
}

/** Confirmation that a conversation item has been deleted. */
export interface RealtimeConversationItemDeletedEvent extends RealtimeEventCommon {
  type: 'conversation.item.deleted';
  item_id: string;
}

/** The input audio buffer was committed and a user message item created. */
export interface RealtimeInputAudioBufferCommittedEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.committed';
  previous_item_id?: string | null;
  item_id: string;
}

/** The input audio buffer was cleared. */
export interface RealtimeInputAudioBufferClearedEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.cleared';
}

/** Server VAD detected the start of user speech. */
export interface RealtimeInputAudioBufferSpeechStartedEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.speech_started';
  audio_start_ms: number;
  item_id: string;
}

/** Server VAD detected the end of user speech. */
export interface RealtimeInputAudioBufferSpeechStoppedEvent extends RealtimeEventCommon {
  type: 'input_audio_buffer.speech_stopped';
  audio_end_ms: number;
  item_id: string;
}

/** A new response generation started. */
export interface RealtimeResponseCreatedEvent extends RealtimeEventCommon {
  type: 'response.created';
  response: RealtimeResponse;
}

/** A response generation finished (terminal state — completed/cancelled/failed). */
export interface RealtimeResponseDoneEvent extends RealtimeEventCommon {
  type: 'response.done';
  response: RealtimeResponse;
}

/** A new output item was added to the response. */
export interface RealtimeResponseOutputItemAddedEvent extends RealtimeEventCommon {
  type: 'response.output_item.added';
  response_id: string;
  output_index: number;
  item: RealtimeConversationItem;
}

/** An output item finished streaming. */
export interface RealtimeResponseOutputItemDoneEvent extends RealtimeEventCommon {
  type: 'response.output_item.done';
  response_id: string;
  output_index: number;
  item: RealtimeConversationItem;
}

/** A new content part started inside an output item. */
export interface RealtimeResponseContentPartAddedEvent extends RealtimeEventCommon {
  type: 'response.content_part.added';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  part: RealtimeContent;
}

/** A content part finished streaming. */
export interface RealtimeResponseContentPartDoneEvent extends RealtimeEventCommon {
  type: 'response.content_part.done';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  part: RealtimeContent;
}

/** Incremental text delta for a response content part. */
export interface RealtimeResponseTextDeltaEvent extends RealtimeEventCommon {
  type: 'response.text.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/** Final text for a response content part. */
export interface RealtimeResponseTextDoneEvent extends RealtimeEventCommon {
  type: 'response.text.done';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  text: string;
}

/** Incremental audio-transcript delta from the model. */
export interface RealtimeResponseAudioTranscriptDeltaEvent extends RealtimeEventCommon {
  type: 'response.audio_transcript.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/** Final audio transcript for a response content part. */
export interface RealtimeResponseAudioTranscriptDoneEvent extends RealtimeEventCommon {
  type: 'response.audio_transcript.done';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  transcript: string;
}

/** Incremental audio bytes (base64) from the model. */
export interface RealtimeResponseAudioDeltaEvent extends RealtimeEventCommon {
  type: 'response.audio.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  /** Base64-encoded audio bytes in the session's `output_audio_format`. */
  delta: string;
}

/** Audio streaming finished for a response content part. */
export interface RealtimeResponseAudioDoneEvent extends RealtimeEventCommon {
  type: 'response.audio.done';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}

/** Incremental delta of a function call's argument JSON string. */
export interface RealtimeResponseFunctionCallArgumentsDeltaEvent extends RealtimeEventCommon {
  type: 'response.function_call_arguments.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  delta: string;
}

/** Function call's full argument JSON string is finalised. */
export interface RealtimeResponseFunctionCallArgumentsDoneEvent extends RealtimeEventCommon {
  type: 'response.function_call_arguments.done';
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  arguments: string;
}

/** Periodic update of remaining quota for the active key. */
export interface RealtimeRateLimitsUpdatedEvent extends RealtimeEventCommon {
  type: 'rate_limits.updated';
  rate_limits: RealtimeRateLimit[];
}

/**
 * Top-level error event. Wraps a `RealtimeError`. Per LiteLLM docs, guardrail
 * blocks are surfaced as `{ type: 'error', error: { type: 'guardrail_error', message } }`.
 */
export interface RealtimeErrorEvent extends RealtimeEventCommon {
  type: 'error';
  error: RealtimeError;
}

/**
 * Forward-compat fallback for server-to-client event types not yet modelled.
 * Keeps the discriminated union open so consumers do not need to cast for
 * unknown future events. Arbitrary fields are surfaced as `unknown` via the
 * index signature.
 */
export interface RealtimeUnknownServerEvent {
  type: string & {};
  event_id?: string;
  [key: string]: unknown;
}

/**
 * Strict discriminated union of *known* server-to-client Realtime events.
 * Use this when you want exhaustive `switch` narrowing on `event.type`.
 */
export type RealtimeKnownServerEvent =
  | RealtimeSessionCreatedEvent
  | RealtimeSessionUpdatedEvent
  | RealtimeConversationCreatedEvent
  | RealtimeConversationItemCreatedEvent
  | RealtimeConversationItemInputAudioTranscriptionCompletedEvent
  | RealtimeConversationItemInputAudioTranscriptionFailedEvent
  | RealtimeConversationItemTruncatedEvent
  | RealtimeConversationItemDeletedEvent
  | RealtimeInputAudioBufferCommittedEvent
  | RealtimeInputAudioBufferClearedEvent
  | RealtimeInputAudioBufferSpeechStartedEvent
  | RealtimeInputAudioBufferSpeechStoppedEvent
  | RealtimeResponseCreatedEvent
  | RealtimeResponseDoneEvent
  | RealtimeResponseOutputItemAddedEvent
  | RealtimeResponseOutputItemDoneEvent
  | RealtimeResponseContentPartAddedEvent
  | RealtimeResponseContentPartDoneEvent
  | RealtimeResponseTextDeltaEvent
  | RealtimeResponseTextDoneEvent
  | RealtimeResponseAudioTranscriptDeltaEvent
  | RealtimeResponseAudioTranscriptDoneEvent
  | RealtimeResponseAudioDeltaEvent
  | RealtimeResponseAudioDoneEvent
  | RealtimeResponseFunctionCallArgumentsDeltaEvent
  | RealtimeResponseFunctionCallArgumentsDoneEvent
  | RealtimeRateLimitsUpdatedEvent
  | RealtimeErrorEvent;

/**
 * Open discriminated union of server-to-client Realtime events. Includes a
 * forward-compat fallback so unknown future event types can flow through
 * without casts. For exhaustive narrowing on the modelled literals (e.g.
 * inside a `switch`), narrow to `RealtimeKnownServerEvent` first.
 */
export type RealtimeServerEvent = RealtimeKnownServerEvent | RealtimeUnknownServerEvent;

/** Catch-all union of every Realtime event in either direction. */
export type RealtimeEvent = RealtimeClientEvent | RealtimeServerEvent;
