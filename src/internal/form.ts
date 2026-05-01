// ─────────────────────────────────────────────────────────────────────────────
// Internal multipart helpers shared by resource classes that send
// `multipart/form-data` (audio uploads, file uploads, image edits/variations,
// container files, anthropic skills, video character refs, OCR uploads).
// Not part of the public API surface — exported only for cross-resource reuse.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Acceptable shapes for a binary file input. Resources that take file uploads
 * accept any of these and the SDK normalises them to a `Blob` internally.
 */
export type BinaryInput = ArrayBuffer | Uint8Array | Blob | string;

/**
 * Normalise a binary input into a `Blob` suitable for `FormData.append`.
 *
 * - `Blob` is passed through (with `type` injected if missing).
 * - `string` is wrapped as a text Blob with the given content type.
 * - `Uint8Array` is copied into a fresh array first so its buffer isn't a
 *   `SharedArrayBuffer` (which `Blob` rejects on some runtimes).
 * - `ArrayBuffer` is wrapped directly.
 *
 * @param data - The binary payload.
 * @param contentType - Defaults to `'application/octet-stream'`.
 */
export function toBlob(
  data: BinaryInput,
  contentType: string = 'application/octet-stream',
): Blob {
  if (data instanceof Blob) {
    if (contentType && !data.type) return new Blob([data], { type: contentType });
    return data;
  }
  if (typeof data === 'string') {
    return new Blob([data], { type: contentType });
  }
  if (data instanceof Uint8Array) {
    // Copy into a fresh Uint8Array so the underlying buffer isn't a SharedArrayBuffer.
    return new Blob([new Uint8Array(data)], { type: contentType });
  }
  return new Blob([data], { type: contentType });
}

/**
 * Append a value to a `FormData` with type-aware serialisation.
 *
 * - `undefined` / `null` values are skipped (so optional params can be passed
 *   blindly without polluting the form).
 * - Arrays are appended as repeated keys (`key=v1&key=v2`).
 * - Objects (other than `Blob`) are JSON-stringified.
 * - Everything else is coerced via `String(value)`.
 *
 * @param form - Target `FormData`.
 * @param key - Field name (use bracketed forms like `'tags[]'` for arrays
 *   on endpoints that require them).
 * @param value - The value to append.
 */
export function appendForm(
  form: FormData,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const v of value) appendForm(form, key, v);
    return;
  }
  if (typeof value === 'object' && !(value instanceof Blob)) {
    form.append(key, JSON.stringify(value));
    return;
  }
  form.append(key, String(value));
}
