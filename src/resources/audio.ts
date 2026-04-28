import type {
  SpeechCreateParams,
  TranscriptionCreateParams,
  Transcription,
  TranscriptionVerbose,
  TranslationCreateParams,
  Translation,
} from '../types/audio';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, RawRequestFn } from '../client';
import { toBlob } from '../internal/form';

class SpeechResource {
  constructor(private rawRequest: RawRequestFn) {}

  /** POST /v1/audio/speech — returns audio bytes. */
  async create(params: SpeechCreateParams, options?: RequestOptions): Promise<ArrayBuffer> {
    const response = await this.rawRequest({
      method: 'POST',
      path: '/v1/audio/speech',
      body: { kind: 'json', value: params },
      options,
    });
    return await response.arrayBuffer();
  }
}

class TranscriptionsResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/audio/transcriptions */
  create(
    params: TranscriptionCreateParams & { response_format?: 'json' },
    options?: RequestOptions,
  ): Promise<Transcription>;
  create(
    params: TranscriptionCreateParams & { response_format: 'verbose_json' },
    options?: RequestOptions,
  ): Promise<TranscriptionVerbose>;
  create(
    params: TranscriptionCreateParams & { response_format: 'text' | 'srt' | 'vtt' },
    options?: RequestOptions,
  ): Promise<string>;
  create(
    params: TranscriptionCreateParams,
    options?: RequestOptions,
  ): Promise<Transcription | TranscriptionVerbose | string>;
  create(
    params: TranscriptionCreateParams,
    options?: RequestOptions,
  ): Promise<Transcription | TranscriptionVerbose | string> {
    const form = new FormData();
    const blob = toBlob(params.file, params.contentType ?? 'application/octet-stream');
    form.append('file', blob, params.filename ?? 'audio');
    form.append('model', params.model);
    if (params.language !== undefined) form.append('language', params.language);
    if (params.prompt !== undefined) form.append('prompt', params.prompt);
    if (params.response_format !== undefined)
      form.append('response_format', params.response_format);
    if (params.temperature !== undefined) form.append('temperature', String(params.temperature));
    const granularities = params['timestamp_granularities[]'];
    if (granularities) {
      for (const g of granularities) form.append('timestamp_granularities[]', g);
    }
    return this.request({
      method: 'POST',
      path: '/v1/audio/transcriptions',
      body: { kind: 'form', value: form },
      options,
    });
  }
}

class TranslationsResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/audio/translations */
  create(params: TranslationCreateParams, options?: RequestOptions): Promise<Translation | string> {
    const form = new FormData();
    const blob = toBlob(params.file, params.contentType ?? 'application/octet-stream');
    form.append('file', blob, params.filename ?? 'audio');
    form.append('model', params.model);
    if (params.prompt !== undefined) form.append('prompt', params.prompt);
    if (params.response_format !== undefined)
      form.append('response_format', params.response_format);
    if (params.temperature !== undefined) form.append('temperature', String(params.temperature));
    return this.request<Translation | string>({
      method: 'POST',
      path: '/v1/audio/translations',
      body: { kind: 'form', value: form },
      options,
    });
  }
}

export class AudioResource {
  readonly speech: SpeechResource;
  readonly transcriptions: TranscriptionsResource;
  readonly translations: TranslationsResource;

  constructor(request: RequestFn, rawRequest: RawRequestFn) {
    this.speech = new SpeechResource(rawRequest);
    this.transcriptions = new TranscriptionsResource(request);
    this.translations = new TranslationsResource(request);
  }
}
