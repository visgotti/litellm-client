import type {
  SpeechCreateParams,
  TranscriptionCreateParams,
  Transcription,
  TranscriptionVerbose,
} from '../types/audio';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, RawRequestFn } from '../client';
import { toBlob } from '../internal/form';

class SpeechResource {
  constructor(private rawRequest: RawRequestFn) {}

  /**
   * Synthesize speech audio from text (text-to-speech).
   *
   * The response body is binary audio (e.g. mp3/wav/opus depending on
   * `response_format`); this method buffers it into an `ArrayBuffer`. Pass it
   * to a `Blob`, write it to disk, or stream it onward as needed.
   *
   * @param params - TTS request body: `model`, `input` text, `voice`, plus
   *   optional `response_format` and `speed`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Raw audio bytes for the synthesized speech.
   *
   * @see https://docs.litellm.ai/docs/text_to_speech
   */
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

  /**
   * Transcribe an audio file into the original spoken language.
   *
   * Sent as a multipart upload. The return type narrows on `response_format`:
   * `'json'` (default) yields a `Transcription`, `'verbose_json'` yields
   * `TranscriptionVerbose` (with segments/words), and `'text'`/`'srt'`/`'vtt'`
   * yield a plain `string`.
   *
   * @param params - Transcription request: audio `file`, `model`, optional
   *   `language`, `prompt`, `response_format`, `temperature`, and
   *   `timestamp_granularities[]`, plus `filename`/`contentType` for upload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `Transcription`, `TranscriptionVerbose`, or `string` depending
   *   on the requested `response_format`.
   *
   * @see https://docs.litellm.ai/docs/audio_transcription
   */
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

export class AudioResource {
  readonly speech: SpeechResource;
  readonly transcriptions: TranscriptionsResource;

  constructor(request: RequestFn, rawRequest: RawRequestFn) {
    this.speech = new SpeechResource(rawRequest);
    this.transcriptions = new TranscriptionsResource(request);
  }
}
