// ─────────────────────────────────────────────────────────────────────────────
// OCR — Mistral-format OCR responses normalized by LiteLLM.
// Source: litellm/llms/base_llm/ocr/transformation.py + litellm/ocr/main.py.
// ─────────────────────────────────────────────────────────────────────────────

/** OCR model identifier. */
export type OCRModel =
  | 'mistral-ocr'
  | 'mistral/mistral-ocr-latest'
  | (string & {});

// ─── Document inputs (JSON body) ─────────────────────────────────────────────

/**
 * URL pointing to a document (PDF / DOCX / etc.).
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRDocumentURL {
  /** Discriminator for URL-based document inputs. */
  type: 'document_url';
  /** Publicly accessible URL of the document. */
  document_url: string;
}

/**
 * URL pointing to an image to OCR.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRImageURL {
  /** Discriminator for URL-based image inputs. */
  type: 'image_url';
  /** Publicly accessible URL of the image. */
  image_url: string;
}

/**
 * Inline file content reference (e.g. base64 string) accepted via JSON body.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRFile {
  /** Discriminator for inline file inputs. */
  type: 'file';
  /** Base64-encoded (or otherwise inline) file content. */
  file: string;
  /** MIME type of the inline content. */
  mime_type?: string;
}

/** Document discriminated union accepted via JSON body. */
export type OCRDocument = OCRDocumentURL | OCRImageURL | OCRFile;

// ─── Request ─────────────────────────────────────────────────────────────────

/**
 * JSON-body OCR request.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRCreateJSONParams {
  /** OCR model to use. */
  model: OCRModel;
  /** Document or image to OCR. */
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
  /** Override the LiteLLM provider used to dispatch the request. */
  custom_llm_provider?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Multipart-form OCR request (file upload).
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRCreateFileParams {
  /** OCR model to use. */
  model: OCRModel;
  /** Document file bytes. */
  file: ArrayBuffer | Uint8Array | Blob;
  /** Filename to send to the server. */
  filename?: string;
  /** MIME type of the document. */
  contentType?: string;
  /** 0-indexed page selection. */
  pages?: number[];
  /** Whether to embed page images as base64 in the response. */
  include_image_base64?: boolean;
  /** Cap on number of images returned per page. */
  image_limit?: number;
  /** Cap on the smallest image dimension (px). */
  image_min_size?: number;
  /** Override the LiteLLM provider used to dispatch the request. */
  custom_llm_provider?: string;
}

export type OCRCreateParams = OCRCreateJSONParams | OCRCreateFileParams;

// ─── Response ────────────────────────────────────────────────────────────────

/**
 * Physical dimensions of a page in an OCR response.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRPageDimensions {
  /** Page DPI. */
  dpi?: number | null;
  /** Page height in pixels. */
  height?: number | null;
  /** Page width in pixels. */
  width?: number | null;
}

/**
 * An image extracted from an OCR page.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRPageImage {
  /** Base64-encoded image bytes (when `include_image_base64=true`). */
  image_base64?: string | null;
  /** Bounding box of the image within the page (provider-specific shape). */
  bbox?: Record<string, unknown> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * A single page of OCR output.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRPage {
  /** 0-indexed page number. */
  index: number;
  /** OCR'd page content rendered as Markdown. */
  markdown: string;
  /** Images extracted from the page. */
  images?: OCRPageImage[] | null;
  /** Page dimensions. */
  dimensions?: OCRPageDimensions | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Usage information for an OCR call.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRUsageInfo {
  /** Number of pages processed. */
  pages_processed?: number | null;
  /** Size of the source document in bytes. */
  doc_size_bytes?: number | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * OCR response payload.
 *
 * @see https://docs.litellm.ai/docs/ocr
 */
export interface OCRResponse {
  /** Always `'ocr'`. */
  object: 'ocr';
  /** OCR results, one entry per processed page. */
  pages: OCRPage[];
  /** Model that produced the OCR. */
  model: string;
  /** Optional document-level annotations (provider-specific shape). */
  document_annotation?: unknown;
  /** Usage statistics for billing / accounting. */
  usage_info?: OCRUsageInfo | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}
