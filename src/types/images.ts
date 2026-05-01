import type { LiteLLMForwardingOverrides } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Image generation / edits / variations
// ─────────────────────────────────────────────────────────────────────────────

/** OpenAI image-generation model identifier. */
export type ImageModel =
  | 'dall-e-2'
  | 'dall-e-3'
  | 'gpt-image-1'
  | (string & {});

/** Output image dimensions in pixels. */
export type ImageSize =
  | '256x256'
  | '512x512'
  | '1024x1024'
  | '1024x1792'
  | '1792x1024'
  | '1024x1536'
  | '1536x1024'
  | 'auto'
  | (string & {});

/**
 * Parameters for generating images from a text prompt.
 *
 * @see https://docs.litellm.ai/docs/image_generation
 */
export interface ImageGenerateParams extends LiteLLMForwardingOverrides {
  /** Text description of the desired image. */
  prompt: string;
  /** Image-generation model to use. */
  model?: ImageModel;
  /** Number of images to generate. */
  n?: number;
  /** Image quality preset (model-dependent). */
  quality?: 'standard' | 'hd' | 'low' | 'medium' | 'high' | 'auto';
  /** Output dimensions. */
  size?: ImageSize;
  /** Visual style preset (DALL·E 3). */
  style?: 'vivid' | 'natural';
  /** Whether to return URLs or base64-encoded image bytes. */
  response_format?: 'url' | 'b64_json';
  /** Background mode (gpt-image-1). */
  background?: 'transparent' | 'opaque' | 'auto';
  /** Output container format (gpt-image-1). */
  output_format?: 'png' | 'jpeg' | 'webp';
  /** Output compression level 0–100 (gpt-image-1, jpeg/webp only). */
  output_compression?: number;
  /** End-user identifier forwarded to the provider for abuse detection. */
  user?: string;
  /** Free-form metadata logged with the request. */
  metadata?: Record<string, unknown>;
}

/**
 * A single generated image in a response.
 *
 * @see https://docs.litellm.ai/docs/image_generation
 */
export interface ImageObject {
  /** URL to the generated image (when `response_format='url'`). */
  url?: string;
  /** Base64-encoded image bytes (when `response_format='b64_json'`). */
  b64_json?: string;
  /** Prompt the model actually used after revision (DALL·E 3). */
  revised_prompt?: string;
}

/**
 * Image-generation response payload.
 *
 * @see https://docs.litellm.ai/docs/image_generation
 */
export interface ImageResponse {
  /** Unix timestamp (seconds) of generation. */
  created: number;
  /** Generated images, in order. */
  data: ImageObject[];
  /** Token usage (gpt-image-1 only). */
  usage?: {
    /** Total tokens used by the request. */
    total_tokens: number;
    /** Tokens consumed by the prompt and any input images. */
    input_tokens: number;
    /** Tokens consumed by the generated image. */
    output_tokens: number;
    /** Breakdown of input tokens by modality. */
    input_tokens_details?: { text_tokens: number; image_tokens: number };
  };
}

/**
 * Parameters for editing or inpainting an image.
 *
 * @see https://docs.litellm.ai/docs/image_edits
 */
export interface ImageEditParams extends LiteLLMForwardingOverrides {
  /** Source image(s) to edit. */
  image: ArrayBuffer | Uint8Array | Blob | Array<ArrayBuffer | Uint8Array | Blob>;
  /** Text description of the desired edit. */
  prompt: string;
  /** Optional mask (transparent regions are edited). */
  mask?: ArrayBuffer | Uint8Array | Blob;
  /** Image-editing model to use. */
  model?: ImageModel;
  /** Number of edited images to generate. */
  n?: number;
  /** Output dimensions. */
  size?: ImageSize;
  /** Whether to return URLs or base64-encoded bytes. */
  response_format?: 'url' | 'b64_json';
  /** End-user identifier forwarded to the provider for abuse detection. */
  user?: string;
  /** Filename to send for the source image. */
  filename?: string;
  /** MIME type for the source image. */
  contentType?: string;
}

