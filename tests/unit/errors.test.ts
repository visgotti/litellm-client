/**
 * @group unit
 */
import {
  LiteLLMProxyError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
  ConnectionError,
  TimeoutError,
  buildError,
} from '../../src/errors';

describe('Errors', () => {
  const emptyHeaders = new Headers();

  describe('buildError', () => {
    it('returns AuthenticationError for 401', () => {
      const err = buildError(401, emptyHeaders, { error: { message: 'bad key' } });
      expect(err).toBeInstanceOf(AuthenticationError);
      expect(err.status).toBe(401);
      expect(err.message).toBe('bad key');
    });

    it('returns PermissionDeniedError for 403', () => {
      const err = buildError(403, emptyHeaders, null);
      expect(err).toBeInstanceOf(PermissionDeniedError);
      expect(err.status).toBe(403);
    });

    it('returns NotFoundError for 404', () => {
      const err = buildError(404, emptyHeaders, { detail: 'not found' });
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toBe('not found');
    });

    it('returns RateLimitError for 429', () => {
      const err = buildError(429, emptyHeaders, null);
      expect(err).toBeInstanceOf(RateLimitError);
      expect(err.status).toBe(429);
    });

    it('returns InternalServerError for 5xx', () => {
      const err = buildError(502, emptyHeaders, null);
      expect(err).toBeInstanceOf(InternalServerError);
      expect(err.status).toBe(502);
    });

    it('returns generic LiteLLMProxyError for other codes', () => {
      const err = buildError(422, emptyHeaders, { error: { message: 'validation' } });
      expect(err).toBeInstanceOf(LiteLLMProxyError);
      expect(err.status).toBe(422);
      expect(err.message).toBe('validation');
    });

    it('falls back to detail when error.message is missing', () => {
      const err = buildError(400, emptyHeaders, { detail: 'bad request detail' });
      expect(err.message).toBe('bad request detail');
    });

    it('falls back to HTTP status when body is null', () => {
      const err = buildError(418, emptyHeaders, null);
      expect(err.message).toBe('HTTP 418');
    });
  });

  describe('ConnectionError', () => {
    it('stores cause', () => {
      const cause = new TypeError('fetch failed');
      const err = new ConnectionError('Network error', cause);
      expect(err.name).toBe('ConnectionError');
      expect(err.cause).toBe(cause);
    });
  });

  describe('TimeoutError', () => {
    it('has default message', () => {
      const err = new TimeoutError();
      expect(err.message).toBe('Request timed out');
    });

    it('accepts custom message', () => {
      const err = new TimeoutError('custom');
      expect(err.message).toBe('custom');
    });
  });
});
