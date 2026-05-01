/**
 * @group unit
 *
 * Compile-time / shape tests for the tightened streaming-event unions on
 * the Anthropic, Gemini, and OpenAI Responses surfaces.
 *
 * Each surface follows the established two-tier pattern:
 *   - `KnownXEvent` strict union (exhaustive `switch` narrowing on `.type`)
 *   - `UnknownXEvent` fallback (`{ type: string & {}; [key: string]: unknown }`)
 *   - `XEvent = Known | Unknown` open union
 *
 * The "tests" here are mostly assignability + narrowing checks — if any of
 * the unions regresses, `npm run lint` (tsc --noEmit) fails the build.
 */

// ── Anthropic ────────────────────────────────────────────────────────────────
import type {
  AnthropicMessage,
  AnthropicErrorBody,
  AnthropicStreamDelta,
  AnthropicKnownStreamDelta,
  AnthropicUnknownStreamDelta,
  AnthropicTextDelta,
  AnthropicInputJsonDelta,
  AnthropicThinkingDelta,
  AnthropicSignatureDelta,
  AnthropicCitationsDelta,
  AnthropicMessageStartEvent,
  AnthropicContentBlockStartEvent,
  AnthropicContentBlockDeltaEvent,
  AnthropicContentBlockStopEvent,
  AnthropicMessageDeltaEvent,
  AnthropicMessageStopEvent,
  AnthropicPingEvent,
  AnthropicErrorEvent,
  KnownAnthropicMessageStreamEvent,
  UnknownAnthropicMessageStreamEvent,
  AnthropicMessageStreamEvent,
  MessageStreamEvent,
} from '../../../src/types/anthropic';

// ── Gemini ───────────────────────────────────────────────────────────────────
import type {
  GeminiTextPart,
  GeminiInlineDataPart,
  GeminiFileDataPart,
  GeminiFunctionCallPart,
  GeminiFunctionResponsePart,
  GeminiExecutableCodePart,
  GeminiCodeExecutionResultPart,
  GeminiThoughtPart,
  KnownGeminiPart,
  UnknownGeminiPart,
  GeminiPart,
  GenerateContentResponse,
} from '../../../src/types/gemini';

// ── Responses ────────────────────────────────────────────────────────────────
import type {
  ResponseObject,
  ResponseContentPart,
  ResponseStreamEventCommon,
  ResponseCreatedEvent,
  ResponseInProgressEvent,
  ResponseCompletedEvent,
  ResponseFailedEvent,
  ResponseIncompleteEvent,
  ResponseOutputItemAddedEvent,
  ResponseOutputItemDoneEvent,
  ResponseContentPartAddedEvent,
  ResponseContentPartDoneEvent,
  ResponseOutputTextDeltaEvent,
  ResponseOutputTextDoneEvent,
  ResponseRefusalDeltaEvent,
  ResponseRefusalDoneEvent,
  ResponseFunctionCallArgumentsDeltaEvent,
  ResponseFunctionCallArgumentsDoneEvent,
  ResponseFileSearchCallInProgressEvent,
  ResponseFileSearchCallSearchingEvent,
  ResponseFileSearchCallCompletedEvent,
  ResponseWebSearchCallInProgressEvent,
  ResponseWebSearchCallSearchingEvent,
  ResponseWebSearchCallCompletedEvent,
  ResponseImageGenerationCallPartialImageEvent,
  ResponseImageGenerationCallCompletedEvent,
  ResponseAudioDeltaEvent,
  ResponseAudioDoneEvent,
  ResponseAudioTranscriptDeltaEvent,
  ResponseAudioTranscriptDoneEvent,
  ResponseErrorEvent,
  KnownResponseStreamEvent,
  UnknownResponseStreamEvent,
  ResponseStreamEvent,
} from '../../../src/types/responses';

// ── Chat (verify the existing delta is still exhaustive) ─────────────────────
import type {
  ChatCompletionChunk,
  ChatCompletionChunkDelta,
} from '../../../src/types/chat';

