// ─────────────────────────────────────────────────────────────────────────────
// OCR — Mistral-format OCR responses normalized by LiteLLM.
// Source: litellm/llms/base_llm/ocr/transformation.py + litellm/ocr/main.py.
// ─────────────────────────────────────────────────────────────────────────────

export type OCRModel =
  | 'mistral-ocr'
  | 'mistral/mistral-ocr-latest'
  | (string & {});

// ─── Document inputs (JSON body) ─────────────────────────────────────────────

export interface OCRDocumentURL {
  type: 'document_url';
  document_url: string;
}

export interface OCRImageURL {
  type: 'image_url';
  image_url: string;
}

/** Document discriminated union accepted via JSON body. */
export type OCRDocument = OCRDocumentURL | OCRImageURL;

// ─── Request ─────────────────────────────────────────────────────────────────

/** JSON-body OCR request. */
export interface OCRCreateJSONParams {
  model: OCRModel;
  document: OCRDocument;
  /** 0-indexed page selection. */
  pages?: number[];
  /** Whether to embed page images as base64 in the response. */
  include_image_base64?: boolean;
  /** Cap on number of images returned per page. */
  image_limit?: number;
  /** Cap on the smallest image dimension (px). */
  image_min_size?: number;
  /** Optional document-level annotation request (provider-specific). */
  document_annotation?: Record<string, unknown>;
  custom_llm_provider?: string;
  [key: string]: unknown;
}

/** Multipart-form OCR request (file upload). */
export interface OCRCreateFileParams {
  model: OCRModel;
  /** Document file bytes. */
  file: ArrayBuffer | Uint8Array | Blob;
  filename?: string;
  contentType?: string;
  pages?: number[];
  include_image_base64?: boolean;
  image_limit?: number;
  image_min_size?: number;
  custom_llm_provider?: string;
}

export type OCRCreateParams = OCRCreateJSONParams | OCRCreateFileParams;

// ─── Response ────────────────────────────────────────────────────────────────

export interface OCRPageDimensions {
  dpi?: number | null;
  height?: number | null;
  width?: number | null;
}

export interface OCRPageImage {
  image_base64?: string | null;
  bbox?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface OCRPage {
  index: number;
  markdown: string;
  images?: OCRPageImage[] | null;
  dimensions?: OCRPageDimensions | null;
  [key: string]: unknown;
}

export interface OCRUsageInfo {
  pages_processed?: number | null;
  doc_size_bytes?: number | null;
  [key: string]: unknown;
}

export interface OCRResponse {
  object: 'ocr';
  pages: OCRPage[];
  model: string;
  document_annotation?: unknown;
  usage_info?: OCRUsageInfo | null;
  [key: string]: unknown;
}
