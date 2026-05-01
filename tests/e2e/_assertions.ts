/**
 * Strict assertion helpers for e2e tests.
 *
 * Replaces the old `eitherOrStructuredError` pattern, which accepted ANY
 * truthy outcome (including raw TypeErrors from broken request marshalling
 * or undefined property access). Those helpers asserted nothing.
 *
 * Every test commits to ONE outcome:
 *   - expectShape(p, shape)         — call MUST succeed, response MUST match shape
 *   - expectTypedError(p, status)   — call MUST reject with a LiteLLMError whose
 *                                     status equals `status`
 *
 * In both forms, a non-LiteLLMError failure (TypeError, ConnectionError,
 * timeout, anything thrown synchronously by the SDK) FAILS the test —
 * a regression in request marshalling must produce a red test.
 *
 * There is intentionally no "either succeed or fail" helper. If a test can
 * legitimately go either way, the test environment is wrong, not the test.
 */

import { LiteLLMError } from '../../src/errors';

/** Assert the call resolved AND the result matches the given shape. */
export async function expectShape<T>(
  p: Promise<T>,
  shape: object,
): Promise<T> {
  const r = await p;
  expect(r).toMatchObject(shape);
  return r;
}

/**
 * Assert the call rejected with a typed LiteLLMError whose status equals
 * `expectedStatus`. Native JS errors (TypeError, ConnectionError, etc.)
 * fail the test.
 */
export async function expectTypedError(
  p: Promise<unknown>,
  expectedStatus: number,
): Promise<LiteLLMError> {
  let caught: unknown;
  let resolved = false;
  let value: unknown;
  try {
    value = await p;
    resolved = true;
  } catch (err) {
    caught = err;
  }
  if (resolved) {
    throw new Error(
      `Expected request to throw a LiteLLMError with status ${expectedStatus}, but it succeeded with: ${safePreview(
        value,
      )}`,
    );
  }
  if (!(caught instanceof LiteLLMError)) {
    throw caught instanceof Error ? caught : new Error(String(caught));
  }
  if (caught.status !== expectedStatus) {
    throw new Error(
      `Expected LiteLLMError status ${expectedStatus}, got ${caught.status} — message: ${caught.message}`,
    );
  }
  return caught;
}

function safePreview(v: unknown): string {
  try {
    const s = JSON.stringify(v);
    return s.length > 200 ? `${s.slice(0, 200)}…` : s;
  } catch {
    return String(v);
  }
}
