// ─────────────────────────────────────────────────────────────────────────────
// Videos (OpenAI Sora-compatible video generation, remix, edits, extensions,
// characters). Mirrors litellm/types/videos/main.py.
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPaginationParams } from './common';

/** Sora video model identifier. */
export type VideoModel = 'sora-2' | 'sora-2-pro' | (string & {});

/**
 * Lifecycle states a video job can be in.
 *
 * - `queued`: Awaiting processing.
 * - `in_progress`: Currently being generated.
 * - `completed`: Generation finished and the video is downloadable.
 * - `failed`: Generation failed; check `error`.
 * - `cancelled`: Cancelled before completion.
 */
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

/**
 * A video generation job.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoObject {
  /** Unique identifier. */
  id: string;
  /** Always `'video'`. */
  object: 'video';
  /** Current lifecycle status. */
  status: VideoStatus;
  /** Unix timestamp (seconds) when the job was created. */
  created_at?: number | null;
  /** Unix timestamp when generation completed. */
  completed_at?: number | null;
  /** Unix timestamp when the asset will expire and be deleted. */
  expires_at?: number | null;
  /** Failure message when `status === 'failed'`. */
  error?: string;
  /** Generation progress in the range `[0, 1]`. */
  progress?: number | null;
  /** Source video ID when this video was created via remix. */
  remixed_from_video_id?: string | null;
  /** Duration (seconds) of the produced video. */
  seconds?: VideoSeconds | null;
  /** Output dimensions of the produced video. */
  size?: VideoSize | null;
  /** Model that produced the video. */
  model?: VideoModel | null;
  /** Provider-specific usage / billing information. */
  usage?: Record<string, unknown> | null;
}

/**
 * OpenAI-style cursor list of videos.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of videos. */
  data: VideoObject[];
  /** ID of the first video in the page. */
  first_id?: string | null;
  /** ID of the last video in the page. */
  last_id?: string | null;
  /** Whether more videos exist after this page. */
  has_more?: boolean;
}

// ─── Create ──────────────────────────────────────────────────────────────────

/**
 * Character reference embedded in a video creation request.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoCharacterRef {
  /** Character ID created via `client.videos.characters.create`. */
  id: string;
  /** Optional name override / display label. */
  name?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * POST /v1/videos — JSON body.
 *
 * Note: the LiteLLM docs flag `model` as required, but the proxy will route
 * to a default deployment when omitted. Kept optional in the SDK to match
 * actual behavior; pass `model` explicitly when targeting a specific provider.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoCreateParams {
  /** Text description of the desired video. */
  prompt: string;
  /** Video model to use. */
  model?: VideoModel;
  /** Duration of the produced video. */
  seconds?: VideoSeconds;
  /** Output dimensions of the produced video. */
  size?: VideoSize;
  /**
   * Reference to an input image to seed the video generation. Accepts either:
   * - a string (file ID, data URL, or HTTPS URL), or
   * - an OpenAI-style file object `{ file_id, ... }` per the public docs.
   *
   * The proxy normalizes both forms to its provider's underlying shape.
   */
  input_reference?: string | { file_id?: string; [key: string]: unknown };
  /** Image-to-video input — provider-specific (gcsUri / bytesBase64Encoded / file id). */
  image?: unknown;
  /** Provider-specific parameters block forwarded as-is. */
  parameters?: Record<string, unknown>;
  /** Characters to inject into the scene by ID. */
  characters?: VideoCharacterRef[];
  /** End-user identifier forwarded to the provider for abuse detection. */
  user?: string;
  /** Extra HTTP headers to attach to this request. */
  extra_headers?: Record<string, string>;
  /** Extra body fields merged into the request payload. */
  extra_body?: Record<string, unknown>;
}

// ─── List ────────────────────────────────────────────────────────────────────

export type VideoListParams = CursorPaginationParams;

// ─── Remix ───────────────────────────────────────────────────────────────────

/**
 * POST /v1/videos/{video_id}/remix
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoRemixParams {
  /** Text description of the desired remix. */
  prompt: string;
  /** Video model to use. */
  model?: VideoModel;
  /** Override the LiteLLM provider used to dispatch the request. */
  custom_llm_provider?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

// ─── Edit / Extension ────────────────────────────────────────────────────────

/**
 * Inline video reference used by edit / extend.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoRef {
  /** ID of the video to operate on. */
  id: string;
}

/**
 * POST /v1/videos/edits
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoEditParams {
  /** Text description of the desired edit. */
  prompt: string;
  /** Video to edit. */
  video: VideoRef;
  /** Video model to use. */
  model?: VideoModel;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * POST /v1/videos/extensions
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface VideoExtendParams {
  /** Text description of how to continue the video. */
  prompt: string;
  /** Video to extend. */
  video: VideoRef;
  /** Additional duration to append. */
  seconds?: VideoSeconds;
  /** Video model to use. */
  model?: VideoModel;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

// ─── Characters ──────────────────────────────────────────────────────────────

/**
 * A reusable character reference for video generation.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface CharacterObject {
  /** Unique identifier. */
  id: string;
  /** Always `'character'`. */
  object: 'character';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Display name of the character. */
  name: string;
}

/**
 * POST /v1/videos/characters — multipart form.
 *
 * @see https://docs.litellm.ai/docs/videos
 */
export interface CharacterCreateParams {
  /** Reference video file (mp4 / webm / mov / etc.). */
  video: ArrayBuffer | Uint8Array | Blob;
  /** Character display name. */
  name: string;
  /** Optional model override (forwarded as `target_model_names`). */
  target_model_names?: string;
  /** Video model to use. */
  model?: VideoModel;
  /** Filename to send to the server. */
  filename?: string;
  /** MIME type of the reference video. */
  contentType?: string;
}
