import type {
  OCRCreateParams,
  OCRCreateFileParams,
  OCRCreateJSONParams,
  OCRResponse,
} from '../types/ocr';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';
import { toBlob, appendForm } from '../internal/form';

function isFileParams(p: OCRCreateParams): p is OCRCreateFileParams {
  return (p as OCRCreateFileParams).file !== undefined;
}

export class OcrResource {
  constructor(private request: RequestFn) {}

  /**
   * Run OCR on a document or image.
   *
   * Accepts two shapes: a JSON body referencing a remote `document` URL/id,
   * or a multipart upload when a `file` is supplied directly. The method
   * detects the variant via `params.file` and serializes accordingly.
   *
   * @param params - OCR request: either `OCRCreateJSONParams` (with
   *   `document`) or `OCRCreateFileParams` (with `file`, `filename`,
   *   `contentType`). Optional fields include `pages`, `image_limit`,
   *   `image_min_size`, `include_image_base64`, `custom_llm_provider`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `OCRResponse` containing extracted text and (optionally) images.
   *
   * @see https://docs.litellm.ai/docs/ocr
   */
  create(params: OCRCreateParams, options?: RequestOptions): Promise<OCRResponse> {
    if (isFileParams(params)) {
      const form = new FormData();
      const blob = toBlob(params.file, params.contentType ?? 'application/octet-stream');
      form.append('file', blob, params.filename ?? 'document');
      form.append('model', params.model);
      if (params.pages !== undefined) appendForm(form, 'pages', JSON.stringify(params.pages));
      if (params.include_image_base64 !== undefined)
        appendForm(form, 'include_image_base64', params.include_image_base64);
      if (params.image_limit !== undefined) appendForm(form, 'image_limit', params.image_limit);
      if (params.image_min_size !== undefined)
        appendForm(form, 'image_min_size', params.image_min_size);
      if (params.custom_llm_provider !== undefined)
        appendForm(form, 'custom_llm_provider', params.custom_llm_provider);
      return this.request<OCRResponse>({
        method: 'POST',
        path: '/v1/ocr',
        body: { kind: 'form', value: form },
        options,
      });
    }
    const jsonParams: OCRCreateJSONParams = params;
    return this.request<OCRResponse>({
      method: 'POST',
      path: '/v1/ocr',
      body: { kind: 'json', value: jsonParams },
      options,
    });
  }
}
