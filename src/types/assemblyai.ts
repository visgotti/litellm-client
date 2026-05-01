// ─────────────────────────────────────────────────────────────────────────────
// AssemblyAI pass-through types.
// References:
//   https://www.assemblyai.com/docs/api-reference
// ─────────────────────────────────────────────────────────────────────────────

// ─── Transcripts ─────────────────────────────────────────────────────────────

export type AssemblyAITranscriptStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'error'
  | (string & {});

export type AssemblyAILanguageCode = string;

export type AssemblyAISpeechModel = 'best' | 'nano' | (string & {});

export interface AssemblyAIWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string | null;
}

export interface AssemblyAIUtterance {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: string;
  words?: AssemblyAIWord[];
  channel?: string;
}

export interface AssemblyAIChapter {
  summary: string;
  headline: string;
  gist: string;
  start: number;
  end: number;
}

export interface AssemblyAIEntity {
  entity_type: string;
  text: string;
  start: number;
  end: number;
}

export interface AssemblyAITranscriptCreateParams {
  audio_url: string;
  speech_model?: AssemblyAISpeechModel;
  language_code?: AssemblyAILanguageCode;
  language_detection?: boolean;
  language_confidence_threshold?: number;
  punctuate?: boolean;
  format_text?: boolean;
  dual_channel?: boolean;
  multichannel?: boolean;
  webhook_url?: string;
  webhook_auth_header_name?: string;
  webhook_auth_header_value?: string;
  auto_chapters?: boolean;
  auto_highlights?: boolean;
  content_safety?: boolean;
  content_safety_confidence?: number;
  iab_categories?: boolean;
  custom_spelling?: Array<{ from: string[]; to: string }>;
  disfluencies?: boolean;
  entity_detection?: boolean;
  filter_profanity?: boolean;
  redact_pii?: boolean;
  redact_pii_audio?: boolean;
  redact_pii_audio_quality?: 'mp3' | 'wav' | (string & {});
  redact_pii_policies?: string[];
  redact_pii_sub?: string;
  sentiment_analysis?: boolean;
  speaker_labels?: boolean;
  speakers_expected?: number;
  speech_threshold?: number;
  summarization?: boolean;
  summary_model?: 'informative' | 'conversational' | 'catchy' | (string & {});
  summary_type?: 'bullets' | 'bullets_verbose' | 'gist' | 'headline' | 'paragraph' | (string & {});
  topics?: string[];
  word_boost?: string[];
  boost_param?: 'low' | 'default' | 'high' | (string & {});
  audio_start_from?: number;
  audio_end_at?: number;
  custom_topics?: boolean;
  [key: string]: unknown;
}

export interface AssemblyAITranscript {
  id: string;
  status: AssemblyAITranscriptStatus;
  audio_url?: string;
  text?: string | null;
  language_code?: AssemblyAILanguageCode | null;
  language_detection?: boolean;
  language_confidence?: number | null;
  speech_model?: AssemblyAISpeechModel | null;
  acoustic_model?: string;
  confidence?: number | null;
  audio_duration?: number | null;
  punctuate?: boolean;
  format_text?: boolean;
  dual_channel?: boolean;
  multichannel?: boolean;
  webhook_status_code?: number | null;
  webhook_url?: string | null;
  auto_highlights?: boolean;
  auto_highlights_result?: unknown;
  redact_pii?: boolean;
  redact_pii_audio?: boolean;
  redact_pii_audio_url?: string | null;
  summarization?: boolean;
  summary?: string | null;
  summary_type?: string | null;
  summary_model?: string | null;
  iab_categories?: boolean;
  iab_categories_result?: unknown;
  content_safety?: boolean;
  content_safety_labels?: unknown;
  sentiment_analysis?: boolean;
  sentiment_analysis_results?: Array<Record<string, unknown>> | null;
  entity_detection?: boolean;
  entities?: AssemblyAIEntity[] | null;
  speaker_labels?: boolean;
  utterances?: AssemblyAIUtterance[] | null;
  words?: AssemblyAIWord[] | null;
  chapters?: AssemblyAIChapter[] | null;
  error?: string | null;
  created?: string;
  completed?: string | null;
  [key: string]: unknown;
}

