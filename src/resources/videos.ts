import type {
  VideoObject,
  VideoListResponse,
  VideoListParams,
  VideoCreateParams,
  VideoRemixParams,
  VideoEditParams,
  VideoExtendParams,
  CharacterObject,
  CharacterCreateParams,
} from '../types/videos';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, RawRequestFn } from '../client';
import { toBlob, appendForm } from '../internal/form';

export class VideoResource {
  constructor(
    private request: RequestFn,
    private rawRequest: RawRequestFn,
  ) {}

  /** POST /v1/videos */
  create(params: VideoCreateParams, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: '/v1/videos',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/videos */
  list(params: VideoListParams = {}, options?: RequestOptions): Promise<VideoListResponse> {
    return this.request<VideoListResponse>({
      method: 'GET',
      path: '/v1/videos',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/videos/{video_id} */
  retrieve(videoId: string, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'GET',
      path: `/v1/videos/${encodeURIComponent(videoId)}`,
      options,
    });
  }

  /** GET /v1/videos/{video_id}/content — returns raw video bytes (mp4). */
  async content(videoId: string, options?: RequestOptions): Promise<ArrayBuffer> {
    const response = await this.rawRequest({
      method: 'GET',
      path: `/v1/videos/${encodeURIComponent(videoId)}/content`,
      options,
    });
    return await response.arrayBuffer();
  }

  /** POST /v1/videos/{video_id}/remix */
  remix(
    videoId: string,
    params: VideoRemixParams,
    options?: RequestOptions,
  ): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: `/v1/videos/${encodeURIComponent(videoId)}/remix`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/videos/characters — multipart upload. */
  createCharacter(
    params: CharacterCreateParams,
    options?: RequestOptions,
  ): Promise<CharacterObject> {
    const form = new FormData();
    const blob = toBlob(params.video, params.contentType ?? 'video/mp4');
    form.append('video', blob, params.filename ?? 'character.mp4');
    form.append('name', params.name);
    if (params.target_model_names !== undefined)
      appendForm(form, 'target_model_names', params.target_model_names);
    if (params.model !== undefined) appendForm(form, 'model', params.model);
    return this.request<CharacterObject>({
      method: 'POST',
      path: '/v1/videos/characters',
      body: { kind: 'form', value: form },
      options,
    });
  }

  /** GET /v1/videos/characters/{character_id} */
  retrieveCharacter(characterId: string, options?: RequestOptions): Promise<CharacterObject> {
    return this.request<CharacterObject>({
      method: 'GET',
      path: `/v1/videos/characters/${encodeURIComponent(characterId)}`,
      options,
    });
  }

  /** POST /v1/videos/edits */
  edit(params: VideoEditParams, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: '/v1/videos/edits',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/videos/extensions */
  extend(params: VideoExtendParams, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: '/v1/videos/extensions',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
