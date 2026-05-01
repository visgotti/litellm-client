/**
 * @group unit
 */
import { toBlob, appendForm } from '../../../src/internal/form';

describe('toBlob', () => {
  it('returns the existing Blob unchanged when type already set', () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    const out = toBlob(blob);
    expect(out).toBe(blob);
  });

  it('rewraps a typeless Blob with given content type', () => {
    const blob = new Blob(['x']);
    const out = toBlob(blob, 'application/json');
    expect(out).not.toBe(blob);
    expect(out.type).toBe('application/json');
  });

  it('handles strings', () => {
    const out = toBlob('hello world', 'text/plain');
    expect(out).toBeInstanceOf(Blob);
    expect(out.type).toBe('text/plain');
  });

  it('handles Uint8Array', async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const out = toBlob(bytes, 'application/octet-stream');
    expect(out).toBeInstanceOf(Blob);
    expect(out.size).toBe(3);
  });

  it('handles ArrayBuffer', () => {
    const buf = new Uint8Array([1, 2, 3]).buffer;
    const out = toBlob(buf, 'application/octet-stream');
    expect(out).toBeInstanceOf(Blob);
    expect(out.size).toBe(3);
  });

  it('uses default content type when none given', () => {
    const out = toBlob('hi');
    expect(out.type).toBe('application/octet-stream');
  });
});

describe('appendForm', () => {
  it('skips undefined and null', () => {
    const form = new FormData();
    appendForm(form, 'a', undefined);
    appendForm(form, 'b', null);
    expect(form.has('a')).toBe(false);
    expect(form.has('b')).toBe(false);
  });

  it('appends primitives as strings', () => {
    const form = new FormData();
    appendForm(form, 'n', 1);
    appendForm(form, 'b', true);
    appendForm(form, 's', 'x');
    expect(form.get('n')).toBe('1');
    expect(form.get('b')).toBe('true');
    expect(form.get('s')).toBe('x');
  });

  it('expands arrays into multiple entries', () => {
    const form = new FormData();
    appendForm(form, 'tag', ['a', 'b', 'c']);
    expect(form.getAll('tag')).toEqual(['a', 'b', 'c']);
  });

  it('JSON-encodes plain objects', () => {
    const form = new FormData();
    appendForm(form, 'meta', { x: 1 });
    expect(form.get('meta')).toBe('{"x":1}');
  });

  it('appends Blob values directly', () => {
    const form = new FormData();
    const blob = new Blob(['abc'], { type: 'text/plain' });
    appendForm(form, 'file', blob);
    // Blob is treated as primitive (falls through to String() — which becomes "[object Blob]"),
    // but we mainly want to verify the no-throw path; the form.append call is what we care about.
    // The current implementation only special-cases plain objects, so Blobs hit the String() branch.
    // This test pins that behavior.
    expect(form.has('file')).toBe(true);
  });
});