export interface AssemblyAITranscriptListParams {
  limit?: number;
  status?: AssemblyAITranscriptStatus;
  created_on?: string;
  before_id?: string;
  after_id?: string;
  throttled_only?: boolean;
  [key: string]: unknown;
}

export interface AssemblyAITranscriptListItem {
  id: string;
  resource_url?: string;
  status: AssemblyAITranscriptStatus;
  created?: string;
  completed?: string | null;
  audio_url?: string;
  error?: string | null;
  [key: string]: unknown;
}

export interface AssemblyAITranscriptListResponse {
  page_details: {
    limit: number;
    result_count: number;
    current_url?: string;
    prev_url?: string | null;
    next_url?: string | null;
  };
  transcripts: AssemblyAITranscriptListItem[];
  [key: string]: unknown;
}

export interface AssemblyAITranscriptDeleteResponse extends AssemblyAITranscript {
  [key: string]: unknown;
}

export type AssemblyAISubtitleFormat = 'srt' | 'vtt';

export interface AssemblyAISentence {
  text: string;
  start: number;
  end: number;
  confidence: number;
  words?: AssemblyAIWord[];
  speaker?: string | null;
  [key: string]: unknown;
}

export interface AssemblyAISentencesResponse {
  id?: string;
  confidence?: number;
  audio_duration?: number;
  sentences: AssemblyAISentence[];
  [key: string]: unknown;
}

export interface AssemblyAIParagraph {
  text: string;
  start: number;
  end: number;
  confidence: number;
  words?: AssemblyAIWord[];
  speaker?: string | null;
  [key: string]: unknown;
}

export interface AssemblyAIParagraphsResponse {
  id?: string;
  confidence?: number;
  audio_duration?: number;
  paragraphs: AssemblyAIParagraph[];
  [key: string]: unknown;
}

// ─── LeMUR ───────────────────────────────────────────────────────────────────

export type AssemblyAILemurModel =
  | 'default'
  | 'basic'
  | 'anthropic/claude-3-5-sonnet'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3-sonnet'
  | (string & {});

export interface AssemblyAILemurBaseParams {
  /** One or more transcript ids to use as input. */
  transcript_ids?: string[];
  /** Or supply raw text instead of transcript ids. */
  input_text?: string;
  context?: string | Record<string, unknown>;
  final_model?: AssemblyAILemurModel;
  max_output_size?: number;
  temperature?: number;
  [key: string]: unknown;
}

export interface AssemblyAILemurTaskParams extends AssemblyAILemurBaseParams {
  prompt: string;
}

export interface AssemblyAILemurTaskResponse {
  request_id: string;
  response: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  [key: string]: unknown;
}

export interface AssemblyAILemurSummaryParams extends AssemblyAILemurBaseParams {
  answer_format?: string;
}

export interface AssemblyAILemurSummaryResponse {
  request_id: string;
  response: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  [key: string]: unknown;
}

export interface AssemblyAILemurQuestion {
  question: string;
  context?: string | Record<string, unknown>;
  answer_format?: string;
  answer_options?: string[];
}

export interface AssemblyAILemurQuestionAnswerParams extends AssemblyAILemurBaseParams {
  questions: AssemblyAILemurQuestion[];
}

export interface AssemblyAILemurQuestionAnswerResponse {
  request_id: string;
  response: Array<{ question: string; answer: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
  [key: string]: unknown;
}

// ─── Realtime token ──────────────────────────────────────────────────────────

export interface AssemblyAIRealtimeTokenParams {
  expires_in?: number;
  [key: string]: unknown;
}

export interface AssemblyAIRealtimeTokenResponse {
  token: string;
  [key: string]: unknown;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export interface AssemblyAIUploadResponse {
  upload_url: string;
  [key: string]: unknown;
}
