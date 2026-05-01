// ─────────────────────────────────────────────────────────────────────────────
// Server-Sent Events (SSE) stream parser for OpenAI-compatible streaming.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse an SSE response body into an async iterable of typed events.
 *
 * Handles the OpenAI streaming wire format:
 * ```
 * data: {"id":"...","choices":[...]}
 * data: {"id":"...","choices":[...]}
 * data: [DONE]
 * ```
 *
 * `:` comment lines and blank lines are skipped per the SSE spec. Malformed
 * JSON payloads are skipped silently rather than throwing — the upstream
 * provider may emit transient garbage between valid events.
 *
 * @typeParam T - Concrete event shape for the stream (e.g. `ChatCompletionChunk`,
 *   `MessageStreamEvent`, `ResponseStreamEvent`).
 * @param body - The `ReadableStream<Uint8Array>` from `Response.body`.
 * @yields Each successfully-parsed JSON event.
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
 * Async-iterable wrapper around a streaming HTTP response.
 *
 * Returned from streaming SDK methods (e.g. `chat.completions.create({stream:true})`,
 * `responses.create({stream:true})`, `anthropic.messages.create({stream:true})`,
 * `gemini.streamGenerateContent(...)`, `bedrock.converseStream(...)`).
 *
 * Drive iteration with `for await`:
 * ```ts
 * const stream = await client.chat.completions.create({ ..., stream: true });
 * for await (const chunk of stream) {
 *   process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
 * }
 * ```
 *
 * Cancel mid-stream with `stream.abort()` (or by aborting the parent
 * `AbortSignal` you passed via `RequestOptions`). The underlying `fetch` is
 * cancelled and the iterator stops cleanly.
 *
 * @typeParam T - Event shape (`ChatCompletionChunk`, `MessageStreamEvent`, etc.).
 */
export class Stream<T> implements AsyncIterable<T> {
  private iterator: AsyncIterable<T>;
  private controller: AbortController;

  /**
   * @param iterator - Source async iterable (typically from `parseSSEStream`).
   * @param controller - `AbortController` whose `signal` is wired into the
   *   underlying fetch. Calling `abort()` on this stream cancels the request.
   */
  constructor(iterator: AsyncIterable<T>, controller: AbortController) {
    this.iterator = iterator;
    this.controller = controller;
  }

  /** Cancel the underlying HTTP request and stop iteration. */
  abort(): void {
    this.controller.abort();
  }

  /** Standard `AsyncIterable` protocol — enables `for await … of` on the stream. */
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.iterator[Symbol.asyncIterator]();
  }

  /**
   * Drain the entire stream into an array.
   *
   * Convenience for collecting all events when streaming isn't needed for UX
   * but the endpoint only supports streaming. Memory cost grows with stream
   * length — prefer `for await` for long streams.
   */
  async toArray(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }
}
