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

  /**
   * Generate a new video from a text prompt or other inputs.
   *
   * Returns immediately with a `VideoObject` whose status reflects job
   * progress; poll `retrieve` until ready, then call `content` to download
   * the bytes.
   *
   * @param params - Video generation params: `model`, `prompt`, plus
   *   optional `seconds`, `size`, `seed`, `input_reference`, etc.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `VideoObject` describing the job.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
  create(params: VideoCreateParams, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: '/v1/videos',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List video jobs (paginated).
   *
   * @param params - Pagination filters (`after`, `limit`, `order`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VideoListResponse` page of videos.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
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

  /**
   * Retrieve a video job's current state.
   *
   * Poll this until `status` indicates completion, then call `content` to
   * download the rendered bytes.
   *
   * @param videoId - The id of the video job.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `VideoObject` with current status.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
  retrieve(videoId: string, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'GET',
      path: `/v1/videos/${encodeURIComponent(videoId)}`,
      options,
    });
  }

  /**
   * Download the rendered video bytes (typically mp4).
   *
   * Only succeeds once the underlying job has completed; the response body
   * is buffered into an `ArrayBuffer`.
   *
   * @param videoId - The id of the completed video job.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The raw video bytes as an `ArrayBuffer`.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
  async content(videoId: string, options?: RequestOptions): Promise<ArrayBuffer> {
    const response = await this.rawRequest({
      method: 'GET',
      path: `/v1/videos/${encodeURIComponent(videoId)}/content`,
      options,
    });
    return await response.arrayBuffer();
  }

  /**
   * Create a remix derived from an existing video.
   *
   * @param videoId - The id of the source video to remix.
   * @param params - Remix params (e.g. updated `prompt`, `seconds`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A new `VideoObject` representing the remix job.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
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

  /**
   * Register a reusable character from a sample video.
   *
   * Sent as a multipart upload. Once registered the character can be
   * referenced by id when generating new videos.
   *
   * @param params - Character creation params: source `video`, `name`,
   *   optional `model`/`target_model_names`, and `filename`/`contentType`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created `CharacterObject`.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
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

  /**
   * Retrieve a previously registered character.
   *
   * @param characterId - The id returned from `createCharacter`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `CharacterObject`.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
  retrieveCharacter(characterId: string, options?: RequestOptions): Promise<CharacterObject> {
    return this.request<CharacterObject>({
      method: 'GET',
      path: `/v1/videos/characters/${encodeURIComponent(characterId)}`,
      options,
    });
  }

  /**
   * Edit a video using a prompt and optional reference inputs.
   *
   * @param params - Edit params describing source video and modifications.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VideoObject` representing the edit job.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
  edit(params: VideoEditParams, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: '/v1/videos/edits',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Extend an existing video by generating additional footage.
   *
   * @param params - Extension params describing source video and extension
   *   length / prompt.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VideoObject` representing the extension job.
   *
   * @see https://docs.litellm.ai/docs/videos
   */
  extend(params: VideoExtendParams, options?: RequestOptions): Promise<VideoObject> {
    return this.request<VideoObject>({
      method: 'POST',
      path: '/v1/videos/extensions',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
