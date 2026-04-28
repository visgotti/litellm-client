// ─────────────────────────────────────────────────────────────────────────────
// Server-Sent Events (SSE) stream parser for OpenAI-compatible streaming
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse an SSE response body into an async iterable of typed events.
 * Handles the OpenAI streaming format:
 *   data: {json}
 *   data: [DONE]
 */
export async function* parseSSEStream<T = unknown>(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<T> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') continue;
        if (trimmed.startsWith(':')) continue; // SSE comment

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') return;

          try {
            yield JSON.parse(data) as T;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    if (buffer.trim().startsWith('data: ')) {
      const data = buffer.trim().slice(6);
      if (data !== '[DONE]') {
        try {
          yield JSON.parse(data) as T;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Wraps an async iterable to add a controller that can abort the stream.
 */
export class Stream<T> implements AsyncIterable<T> {
  private iterator: AsyncIterable<T>;
  private controller: AbortController;

  constructor(iterator: AsyncIterable<T>, controller: AbortController) {
    this.iterator = iterator;
    this.controller = controller;
  }

  abort(): void {
    this.controller.abort();
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.iterator[Symbol.asyncIterator]();
  }

  /** Drain the stream into an array. */
  async toArray(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }
}