// Confirm the public package entrypoint also re-exports the new unions.
import type {
  ResponseStreamEvent as PublicResponseStreamEvent,
  KnownResponseStreamEvent as PublicKnownResponseStreamEvent,
  AnthropicMessageStreamEvent as PublicAnthropicEvent,
  KnownAnthropicMessageStreamEvent as PublicKnownAnthropicEvent,
  GeminiPart as PublicGeminiPart,
  KnownGeminiPart as PublicKnownGeminiPart,
} from '../../../src/index';

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic
// ─────────────────────────────────────────────────────────────────────────────

describe('Anthropic streaming-event types', () => {
  const anthropicMessage: AnthropicMessage = {
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-4-5',
    content: [],
    stop_reason: null,
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 0 },
  };

  it('top-level unions are exported from src/types/anthropic and the package index', () => {
    const open: AnthropicMessageStreamEvent = { type: 'ping' };
    const known: KnownAnthropicMessageStreamEvent = { type: 'message_stop' };
    const unknown: UnknownAnthropicMessageStreamEvent = { type: 'future.event', any: 1 };
    // Backwards-compat: existing `MessageStreamEvent` symbol still resolves.
    const legacy: MessageStreamEvent = open;
    const pub: PublicAnthropicEvent = { type: 'ping' };
    const pubKnown: PublicKnownAnthropicEvent = { type: 'message_stop' };
    expect(open.type).toBe('ping');
    expect(known.type).toBe('message_stop');
    expect(unknown.any).toBe(1);
    expect(legacy.type).toBe('ping');
    expect(pub.type).toBe('ping');
    expect(pubKnown.type).toBe('message_stop');
  });

  it('exhaustive `switch` narrows KnownAnthropicMessageStreamEvent', () => {
    const events: KnownAnthropicMessageStreamEvent[] = [
      { type: 'message_start', message: anthropicMessage } satisfies AnthropicMessageStartEvent,
      {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      } satisfies AnthropicContentBlockStartEvent,
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: 'hi' } satisfies AnthropicTextDelta,
      } satisfies AnthropicContentBlockDeltaEvent,
      {
        type: 'content_block_delta',
        index: 0,
        delta: {
          type: 'input_json_delta',
          partial_json: '{"a":',
        } satisfies AnthropicInputJsonDelta,
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'thinking_delta', thinking: '...' } satisfies AnthropicThinkingDelta,
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'signature_delta', signature: 'sig' } satisfies AnthropicSignatureDelta,
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: {
          type: 'citations_delta',
          citation: { type: 'char_location' },
        } satisfies AnthropicCitationsDelta,
      },
      { type: 'content_block_stop', index: 0 } satisfies AnthropicContentBlockStopEvent,
      {
        type: 'message_delta',
        delta: { stop_reason: 'end_turn' },
        usage: { output_tokens: 5 },
      } satisfies AnthropicMessageDeltaEvent,
      { type: 'message_stop' } satisfies AnthropicMessageStopEvent,
      { type: 'ping' } satisfies AnthropicPingEvent,
      {
        type: 'error',
        error: { type: 'overloaded_error', message: 'Slow down' },
      } satisfies AnthropicErrorEvent,
    ];

    let textDeltaSeen = false;
    let errorSeen = false;
    let visited = 0;
    for (const ev of events) {
      visited += 1;
      switch (ev.type) {
        case 'message_start': {
          // Narrowed to AnthropicMessageStartEvent.
          const m: AnthropicMessage = ev.message;
          expect(m.id).toBe('msg_1');
          break;
        }
        case 'content_block_start': {
          const idx: number = ev.index;
          expect(idx).toBe(0);
          break;
        }
        case 'content_block_delta': {
          // The open `AnthropicStreamDelta` cannot narrow on `.type` alone
          // because the `Unknown` variant uses `string & {}` — so we test
          // narrowing on the strict `AnthropicKnownStreamDelta` shape.
          const delta = ev.delta as AnthropicKnownStreamDelta;
          if (delta.type === 'text_delta') {
            const text: string = delta.text;
            expect(text).toBe('hi');
            textDeltaSeen = true;
          }
          break;
        }
        case 'content_block_stop':
          expect(ev.index).toBe(0);
          break;
        case 'message_delta':
          expect(ev.delta.stop_reason).toBe('end_turn');
          break;
        case 'message_stop':
        case 'ping':
          expect(typeof ev.type).toBe('string');
          break;
        case 'error': {
          const err: AnthropicErrorBody = ev.error;
          expect(err.type).toBe('overloaded_error');
          errorSeen = true;
          break;
        }
        default: {
          // Exhaustive — `ev` should narrow to `never` here.
          const _exhaustive: never = ev;
          throw new Error(`unexpected event ${JSON.stringify(_exhaustive)}`);
        }
      }
    }
    expect(visited).toBe(events.length);
    expect(textDeltaSeen).toBe(true);
    expect(errorSeen).toBe(true);
  });

  it('AnthropicStreamDelta narrows on its inner discriminator', () => {
    const deltas: AnthropicKnownStreamDelta[] = [
      { type: 'text_delta', text: 'a' },
      { type: 'input_json_delta', partial_json: '{' },
      { type: 'thinking_delta', thinking: 'hmm' },
      { type: 'signature_delta', signature: 'sig' },
      { type: 'citations_delta', citation: { type: 'page_location' } },
    ];

    const seen = new Set<string>();
    for (const d of deltas) {
      switch (d.type) {
        case 'text_delta':
          expect(typeof d.text).toBe('string');
          break;
        case 'input_json_delta':
          expect(typeof d.partial_json).toBe('string');
          break;
        case 'thinking_delta':
          expect(typeof d.thinking).toBe('string');
          break;
        case 'signature_delta':
          expect(typeof d.signature).toBe('string');
          break;
        case 'citations_delta':
          expect(typeof d.citation).toBe('object');
          break;
        default: {
          const _exhaustive: never = d;
          throw new Error(`unexpected delta ${JSON.stringify(_exhaustive)}`);
        }
      }
      seen.add(d.type);
    }
    expect(seen.size).toBe(5);
  });

  it('open union absorbs unknown future event types without a cast', () => {
    const future: AnthropicMessageStreamEvent = {
      type: 'message_extra_thing',
      brand_new_field: 42,
    };
    expect(future.type).toBe('message_extra_thing');
    const fallback: UnknownAnthropicMessageStreamEvent = { type: 'x', y: 'z' };
    expect(fallback.y).toBe('z');

    // Open delta union also accepts unknown variants.
    const futureDelta: AnthropicStreamDelta = { type: 'image_delta', data: 'b64' };
    const unknownDelta: AnthropicUnknownStreamDelta = { type: 'q', a: 1 };
    expect(futureDelta.type).toBe('image_delta');
    expect(unknownDelta.a).toBe(1);
  });

  it('@ts-expect-error: invalid Anthropic event literals are rejected', () => {
    // @ts-expect-error — `message` is required on message_start
    const _bad1: AnthropicMessageStartEvent = { type: 'message_start' };
    // prettier-ignore
    // @ts-expect-error — type literal mismatch on content_block_delta
    const _bad2: AnthropicContentBlockDeltaEvent = { type: 'message_start', index: 0, delta: { type: 'text_delta', text: '' } };
    // @ts-expect-error — `error` field required on the error event
    const _bad3: AnthropicErrorEvent = { type: 'error' };
    expect([_bad1, _bad2, _bad3]).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gemini
// ─────────────────────────────────────────────────────────────────────────────

describe('Gemini part types', () => {
  it('top-level unions are exported from src/types/gemini and the package index', () => {
    const open: GeminiPart = { text: 'hi' };
    const known: KnownGeminiPart = { text: 'hi' };
    const unknown: UnknownGeminiPart = { somethingNew: 1 };
    const pub: PublicGeminiPart = { text: 'hi' };
    const pubKnown: PublicKnownGeminiPart = { text: 'hi' };
    expect(open).toBeDefined();
    expect(known).toBeDefined();
    expect(unknown.somethingNew).toBe(1);
    expect(pub).toBeDefined();
    expect(pubKnown).toBeDefined();
  });

  it('discriminator-by-key narrowing works on every known variant', () => {
    const text: GeminiTextPart = { text: 'hello' };
    const inline: GeminiInlineDataPart = {
      inlineData: { mimeType: 'image/png', data: 'b64' },
    };
    const file: GeminiFileDataPart = {
      fileData: { mimeType: 'image/png', fileUri: 'gs://bucket/img.png' },
    };
    const fnCall: GeminiFunctionCallPart = {
      functionCall: { name: 'lookup', args: { q: 'sf' } },
    };
    const fnResp: GeminiFunctionResponsePart = {
      functionResponse: { name: 'lookup', response: { result: 'ok' } },
    };
    const code: GeminiExecutableCodePart = {
      executableCode: { language: 'PYTHON', code: 'print(1)' },
    };
    const codeResult: GeminiCodeExecutionResultPart = {
      codeExecutionResult: { outcome: 'OUTCOME_OK', output: '1' },
    };
    const thought: GeminiThoughtPart = { thought: true, text: 'reasoning' };

    const parts: KnownGeminiPart[] = [text, inline, file, fnCall, fnResp, code, codeResult, thought];

    let seenText = false;
    let seenInline = false;
    let seenFnCall = false;
    let seenCodeResult = false;
    let seenThought = false;

    for (const p of parts) {
      if ('text' in p && typeof p.text === 'string' && !('thought' in p)) {
        const t: string = p.text;
        expect(t).toBe('hello');
        seenText = true;
      } else if ('inlineData' in p && p.inlineData) {
        const mt: string = p.inlineData.mimeType;
        expect(mt).toBe('image/png');
        seenInline = true;
      } else if ('functionCall' in p && p.functionCall) {
        const name: string = p.functionCall.name;
        expect(name).toBe('lookup');
        seenFnCall = true;
      } else if ('codeExecutionResult' in p && p.codeExecutionResult) {
        expect(p.codeExecutionResult.outcome).toBe('OUTCOME_OK');
        seenCodeResult = true;
      } else if ('thought' in p && p.thought !== undefined) {
        const flag: boolean = p.thought;
        expect(flag).toBe(true);
        seenThought = true;
      }
    }
    expect(seenText).toBe(true);
    expect(seenInline).toBe(true);
    expect(seenFnCall).toBe(true);
    expect(seenCodeResult).toBe(true);
    expect(seenThought).toBe(true);
  });

  it('open GeminiPart absorbs unmodelled future part variants', () => {
    const future: GeminiPart = { newPartKey: { foo: 'bar' } };
    expect((future as { newPartKey?: { foo: string } }).newPartKey?.foo).toBe('bar');
  });

  it('streaming chunks reuse GenerateContentResponse with tightened parts', () => {
    // A streaming chunk is structurally a partial GenerateContentResponse —
    // each candidate's content.parts[] uses the new GeminiPart union.
    const chunk: GenerateContentResponse = {
      candidates: [
        {
          content: {
            role: 'model',
            parts: [
              { text: 'partial' } satisfies GeminiTextPart,
              {
                functionCall: { name: 'lookup', args: { q: 'sf' } },
              } satisfies GeminiFunctionCallPart,
            ],
          },
          index: 0,
        },
      ],
    };
    expect(chunk.candidates?.[0].content?.parts?.length).toBe(2);
  });

  it('@ts-expect-error: invalid Gemini known parts are rejected', () => {
    // @ts-expect-error — text must be a string, not a number
    const _bad1: GeminiTextPart = { text: 42 };
    // @ts-expect-error — functionCall must include `name`
    const _bad2: GeminiFunctionCallPart = { functionCall: {} };
    // prettier-ignore
    // @ts-expect-error — text part must not also carry inlineData
    const _bad3: GeminiTextPart = { text: 'hi', inlineData: { mimeType: 'image/png', data: '' } };
    expect([_bad1, _bad2, _bad3]).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Responses streaming events
// ─────────────────────────────────────────────────────────────────────────────

describe('OpenAI Responses streaming-event types', () => {
  const baseResponse: ResponseObject = {
    id: 'resp_1',
    object: 'response',
    created_at: 1,
    status: 'in_progress',
    error: null,
    incomplete_details: null,
    instructions: null,
    max_output_tokens: null,
    model: 'gpt-4o-mini',
    output: [],
  };

  it('top-level unions are exported from src/types/responses and the package index', () => {
    const open: ResponseStreamEvent = { type: 'response.created', response: baseResponse };
    const known: KnownResponseStreamEvent = {
      type: 'response.output_text.delta',
      output_index: 0,
      content_index: 0,
      delta: 'hi',
    };
    const unknown: UnknownResponseStreamEvent = { type: 'response.future', any: 1 };
    const pub: PublicResponseStreamEvent = {
      type: 'response.output_text.done',
      output_index: 0,
      content_index: 0,
      text: 'hello',
    };
    const pubKnown: PublicKnownResponseStreamEvent = {
      type: 'response.audio.done',
    };
    const common: ResponseStreamEventCommon = { type: 'response.in_progress', event_id: 'evt_1' };
    expect(open.type).toBe('response.created');
    expect(known.type).toBe('response.output_text.delta');
    expect(unknown.any).toBe(1);
    expect(pub.type).toBe('response.output_text.done');
    expect(pubKnown.type).toBe('response.audio.done');
    expect(common.event_id).toBe('evt_1');
  });

  it('exhaustive `switch` narrows KnownResponseStreamEvent', () => {
    const events: KnownResponseStreamEvent[] = [
      { type: 'response.created', response: baseResponse } satisfies ResponseCreatedEvent,
      {
        type: 'response.in_progress',
        response: baseResponse,
      } satisfies ResponseInProgressEvent,
      {
        type: 'response.completed',
        response: { ...baseResponse, status: 'completed' },
      } satisfies ResponseCompletedEvent,
      {
        type: 'response.failed',
        response: { ...baseResponse, status: 'failed' },
      } satisfies ResponseFailedEvent,
      {
        type: 'response.incomplete',
        response: { ...baseResponse, status: 'incomplete' },
      } satisfies ResponseIncompleteEvent,
      {
        type: 'response.output_item.added',
        output_index: 0,
        item: {
          type: 'message',
          id: 'msg_1',
          status: 'in_progress',
          role: 'assistant',
          content: [],
        },
      } satisfies ResponseOutputItemAddedEvent,
      {
        type: 'response.output_item.done',
        output_index: 0,
        item: {
          type: 'message',
          id: 'msg_1',
          status: 'completed',
          role: 'assistant',
          content: [],
        },
      } satisfies ResponseOutputItemDoneEvent,
      {
        type: 'response.content_part.added',
        output_index: 0,
        content_index: 0,
        part: { type: 'output_text', text: '' },
      } satisfies ResponseContentPartAddedEvent,
      {
        type: 'response.content_part.done',
        output_index: 0,
        content_index: 0,
        part: { type: 'output_text', text: 'done' },
      } satisfies ResponseContentPartDoneEvent,
      {
        type: 'response.output_text.delta',
        output_index: 0,
        content_index: 0,
        delta: 'he',
      } satisfies ResponseOutputTextDeltaEvent,
      {
        type: 'response.output_text.done',
        output_index: 0,
        content_index: 0,
        text: 'hello',
      } satisfies ResponseOutputTextDoneEvent,
      {
        type: 'response.refusal.delta',
        output_index: 0,
        content_index: 0,
        delta: 'no',
      } satisfies ResponseRefusalDeltaEvent,
      {
        type: 'response.refusal.done',
        output_index: 0,
        content_index: 0,
        refusal: 'sorry',
      } satisfies ResponseRefusalDoneEvent,
      {
        type: 'response.function_call_arguments.delta',
        output_index: 0,
        delta: '{"a',
      } satisfies ResponseFunctionCallArgumentsDeltaEvent,
      {
        type: 'response.function_call_arguments.done',
        output_index: 0,
        arguments: '{"a":1}',
      } satisfies ResponseFunctionCallArgumentsDoneEvent,
      {
        type: 'response.file_search_call.in_progress',
        output_index: 0,
      } satisfies ResponseFileSearchCallInProgressEvent,
      {
        type: 'response.file_search_call.searching',
        output_index: 0,
      } satisfies ResponseFileSearchCallSearchingEvent,
      {
        type: 'response.file_search_call.completed',
        output_index: 0,
      } satisfies ResponseFileSearchCallCompletedEvent,
      {
        type: 'response.web_search_call.in_progress',
        output_index: 0,
      } satisfies ResponseWebSearchCallInProgressEvent,
      {
        type: 'response.web_search_call.searching',
        output_index: 0,
      } satisfies ResponseWebSearchCallSearchingEvent,
      {
        type: 'response.web_search_call.completed',
        output_index: 0,
      } satisfies ResponseWebSearchCallCompletedEvent,
      {
        type: 'response.image_generation_call.partial_image',
        output_index: 0,
        partial_image_b64: 'b64',
        partial_image_index: 0,
      } satisfies ResponseImageGenerationCallPartialImageEvent,
      {
        type: 'response.image_generation_call.completed',
        output_index: 0,
      } satisfies ResponseImageGenerationCallCompletedEvent,
      {
        type: 'response.audio.delta',
        delta: 'b64==',
      } satisfies ResponseAudioDeltaEvent,
      { type: 'response.audio.done' } satisfies ResponseAudioDoneEvent,
      {
        type: 'response.audio_transcript.delta',
        delta: 'h',
      } satisfies ResponseAudioTranscriptDeltaEvent,
      {
        type: 'response.audio_transcript.done',
        transcript: 'hi',
      } satisfies ResponseAudioTranscriptDoneEvent,
      {
        type: 'response.error',
        error: { message: 'boom', code: 'rate_limited' },
      } satisfies ResponseErrorEvent,
    ];

    let textDeltaSeen = false;
    let errorSeen = false;
    let fnArgsDoneSeen = false;
    let audioDoneSeen = false;

    for (const ev of events) {
      switch (ev.type) {
        case 'response.created':
        case 'response.in_progress':
        case 'response.completed':
        case 'response.failed':
        case 'response.incomplete': {
          const r: ResponseObject = ev.response;
          expect(r.id).toBe('resp_1');
          break;
        }
        case 'response.output_item.added':
        case 'response.output_item.done':
          expect(typeof ev.output_index).toBe('number');
          break;
        case 'response.content_part.added':
        case 'response.content_part.done': {
          const part: ResponseContentPart = ev.part;
          expect(typeof part.type).toBe('string');
          break;
        }
        case 'response.output_text.delta': {
          const d: string = ev.delta;
          expect(d).toBe('he');
          textDeltaSeen = true;
          break;
        }
        case 'response.output_text.done':
          expect(ev.text).toBe('hello');
          break;
        case 'response.refusal.delta':
          expect(ev.delta).toBe('no');
          break;
        case 'response.refusal.done':
          expect(ev.refusal).toBe('sorry');
          break;
        case 'response.function_call_arguments.delta':
          expect(ev.delta.startsWith('{')).toBe(true);
          break;
        case 'response.function_call_arguments.done':
          expect(ev.arguments).toBe('{"a":1}');
          fnArgsDoneSeen = true;
          break;
        case 'response.file_search_call.in_progress':
        case 'response.file_search_call.searching':
        case 'response.file_search_call.completed':
        case 'response.web_search_call.in_progress':
        case 'response.web_search_call.searching':
        case 'response.web_search_call.completed':
          expect(typeof ev.output_index).toBe('number');
          break;
        case 'response.image_generation_call.partial_image':
          expect(typeof ev.partial_image_b64).toBe('string');
          break;
        case 'response.image_generation_call.completed':
          expect(typeof ev.output_index).toBe('number');
          break;
        case 'response.audio.delta':
          expect(typeof ev.delta).toBe('string');
          break;
        case 'response.audio.done':
          audioDoneSeen = true;
          break;
        case 'response.audio_transcript.delta':
          expect(typeof ev.delta).toBe('string');
          break;
        case 'response.audio_transcript.done':
          expect(ev.transcript).toBe('hi');
          break;
        case 'response.error': {
          const err: { message: string; type?: string; code?: string } = ev.error;
          expect(err.message).toBe('boom');
          errorSeen = true;
          break;
        }
        default: {
          const _exhaustive: never = ev;
          throw new Error(`unexpected event ${JSON.stringify(_exhaustive)}`);
        }
      }
    }
    expect(textDeltaSeen).toBe(true);
    expect(errorSeen).toBe(true);
    expect(fnArgsDoneSeen).toBe(true);
    expect(audioDoneSeen).toBe(true);
  });

  it('open ResponseStreamEvent absorbs unknown future event types', () => {
    const future: ResponseStreamEvent = {
      type: 'response.brand_new_event',
      surprise: 'value',
    };
    expect(future.type).toBe('response.brand_new_event');
    const fallback: UnknownResponseStreamEvent = { type: 'x', y: 1 };
    expect(fallback.y).toBe(1);
  });

  it('@ts-expect-error: invalid Responses event literals are rejected', () => {
    // prettier-ignore
    // @ts-expect-error — `delta` is required on response.output_text.delta
    const _bad1: ResponseOutputTextDeltaEvent = { type: 'response.output_text.delta', output_index: 0, content_index: 0 };
    // prettier-ignore
    // @ts-expect-error — type literal mismatch
    const _bad2: ResponseCreatedEvent = { type: 'response.completed', response: baseResponse };
    // @ts-expect-error — `error` is required on the error event
    const _bad3: ResponseErrorEvent = { type: 'response.error' };
    expect([_bad1, _bad2, _bad3]).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Chat completion delta — verify the existing delta is still exhaustive enough
// ─────────────────────────────────────────────────────────────────────────────

describe('Chat completion chunk delta', () => {
  it('accepts every documented delta variant', () => {
    const roleOnly: ChatCompletionChunkDelta = { role: 'assistant' };
    const textDelta: ChatCompletionChunkDelta = { content: 'hello' };
    const refusalDelta: ChatCompletionChunkDelta = { refusal: 'no' };
    const toolCallDelta: ChatCompletionChunkDelta = {
      tool_calls: [
        {
          index: 0,
          id: 'call_1',
          type: 'function',
          function: { name: 'lookup', arguments: '{"q":' },
        },
      ],
    };
    const legacyFnCallDelta: ChatCompletionChunkDelta = {
      function_call: { name: 'lookup', arguments: '{"q":1}' },
    };
    const samples: ChatCompletionChunkDelta[] = [
      roleOnly,
      textDelta,
      refusalDelta,
      toolCallDelta,
      legacyFnCallDelta,
    ];
    expect(samples).toHaveLength(5);
  });

  it('plugs into ChatCompletionChunk choices.delta', () => {
    const chunk: ChatCompletionChunk = {
      id: 'chatcmpl_1',
      object: 'chat.completion.chunk',
      created: 0,
      model: 'gpt-4o-mini',
      choices: [
        { index: 0, delta: { content: 'hi' }, finish_reason: null },
      ],
    };
    expect(chunk.choices[0].delta.content).toBe('hi');
  });
});
