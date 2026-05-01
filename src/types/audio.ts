import type { LiteLLMForwardingOverrides } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Audio (transcription / translation / TTS)
// ─────────────────────────────────────────────────────────────────────────────

/** OpenAI text-to-speech model identifier. */
export type SpeechModel =
  | 'tts-1'
  | 'tts-1-hd'
  | 'gpt-4o-mini-tts'
  | (string & {});

/** Built-in OpenAI TTS voices. */
export type SpeechVoice =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer'
  | 'ash'
  | 'sage'
  | 'coral'
  | 'verse'
  | 'fern'
  | (string & {});

/** Output audio container format for TTS. */
export type SpeechFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

/**
 * Parameters for synthesising speech from text.
 *
 * @see https://docs.litellm.ai/docs/text_to_speech
 */
export interface SpeechCreateParams extends LiteLLMForwardingOverrides {
  /** TTS model to use. */
  model: SpeechModel;
  /** Text to synthesize. */
  input: string;
  /** Voice to render the speech in. */
  voice: SpeechVoice;
  /** Output audio container format. */
  response_format?: SpeechFormat;
  /** Speaking-rate multiplier (e.g. `1.0` is normal). */
  speed?: number;
  /** End-user identifier forwarded to the provider for abuse detection. */
  user?: string;
}

// ─── Transcriptions ──────────────────────────────────────────────────────────

/**
 * Format of a transcription response.
 *
 * - `json`: Plain JSON with the transcript text.
 * - `text`: Raw text body.
 * - `srt`: SubRip subtitle file.
 * - `vtt`: WebVTT subtitle file.
 * - `verbose_json`: JSON with optional segment / word timestamps.
 */
export type TranscriptionResponseFormat =
  | 'json'
  | 'text'
  | 'srt'
  | 'vtt'
  | 'verbose_json';

/**
 * Parameters for transcribing audio to text in the source language.
 *
 * @see https://docs.litellm.ai/docs/audio_transcription
 */
export interface TranscriptionCreateParams extends LiteLLMForwardingOverrides {
  /** Audio file — Buffer / Uint8Array / Blob. */
  file: ArrayBuffer | Uint8Array | Blob;
  /** Filename to send to the server. */
  filename?: string;
  /** MIME type for the audio file. */
  contentType?: string;
  /** Transcription model to use. */
  model: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe' | (string & {});
  /** ISO-639-1 language code of the source audio (auto-detected if omitted). */
  language?: string;
  /** Optional text prompt to bias the transcription style or vocabulary. */
  prompt?: string;
  /** Format of the response body. */
  response_format?: TranscriptionResponseFormat;
  /** Sampling temperature for the transcription. */
  temperature?: number;
  /** Granularities to return when `response_format='verbose_json'`. */
  'timestamp_granularities[]'?: Array<'word' | 'segment'>;
  /** Optional list of fallback model names. */
  fallbacks?: string[];
  /** Force the proxy to exercise its fallback path (testing aid). */
  mock_testing_fallbacks?: boolean;
}

/**
 * A single word with its timestamp in a verbose transcription.
 *
 * @see https://docs.litellm.ai/docs/audio_transcription
 */
export interface TranscriptionWord {
  /** The word as transcribed. */
  word: string;
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
}
/**
 * A segment of audio in a verbose transcription.
 *
 * @see https://docs.litellm.ai/docs/audio_transcription
 */
export interface TranscriptionSegment {
  /** Sequential segment ID. */
  id: number;
  /** Seek offset in samples within the source file. */
  seek: number;
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
  /** Transcribed text for this segment. */
  text: string;
  /** Decoded token IDs for this segment. */
  tokens: number[];
  /** Sampling temperature used to decode this segment. */
  temperature: number;
  /** Average log-probability of the segment tokens. */
  avg_logprob: number;
  /** Compression ratio of the decoded text (proxy for hallucination detection). */
  compression_ratio: number;
  /** Probability the segment contains no speech. */
  no_speech_prob: number;
}

/**
 * Plain transcription response.
 *
 * @see https://docs.litellm.ai/docs/audio_transcription
 */
export interface Transcription {
  /** Full transcript text. */
  text: string;
}
/**
 * Verbose transcription response with timestamps.
 *
 * @see https://docs.litellm.ai/docs/audio_transcription
 */
export interface TranscriptionVerbose extends Transcription {
  /** Detected source language. */
  language?: string;
  /** Total duration of the audio in seconds. */
  duration?: number;
  /** Segment-level transcripts and timestamps. */
  segments?: TranscriptionSegment[];
  /** Word-level transcripts and timestamps. */
  words?: TranscriptionWord[];
}

