/**
 * @group unit
 *
 * Compile-time / shape tests for the Realtime event protocol types.
 *
 * The Realtime types are pure type definitions — there is no runtime to
 * exercise. The "tests" below ensure:
 *   1. Every top-level interface and union exports from `src/types/realtime`
 *      and from the public package entrypoint.
 *   2. The `type` discriminator narrows `RealtimeKnownClientEvent` /
 *      `RealtimeKnownServerEvent` correctly inside a `switch`.
 *   3. The open `RealtimeClientEvent` / `RealtimeServerEvent` unions accept
 *      arbitrary future event types without a cast.
 */
import type {
  // Supporting shapes
  RealtimeSession,
  RealtimeConversationItem,
  RealtimeContent,
  RealtimeResponse,
  RealtimeError,
  RealtimeRateLimit,
  RealtimeTool,
  RealtimeTurnDetection,
  RealtimeInputAudioTranscription,
  RealtimeEventCommon,
  // Client events — strict + open
  RealtimeKnownClientEvent,
  RealtimeClientEvent,
  RealtimeUnknownClientEvent,
  RealtimeSessionUpdateEvent,
  RealtimeInputAudioBufferAppendEvent,
  RealtimeInputAudioBufferCommitEvent,
  RealtimeInputAudioBufferClearEvent,
  RealtimeConversationItemCreateEvent,
  RealtimeConversationItemTruncateEvent,
  RealtimeConversationItemDeleteEvent,
  RealtimeResponseCreateEvent,
  RealtimeResponseCancelEvent,
  // Server events — strict + open
  RealtimeKnownServerEvent,
  RealtimeServerEvent,
  RealtimeUnknownServerEvent,
  RealtimeSessionCreatedEvent,
  RealtimeSessionUpdatedEvent,
  RealtimeConversationCreatedEvent,
  RealtimeConversationItemCreatedEvent,
  RealtimeConversationItemInputAudioTranscriptionCompletedEvent,
  RealtimeConversationItemInputAudioTranscriptionFailedEvent,
  RealtimeConversationItemTruncatedEvent,
  RealtimeConversationItemDeletedEvent,
  RealtimeInputAudioBufferCommittedEvent,
  RealtimeInputAudioBufferClearedEvent,
  RealtimeInputAudioBufferSpeechStartedEvent,
  RealtimeInputAudioBufferSpeechStoppedEvent,
  RealtimeResponseCreatedEvent,
  RealtimeResponseDoneEvent,
  RealtimeResponseOutputItemAddedEvent,
  RealtimeResponseOutputItemDoneEvent,
  RealtimeResponseContentPartAddedEvent,
  RealtimeResponseContentPartDoneEvent,
  RealtimeResponseTextDeltaEvent,
  RealtimeResponseTextDoneEvent,
  RealtimeResponseAudioTranscriptDeltaEvent,
  RealtimeResponseAudioTranscriptDoneEvent,
  RealtimeResponseAudioDeltaEvent,
  RealtimeResponseAudioDoneEvent,
  RealtimeResponseFunctionCallArgumentsDeltaEvent,
  RealtimeResponseFunctionCallArgumentsDoneEvent,
  RealtimeRateLimitsUpdatedEvent,
  RealtimeErrorEvent,
  // Catch-all
  RealtimeEvent,
} from '../../../src/types/realtime';

// Confirm the public entry-point re-exports the unions too. Pure type imports.
import type {
  RealtimeClientEvent as PublicClientEvent,
  RealtimeServerEvent as PublicServerEvent,
  RealtimeEvent as PublicRealtimeEvent,
  RealtimeKnownClientEvent as PublicKnownClient,
  RealtimeKnownServerEvent as PublicKnownServer,
} from '../../../src/index';

