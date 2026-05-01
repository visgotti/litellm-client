/**
 * @group e2e
 *
 * Project management end-to-end tests.
 *
 * Pinned proxy responses (verified against the configured e2e proxy build):
 *   - GET  /project/list          -> 200 OK, returns []
 *   - GET  /project/info?...nope  -> 404 NotFoundError
 *   - GET  /project/info?id=""    -> 404 NotFoundError (empty id is "not found")
 *   - POST /project/new           -> 403 PermissionDeniedError (enterprise-only)
 *   - POST /project/update        -> 403 PermissionDeniedError (enterprise-only)
 *   - DELETE /project/delete      -> 403 PermissionDeniedError (enterprise-only)
 *
 * The e2e proxy is *not* enterprise-licensed, so mutation endpoints
 * deterministically return 403. Read endpoints (list, info) remain open.
 */

import { LiteLLMClient } from '../../src/client';
import { NotFoundError, PermissionDeniedError } from '../../src/errors';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 30_000,
    maxRetries: 0,
  });
});

describe('Projects (read endpoints)', () => {
  it('list returns 200 with an array body', async () => {
    const result = await client.projects.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('info on a non-existent project returns 404 NotFoundError', async () => {
    expect.assertions(2);
    try {
      await client.projects.info({ project_id: 'e2e-does-not-exist-project' });
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).status).toBe(404);
    }
  });

  it('info called with an empty project_id returns 404 NotFoundError', async () => {
    expect.assertions(2);
    try {
      await client.projects.info();
    } catch (err) {
      // The SDK sends project_id="" which the proxy maps to a "not found"
      // lookup. Confirmed against the e2e build.
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).status).toBe(404);
    }
  });
});

describe('Projects (mutation endpoints — enterprise-gated)', () => {
  it('create returns 403 PermissionDeniedError without enterprise license', async () => {
    expect.assertions(2);
    try {
      await client.projects.create({
        team_id: 'e2e-no-such-team',
        project_alias: 'e2e-test-project',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(PermissionDeniedError);
      expect((err as PermissionDeniedError).status).toBe(403);
    }
  });

  it('update returns 403 PermissionDeniedError without enterprise license', async () => {
    expect.assertions(2);
    try {
      await client.projects.update({
        project_id: 'e2e-does-not-exist-project',
        description: 'should-not-apply',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(PermissionDeniedError);
      expect((err as PermissionDeniedError).status).toBe(403);
    }
  });

  it('delete returns 403 PermissionDeniedError without enterprise license', async () => {
    expect.assertions(2);
    try {
      await client.projects.delete({
        project_ids: ['e2e-does-not-exist-project'],
      });
    } catch (err) {
      expect(err).toBeInstanceOf(PermissionDeniedError);
      expect((err as PermissionDeniedError).status).toBe(403);
    }
  });
});
