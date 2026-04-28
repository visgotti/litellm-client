/**
 * @group unit
 */
import { parseSSEStream, Stream } from '../../src/streaming';

interface TestChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: { content?: string };
    finish_reason: string | null;
  }>;
}

function createReadableStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe('Streaming', () => {
  describe('parseSSEStream', () => {
    it('parses a simple SSE stream', async () => {
      const stream = createReadableStream([
        'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":"Hi"},"finish_reason":null}]}\n\n',
        'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ]);

      const chunks: TestChunk[] = [];
      for await (const chunk of parseSSEStream<TestChunk>(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].choices[0].delta.content).toBe('Hi');
      expect(chunks[1].choices[0].delta.content).toBe(' there');
    });

    it('handles chunks split across boundaries', async () => {
      const stream = createReadableStream([
        'data: {"id":"1","object":"chat.com',
        'pletion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":"split"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ]);

      const chunks: TestChunk[] = [];
      for await (const chunk of parseSSEStream<TestChunk>(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0].choices[0].delta.content).toBe('split');
    });

    it('ignores SSE comments', async () => {
      const stream = createReadableStream([
        ':comment\n',
        'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":"ok"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ]);

      const chunks = [];
      for await (const chunk of parseSSEStream(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
    });

    it('skips malformed JSON lines', async () => {
      const stream = createReadableStream([
        'data: not-json\n\n',
        'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":"ok"},"finish_reason":null}]}\n\n',
        'data: [DONE]\n\n',
      ]);

      const chunks = [];
      for await (const chunk of parseSSEStream(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
    });

    it('handles empty stream', async () => {
      const stream = createReadableStream(['data: [DONE]\n\n']);
      const chunks = [];
      for await (const chunk of parseSSEStream(stream)) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(0);
    });

    it('processes remaining buffer data without trailing newline', async () => {
      // Data that doesn't end with newline — hits the post-loop buffer path
      const stream = createReadableStream([
        'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":"buffered"},"finish_reason":"stop"}]}',
      ]);

      const chunks: TestChunk[] = [];
      for await (const chunk of parseSSEStream<TestChunk>(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0].choices[0].delta.content).toBe('buffered');
    });

    it('handles [DONE] in remaining buffer', async () => {
      const stream = createReadableStream([
        'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":"ok"},"finish_reason":null}]}\n',
        'data: [DONE]',
      ]);

      const chunks: TestChunk[] = [];
      for await (const chunk of parseSSEStream<TestChunk>(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0].choices[0].delta.content).toBe('ok');
    });

    it('skips malformed JSON in remaining buffer', async () => {
      const stream = createReadableStream([
        'data: not-valid-json',
      ]);

      const chunks = [];
      for await (const chunk of parseSSEStream(stream)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(0);
    });
  });

  describe('Stream', () => {
    it('is an async iterable', async () => {
      async function* gen() {
        yield 'a';
        yield 'b';
      }
      const s = new Stream(gen(), new AbortController());
      const values = [];
      for await (const v of s) {
        values.push(v);
      }
      expect(values).toEqual(['a', 'b']);
    });

    it('abort() signals the controller', () => {
      async function* gen(): AsyncIterable<string> {
        yield 'a';
      }
      const controller = new AbortController();
      const s = new Stream(gen(), controller);
      expect(controller.signal.aborted).toBe(false);
      s.abort();
      expect(controller.signal.aborted).toBe(true);
    });
  });
});
