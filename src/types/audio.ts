// ─────────────────────────────────────────────────────────────────────────────
// Audio (transcription / translation / TTS)
// ─────────────────────────────────────────────────────────────────────────────

export type SpeechModel =
  | 'tts-1'
  | 'tts-1-hd'
  | 'gpt-4o-mini-tts'
  | (string & {});

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

export type SpeechFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

export interface SpeechCreateParams {
  model: SpeechModel;
  input: string;
  voice: SpeechVoice;
  response_format?: SpeechFormat;
  speed?: number;
  user?: string;
}

// ─── Transcriptions ──────────────────────────────────────────────────────────

export type TranscriptionResponseFormat =
  | 'json'
  | 'text'
  | 'srt'
  | 'vtt'
  | 'verbose_json';

export interface TranscriptionCreateParams {
  /** Audio file – Buffer / Uint8Array / Blob. */
  file: ArrayBuffer | Uint8Array | Blob;
  filename?: string;
  contentType?: string;
  model: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe' | (string & {});
  language?: string;
  prompt?: string;
  response_format?: TranscriptionResponseFormat;
  temperature?: number;
  /** OpenAI verbose-json segment timestamps */
  'timestamp_granularities[]'?: Array<'word' | 'segment'>;
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}
export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface Transcription {
  text: string;
}
export interface TranscriptionVerbose extends Transcription {
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
  words?: TranscriptionWord[];
}

// ─── Translations (always English target) ────────────────────────────────────

export interface TranslationCreateParams {
  file: ArrayBuffer | Uint8Array | Blob;
  filename?: string;
  contentType?: string;
  model: 'whisper-1' | (string & {});
  prompt?: string;
  response_format?: TranscriptionResponseFormat;
  temperature?: number;
}
export interface Translation {
  text: string;
}