describe('Realtime event protocol types', () => {
  it('top-level unions are exported from src/types/realtime', () => {
    // Assigning a typed value forces the compiler to resolve every union
    // member. If any import above were broken, `npm run lint` would fail.
    const client: RealtimeClientEvent = {
      type: 'session.update',
      session: { instructions: 'hi' },
    };
    const server: RealtimeServerEvent = { type: 'session.created', session: {} };
    const any: RealtimeEvent = client;
    expect(client.type).toBe('session.update');
    expect(server.type).toBe('session.created');
    expect(any).toBe(client);
  });

  it('top-level unions are also re-exported from the package index', () => {
    const client: PublicClientEvent = { type: 'response.cancel' };
    const server: PublicServerEvent = {
      type: 'response.text.delta',
      response_id: 'r1',
      item_id: 'i1',
      output_index: 0,
      content_index: 0,
      delta: 'hi',
    };
    const any: PublicRealtimeEvent = server;
    const known: PublicKnownClient = { type: 'response.cancel' };
    const knownServer: PublicKnownServer = { type: 'input_audio_buffer.cleared' };
    expect(client.type).toBe('response.cancel');
    expect(any).toBe(server);
    expect(known.type).toBe('response.cancel');
    expect(knownServer.type).toBe('input_audio_buffer.cleared');
  });

  it('discriminator narrows RealtimeKnownClientEvent in a switch', () => {
    const events: RealtimeKnownClientEvent[] = [
      { type: 'session.update', session: { temperature: 0.7 } },
      { type: 'input_audio_buffer.append', audio: 'b64==' },
      { type: 'input_audio_buffer.commit' },
      { type: 'input_audio_buffer.clear' },
      {
        type: 'conversation.item.create',
        item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'hi' }] },
      },
      { type: 'conversation.item.truncate', item_id: 'x', content_index: 0, audio_end_ms: 100 },
      { type: 'conversation.item.delete', item_id: 'x' },
      { type: 'response.create', response: { modalities: ['text'] } },
      { type: 'response.cancel' },
    ];

    let visited = 0;
    for (const ev of events) {
      visited += 1;
      switch (ev.type) {
        case 'session.update': {
          // Narrowed to RealtimeSessionUpdateEvent.
          const s: RealtimeSession = ev.session;
          expect(typeof s).toBe('object');
          break;
        }
        case 'input_audio_buffer.append': {
          const audio: string = ev.audio;
          expect(typeof audio).toBe('string');
          break;
        }
        case 'input_audio_buffer.commit':
        case 'input_audio_buffer.clear':
        case 'response.cancel':
          expect(typeof ev.type).toBe('string');
          break;
        case 'conversation.item.create': {
          const item: RealtimeConversationItem = ev.item;
          expect(item.type).toBe('message');
          break;
        }
        case 'conversation.item.truncate': {
          const ms: number = ev.audio_end_ms;
          expect(ms).toBe(100);
          break;
        }
        case 'conversation.item.delete': {
          const id: string = ev.item_id;
          expect(id).toBe('x');
          break;
        }
        case 'response.create': {
          const r: RealtimeResponse | undefined = ev.response;
          expect(r?.modalities).toEqual(['text']);
          break;
        }
        default: {
          // Exhaustive check — `ev` should narrow to `never` here.
          const _exhaustive: never = ev;
          throw new Error(`unexpected event ${JSON.stringify(_exhaustive)}`);
        }
      }
    }
    expect(visited).toBe(events.length);
  });

  it('discriminator narrows RealtimeKnownServerEvent in a switch', () => {
    const events: RealtimeKnownServerEvent[] = [
      { type: 'session.created', session: { id: 'sess_1' } },
      { type: 'session.updated', session: { id: 'sess_1' } },
      { type: 'conversation.created', conversation: { id: 'conv_1' } },
      {
        type: 'conversation.item.created',
        item: { id: 'i1', type: 'message', role: 'assistant' },
      },
      {
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: 'i1',
        content_index: 0,
        transcript: 'hello',
      },
      {
        type: 'conversation.item.input_audio_transcription.failed',
        item_id: 'i1',
        content_index: 0,
        error: { message: 'whisper down' },
      },
      { type: 'conversation.item.truncated', item_id: 'i1', content_index: 0, audio_end_ms: 0 },
      { type: 'conversation.item.deleted', item_id: 'i1' },
      { type: 'input_audio_buffer.committed', item_id: 'i1' },
      { type: 'input_audio_buffer.cleared' },
      { type: 'input_audio_buffer.speech_started', audio_start_ms: 0, item_id: 'i1' },
      { type: 'input_audio_buffer.speech_stopped', audio_end_ms: 100, item_id: 'i1' },
      { type: 'response.created', response: { id: 'r1' } },
      { type: 'response.done', response: { id: 'r1', status: 'completed' } },
      {
        type: 'response.output_item.added',
        response_id: 'r1',
        output_index: 0,
        item: { id: 'i2', type: 'message' },
      },
      {
        type: 'response.output_item.done',
        response_id: 'r1',
        output_index: 0,
        item: { id: 'i2', type: 'message' },
      },
      {
        type: 'response.content_part.added',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        part: { type: 'text', text: '' },
      },
      {
        type: 'response.content_part.done',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        part: { type: 'text', text: 'done' },
      },
      {
        type: 'response.text.delta',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        delta: 'he',
      },
      {
        type: 'response.text.done',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        text: 'hello',
      },
      {
        type: 'response.audio_transcript.delta',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        delta: 'h',
      },
      {
        type: 'response.audio_transcript.done',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        transcript: 'hello',
      },
      {
        type: 'response.audio.delta',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
        delta: 'b64==',
      },
      {
        type: 'response.audio.done',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        content_index: 0,
      },
      {
        type: 'response.function_call_arguments.delta',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        call_id: 'c1',
        delta: '{"a',
      },
      {
        type: 'response.function_call_arguments.done',
        response_id: 'r1',
        item_id: 'i2',
        output_index: 0,
        call_id: 'c1',
        arguments: '{"a":1}',
      },
      {
        type: 'rate_limits.updated',
        rate_limits: [{ name: 'tokens', limit: 1000, remaining: 990, reset_seconds: 60 }],
      },
      { type: 'error', error: { type: 'guardrail_error', message: 'blocked' } },
    ];

    let seenError = false;
    let seenRateLimits = false;
    let seenTextDelta = false;
    let seenAudioDelta = false;
    let seenFnArgs = false;
    for (const ev of events) {
      switch (ev.type) {
        case 'session.created':
        case 'session.updated': {
          const s: RealtimeSession = ev.session;
          expect(typeof s).toBe('object');
          break;
        }
        case 'response.text.delta': {
          const d: string = ev.delta;
          expect(typeof d).toBe('string');
          seenTextDelta = true;
          break;
        }
        case 'response.audio.delta': {
          const d: string = ev.delta;
          expect(typeof d).toBe('string');
          seenAudioDelta = true;
          break;
        }
        case 'response.function_call_arguments.done': {
          const args: string = ev.arguments;
          expect(args).toBe('{"a":1}');
          seenFnArgs = true;
          break;
        }
        case 'rate_limits.updated': {
          const limits: RealtimeRateLimit[] = ev.rate_limits;
          expect(limits).toHaveLength(1);
          seenRateLimits = true;
          break;
        }
        case 'error': {
          const err: RealtimeError = ev.error;
          expect(err.type).toBe('guardrail_error');
          seenError = true;
          break;
        }
        default:
          expect(typeof ev.type).toBe('string');
      }
    }
    expect(seenError).toBe(true);
    expect(seenRateLimits).toBe(true);
    expect(seenTextDelta).toBe(true);
    expect(seenAudioDelta).toBe(true);
    expect(seenFnArgs).toBe(true);
  });

  it('open RealtimeClientEvent / RealtimeServerEvent absorb unknown event types without a cast', () => {
    // Forward-compat: an unmodelled `type` literal on either direction is
    // assignable to the open union without a cast — the fallback variant
    // exposes arbitrary fields as `unknown` via its index signature.
    const futureClient: RealtimeClientEvent = {
      type: 'session.future_thing',
      brand_new_field: 42,
    };
    const futureServer: RealtimeServerEvent = {
      type: 'response.something_new',
      payload: { ok: true },
    };
    expect(futureClient.type).toBe('session.future_thing');
    expect(futureServer.type).toBe('response.something_new');

    // The fallback interfaces are exported and usable on their own.
    const unknownClient: RealtimeUnknownClientEvent = { type: 'x', a: 1 };
    const unknownServer: RealtimeUnknownServerEvent = { type: 'y', b: 'two' };
    expect(unknownClient.a).toBe(1);
    expect(unknownServer.b).toBe('two');
  });

  it('supporting shapes accept the documented fields', () => {
    const session: RealtimeSession = {
      modalities: ['text', 'audio'],
      instructions: 'be helpful',
      voice: 'alloy',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: { model: 'whisper-1' } satisfies RealtimeInputAudioTranscription,
      turn_detection: { type: 'server_vad', threshold: 0.5 } satisfies RealtimeTurnDetection,
      tools: [
        {
          type: 'function',
          name: 'get_weather',
          description: 'Get weather',
          parameters: { type: 'object' },
        } satisfies RealtimeTool,
      ],
      tool_choice: 'auto',
      temperature: 0.8,
      max_response_output_tokens: 'inf',
    };
    const content: RealtimeContent = { type: 'input_text', text: 'hi' };
    const item: RealtimeConversationItem = {
      id: 'i1',
      type: 'message',
      status: 'completed',
      role: 'user',
      content: [content],
    };
    const common: RealtimeEventCommon = { type: 'session.update', event_id: 'evt_1' };
    expect(session.voice).toBe('alloy');
    expect(item.content?.[0].text).toBe('hi');
    expect(common.event_id).toBe('evt_1');
  });

  it('@ts-expect-error: invalid type literal on a concrete variant is rejected', () => {
    // Each of the following must be rejected by the compiler. If any of these
    // would compile, `npm run lint` (tsc --noEmit) fails the build.

    // @ts-expect-error — `audio` field is required on input_audio_buffer.append
    const _bad1: RealtimeInputAudioBufferAppendEvent = { type: 'input_audio_buffer.append' };

    // @ts-expect-error — type literal mismatch
    const _bad2: RealtimeSessionUpdateEvent = { type: 'session.created', session: {} };

    // @ts-expect-error — `error` field is required on the error event
    const _bad3: RealtimeErrorEvent = { type: 'error' };

    // @ts-expect-error — RealtimeResponseTextDeltaEvent must include delta
    const _bad4: RealtimeResponseTextDeltaEvent = {
      type: 'response.text.delta',
      response_id: 'r',
      item_id: 'i',
      output_index: 0,
      content_index: 0,
    };

    expect([_bad1, _bad2, _bad3, _bad4]).toHaveLength(4);
  });

  // Touch every other concrete interface with a no-op assignment so unused
  // imports don't trigger lint and so renaming any of them in the source
  // breaks this file (and thus the build).
  it('every concrete event interface compiles with a representative literal', () => {
    const samples: Array<RealtimeClientEvent | RealtimeServerEvent> = [
      { type: 'session.update', session: {} } satisfies RealtimeSessionUpdateEvent,
      {
        type: 'input_audio_buffer.append',
        audio: '',
      } satisfies RealtimeInputAudioBufferAppendEvent,
      { type: 'input_audio_buffer.commit' } satisfies RealtimeInputAudioBufferCommitEvent,
      { type: 'input_audio_buffer.clear' } satisfies RealtimeInputAudioBufferClearEvent,
      {
        type: 'conversation.item.create',
        item: {},
      } satisfies RealtimeConversationItemCreateEvent,
      {
        type: 'conversation.item.truncate',
        item_id: '',
        content_index: 0,
        audio_end_ms: 0,
      } satisfies RealtimeConversationItemTruncateEvent,
      {
        type: 'conversation.item.delete',
        item_id: '',
      } satisfies RealtimeConversationItemDeleteEvent,
      { type: 'response.create' } satisfies RealtimeResponseCreateEvent,
      { type: 'response.cancel' } satisfies RealtimeResponseCancelEvent,
      {
        type: 'session.created',
        session: {},
      } satisfies RealtimeSessionCreatedEvent,
      {
        type: 'session.updated',
        session: {},
      } satisfies RealtimeSessionUpdatedEvent,
      {
        type: 'conversation.created',
        conversation: {},
      } satisfies RealtimeConversationCreatedEvent,
      {
        type: 'conversation.item.created',
        item: {},
      } satisfies RealtimeConversationItemCreatedEvent,
      {
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: '',
        content_index: 0,
        transcript: '',
      } satisfies RealtimeConversationItemInputAudioTranscriptionCompletedEvent,
      {
        type: 'conversation.item.input_audio_transcription.failed',
        item_id: '',
        content_index: 0,
        error: {},
      } satisfies RealtimeConversationItemInputAudioTranscriptionFailedEvent,
      {
        type: 'conversation.item.truncated',
        item_id: '',
        content_index: 0,
        audio_end_ms: 0,
      } satisfies RealtimeConversationItemTruncatedEvent,
      {
        type: 'conversation.item.deleted',
        item_id: '',
      } satisfies RealtimeConversationItemDeletedEvent,
      {
        type: 'input_audio_buffer.committed',
        item_id: '',
      } satisfies RealtimeInputAudioBufferCommittedEvent,
      {
        type: 'input_audio_buffer.cleared',
      } satisfies RealtimeInputAudioBufferClearedEvent,
      {
        type: 'input_audio_buffer.speech_started',
        audio_start_ms: 0,
        item_id: '',
      } satisfies RealtimeInputAudioBufferSpeechStartedEvent,
      {
        type: 'input_audio_buffer.speech_stopped',
        audio_end_ms: 0,
        item_id: '',
      } satisfies RealtimeInputAudioBufferSpeechStoppedEvent,
      {
        type: 'response.created',
        response: {},
      } satisfies RealtimeResponseCreatedEvent,
      {
        type: 'response.done',
        response: {},
      } satisfies RealtimeResponseDoneEvent,
      {
        type: 'response.output_item.added',
        response_id: '',
        output_index: 0,
        item: {},
      } satisfies RealtimeResponseOutputItemAddedEvent,
      {
        type: 'response.output_item.done',
        response_id: '',
        output_index: 0,
        item: {},
      } satisfies RealtimeResponseOutputItemDoneEvent,
      {
        type: 'response.content_part.added',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        part: { type: 'text' },
      } satisfies RealtimeResponseContentPartAddedEvent,
      {
        type: 'response.content_part.done',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        part: { type: 'text' },
      } satisfies RealtimeResponseContentPartDoneEvent,
      {
        type: 'response.text.delta',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        delta: '',
      } satisfies RealtimeResponseTextDeltaEvent,
      {
        type: 'response.text.done',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        text: '',
      } satisfies RealtimeResponseTextDoneEvent,
      {
        type: 'response.audio_transcript.delta',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        delta: '',
      } satisfies RealtimeResponseAudioTranscriptDeltaEvent,
      {
        type: 'response.audio_transcript.done',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        transcript: '',
      } satisfies RealtimeResponseAudioTranscriptDoneEvent,
      {
        type: 'response.audio.delta',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
        delta: '',
      } satisfies RealtimeResponseAudioDeltaEvent,
      {
        type: 'response.audio.done',
        response_id: '',
        item_id: '',
        output_index: 0,
        content_index: 0,
      } satisfies RealtimeResponseAudioDoneEvent,
      {
        type: 'response.function_call_arguments.delta',
        response_id: '',
        item_id: '',
        output_index: 0,
        call_id: '',
        delta: '',
      } satisfies RealtimeResponseFunctionCallArgumentsDeltaEvent,
      {
        type: 'response.function_call_arguments.done',
        response_id: '',
        item_id: '',
        output_index: 0,
        call_id: '',
        arguments: '',
      } satisfies RealtimeResponseFunctionCallArgumentsDoneEvent,
      {
        type: 'rate_limits.updated',
        rate_limits: [],
      } satisfies RealtimeRateLimitsUpdatedEvent,
      { type: 'error', error: {} } satisfies RealtimeErrorEvent,
    ];
    expect(samples.length).toBeGreaterThan(0);
  });
});
