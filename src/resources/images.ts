import type {
  ImageGenerateParams,
  ImageEditParams,
  ImageVariationParams,
  ImageResponse,
} from '../types/images';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';
import { toBlob } from '../internal/form';

export class ImagesResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/images/generations */
  generate(params: ImageGenerateParams, options?: RequestOptions): Promise<ImageResponse> {
    return this.request<ImageResponse>({
      method: 'POST',
      path: '/v1/images/generations',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/images/edits */
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

  /** POST /v1/images/variations */
  variations(params: ImageVariationParams, options?: RequestOptions): Promise<ImageResponse> {
    const form = new FormData();
    const ct = params.contentType ?? 'image/png';
    form.append('image', toBlob(params.image, ct), params.filename ?? 'image.png');
    if (params.model) form.append('model', params.model);
    if (params.n !== undefined) form.append('n', String(params.n));
    if (params.size) form.append('size', params.size);
    if (params.response_format) form.append('response_format', params.response_format);
    if (params.user) form.append('user', params.user);
    return this.request<ImageResponse>({
      method: 'POST',
      path: '/v1/images/variations',
      body: { kind: 'form', value: form },
      options,
    });
  }
}
