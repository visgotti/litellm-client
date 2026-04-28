// ─────────────────────────────────────────────────────────────────────────────
// Image generation / edits / variations
// ─────────────────────────────────────────────────────────────────────────────

export type ImageModel =
  | 'dall-e-2'
  | 'dall-e-3'
  | 'gpt-image-1'
  | (string & {});

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

export interface ImageGenerateParams {
  prompt: string;
  model?: ImageModel;
  n?: number;
  quality?: 'standard' | 'hd' | 'low' | 'medium' | 'high' | 'auto';
  size?: ImageSize;
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
  background?: 'transparent' | 'opaque' | 'auto';
  output_format?: 'png' | 'jpeg' | 'webp';
  output_compression?: number;
  user?: string;
  metadata?: Record<string, unknown>;
}

export interface ImageObject {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageResponse {
  created: number;
  data: ImageObject[];
  /** gpt-image-1 returns usage. */
  usage?: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    input_tokens_details?: { text_tokens: number; image_tokens: number };
  };
}

export interface ImageEditParams {
  image: ArrayBuffer | Uint8Array | Blob | Array<ArrayBuffer | Uint8Array | Blob>;
  prompt: string;
  mask?: ArrayBuffer | Uint8Array | Blob;
  model?: ImageModel;
  n?: number;
  size?: ImageSize;
  response_format?: 'url' | 'b64_json';
  user?: string;
  /** Optional file names. */
  filename?: string;
  contentType?: string;
}

export interface ImageVariationParams {
  image: ArrayBuffer | Uint8Array | Blob;
  model?: ImageModel;
  n?: number;
  size?: ImageSize;
  response_format?: 'url' | 'b64_json';
  user?: string;
  filename?: string;
  contentType?: string;
}
