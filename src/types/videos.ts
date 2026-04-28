// ─────────────────────────────────────────────────────────────────────────────
// Videos (OpenAI Sora-compatible video generation, remix, edits, extensions,
// characters). Mirrors litellm/types/videos/main.py.
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPaginationParams } from './common';

export type VideoModel = 'sora-2' | 'sora-2-pro' | (string & {});

export type VideoStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | (string & {});

/** Sora video duration (seconds, as string per OpenAI spec). */
export type VideoSeconds = '4' | '8' | '12' | (string & {});

/** Sora video size (e.g. "720x1280"). */
export type VideoSize =
  | '720x1280'
  | '1280x720'
  | '1024x1792'
  | '1792x1024'
  | (string & {});

// ─── Core objects ────────────────────────────────────────────────────────────

export interface VideoObject {
  id: string;
  object: 'video';
  status: VideoStatus;
  created_at?: number | null;
  completed_at?: number | null;
  expires_at?: number | null;
  error?: Record<string, unknown> | null;
  progress?: number | null;
  remixed_from_video_id?: string | null;
  seconds?: VideoSeconds | null;
  size?: VideoSize | null;
  model?: VideoModel | null;
  usage?: Record<string, unknown> | null;
}

/** OpenAI-style cursor list of videos. */
export interface VideoListResponse {
  object: 'list';
  data: VideoObject[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}

// ─── Create ──────────────────────────────────────────────────────────────────

/** {@link CharacterRef} entry for video creation. */
export interface VideoCharacterRef {
  id: string;
  /** Optional name override / display label. */
  name?: string;
  [key: string]: unknown;
}

/** POST /v1/videos — JSON body. */
export interface VideoCreateParams {
  prompt: string;
  model?: VideoModel;
  seconds?: VideoSeconds;
  size?: VideoSize;
  /** File reference for input image (e.g. data URL or file id). */
  input_reference?: string;
  /** Image-to-video input — provider-specific (gcsUri / bytesBase64Encoded / file id). */
  image?: unknown;
  /** Provider-specific parameters block forwarded as-is. */
  parameters?: Record<string, unknown>;
  characters?: VideoCharacterRef[];
  user?: string;
  extra_headers?: Record<string, string>;
  extra_body?: Record<string, unknown>;
}

// ─── List ────────────────────────────────────────────────────────────────────

export type VideoListParams = CursorPaginationParams;

// ─── Remix ───────────────────────────────────────────────────────────────────

/** POST /v1/videos/{video_id}/remix */
export interface VideoRemixParams {
  prompt: string;
  model?: VideoModel;
  custom_llm_provider?: string;
  [key: string]: unknown;
}

// ─── Edit / Extension ────────────────────────────────────────────────────────

/** Inline video reference used by edit / extend. */
export interface VideoRef {
  id: string;
}

/** POST /v1/videos/edits */
export interface VideoEditParams {
  prompt: string;
  video: VideoRef;
  model?: VideoModel;
  [key: string]: unknown;
}

/** POST /v1/videos/extensions */
export interface VideoExtendParams {
  prompt: string;
  video: VideoRef;
  seconds?: VideoSeconds;
  model?: VideoModel;
  [key: string]: unknown;
}

// ─── Characters ──────────────────────────────────────────────────────────────

export interface CharacterObject {
  id: string;
  object: 'character';
  created_at: number;
  name: string;
}

/** POST /v1/videos/characters — multipart form. */
export interface CharacterCreateParams {
  /** Reference video file (mp4 / webm / mov / etc.). */
  video: ArrayBuffer | Uint8Array | Blob;
  /** Character display name. */
  name: string;
  /** Optional model override (forwarded as `target_model_names`). */
  target_model_names?: string;
  model?: VideoModel;
  filename?: string;
  contentType?: string;
}
