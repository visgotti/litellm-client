import type {
  ImageGenerateParams,
  ImageEditParams,
  ImageResponse,
} from '../types/images';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';
import { toBlob } from '../internal/form';

export class ImagesResource {
  constructor(private request: RequestFn) {}

  /**
   * Generate one or more images from a text prompt.
   *
   * @param params - Image generation request body, including `prompt`, `model`,
   *   `n`, `size`, `quality`, `style`, and `response_format`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `ImageResponse` containing the generated images as URLs or
   *   base64 strings depending on `response_format`.
   *
   * @see https://docs.litellm.ai/docs/image_generation
   */
  generate(params: ImageGenerateParams, options?: RequestOptions): Promise<ImageResponse> {
    return this.request<ImageResponse>({
      method: 'POST',
      path: '/v1/images/generations',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Edit an existing image using a text prompt and an optional mask.
   *
   * Sent as a multipart upload. `params.image` may be a single image or an
   * array; when it's an array each entry is appended as `image[]`. An optional
   * `params.mask` (PNG with alpha) selects the region to edit.
   *
   * @param params - Image edit request: source `image`, `prompt`, optional
   *   `mask`, plus `model`, `n`, `size`, `response_format`, `user`, and the
   *   transport hints `filename`/`contentType`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `ImageResponse` containing the edited image(s).
   *
   * @see https://docs.litellm.ai/docs/image_edits
   */
  edit(params: ImageEditParams, options?: RequestOptions): Promise<ImageResponse> {
    const form = new FormData();
    const ct = params.contentType ?? 'image/png';
    const filename = params.filename ?? 'image.png';
    if (Array.isArray(params.image)) {
      for (const img of params.image) form.append('image[]', toBlob(img, ct), filename);
    } else {
      form.append('image', toBlob(params.image, ct), filename);
    }
    form.append('prompt', params.prompt);
    if (params.mask) form.append('mask', toBlob(params.mask, 'image/png'), 'mask.png');
    if (params.model) form.append('model', params.model);
    if (params.n !== undefined) form.append('n', String(params.n));
    if (params.size) form.append('size', params.size);
    if (params.response_format) form.append('response_format', params.response_format);
    if (params.user) form.append('user', params.user);
    return this.request<ImageResponse>({
      method: 'POST',
      path: '/v1/images/edits',
      body: { kind: 'form', value: form },
      options,
    });
  }

}
