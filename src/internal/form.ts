// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers shared by resource classes.
// ─────────────────────────────────────────────────────────────────────────────

export type BinaryInput = ArrayBuffer | Uint8Array | Blob | string;

/**
 * Convert various binary inputs into a Blob compatible with FormData.
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

/** Append non-null primitive values to a FormData. */
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
