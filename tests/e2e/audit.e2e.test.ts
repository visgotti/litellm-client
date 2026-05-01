/**
 * @group e2e
 *
 * E2E tests for `client.audit` against the LiteLLM proxy on
 * http://localhost:14000.
 */

import { LiteLLMClient } from '../../src/client';
import { NotFoundError } from '../../src/errors';

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

describe('Audit logs', () => {
  it('list() returns a paginated response with the default page', async () => {
    const result = await client.audit.list();
    expect(typeof result.total).toBe('number');
    expect(typeof result.page).toBe('number');
    expect(typeof result.page_size).toBe('number');
    expect(typeof result.total_pages).toBe('number');
    expect(Array.isArray(result.audit_logs)).toBe(true);
    expect(result.page).toBe(1);
  });

  it('list({page,page_size}) honours pagination params', async () => {
    const result = await client.audit.list({ page: 2, page_size: 5 });
    expect(result.page).toBe(2);
    expect(result.page_size).toBe(5);
    expect(Array.isArray(result.audit_logs)).toBe(true);
  });

  it('list({sort_order,action}) accepts filter params without erroring', async () => {
    const result = await client.audit.list({
      sort_order: 'desc',
      action: 'updated',
    });
    expect(typeof result.total).toBe('number');
    expect(Array.isArray(result.audit_logs)).toBe(true);
  });

  it('retrieve(id) throws NotFoundError for an unknown audit id', async () => {
    let caught: unknown;
    try {
      await client.audit.retrieve('does-not-exist-e2e');
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });
});
