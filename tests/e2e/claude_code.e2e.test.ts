/**
 * @group e2e
 *
 * Claude Code marketplace + plugins end-to-end tests.
 *
 * Pinned proxy responses (verified against the configured e2e proxy build):
 *   - GET    /claude-code/marketplace.json        -> 200 OK
 *   - GET    /claude-code/plugins                 -> 200 OK
 *   - POST   /claude-code/plugins                 -> 200 OK (creates plugin)
 *   - GET    /claude-code/plugins/{name}          -> 200 OK / 404 NotFoundError
 *   - DELETE /claude-code/plugins/{name}          -> 200 OK / 404 NotFoundError
 *   - POST   /claude-code/plugins/{name}/enable   -> 200 OK / 404 NotFoundError
 *   - POST   /claude-code/plugins/{name}/disable  -> 200 OK / 404 NotFoundError
 *
 * The full create -> retrieve -> disable -> enable -> delete flow is
 * exercised in a single deterministic lifecycle test below.
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

describe('Claude Code marketplace', () => {
  it('returns the marketplace catalog', async () => {
    const result = await client.claudeCode.marketplace();
    expect(typeof result.name).toBe('string');
    expect(result.name.length).toBeGreaterThan(0);
    expect(Array.isArray(result.plugins)).toBe(true);
  });
});

describe('Claude Code plugins (read endpoints)', () => {
  it('list returns 200 with a plugins array and a numeric count', async () => {
    const result = await client.claudeCode.plugins.list();
    expect(Array.isArray(result.plugins)).toBe(true);
    expect(typeof result.count).toBe('number');
    expect(result.count).toBe(result.plugins.length);
  });

  it('retrieve on a non-existent plugin returns 404 NotFoundError', async () => {
    expect.assertions(2);
    try {
      await client.claudeCode.plugins.retrieve('e2e-does-not-exist-plugin');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).status).toBe(404);
    }
  });

  it('delete on a non-existent plugin returns 404 NotFoundError', async () => {
    expect.assertions(2);
    try {
      await client.claudeCode.plugins.delete('e2e-does-not-exist-plugin');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).status).toBe(404);
    }
  });

  it('enable on a non-existent plugin returns 404 NotFoundError', async () => {
    expect.assertions(2);
    try {
      await client.claudeCode.plugins.enable('e2e-does-not-exist-plugin');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).status).toBe(404);
    }
  });

  it('disable on a non-existent plugin returns 404 NotFoundError', async () => {
    expect.assertions(2);
    try {
      await client.claudeCode.plugins.disable('e2e-does-not-exist-plugin');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).status).toBe(404);
    }
  });
});

describe('Claude Code plugins lifecycle', () => {
  // Use a unique name to avoid collisions across test reruns.
  const pluginName = `e2e-plugin-${Date.now()}`;

  it('creates -> retrieves -> disables -> enables -> deletes a plugin', async () => {
    // Create
    const created = await client.claudeCode.plugins.create({
      name: pluginName,
      source: { source: 'github', repo: 'litellm-test/e2e-plugin' },
      version: '0.1.0',
      description: 'Created by the litellm-proxy SDK e2e test suite.',
    });
    expect(created.plugin.name).toBe(pluginName);
    expect(typeof created.plugin.id).toBe('string');
    expect(created.plugin.id.length).toBeGreaterThan(0);
    expect(created.plugin.enabled).toBe(true);

    // Retrieve
    const retrieved = await client.claudeCode.plugins.retrieve(pluginName);
    expect(retrieved.id).toBe(created.plugin.id);
    expect(retrieved.name).toBe(pluginName);
    expect(retrieved.enabled).toBe(true);

    // Disable
    await client.claudeCode.plugins.disable(pluginName);
    const afterDisable = await client.claudeCode.plugins.retrieve(pluginName);
    expect(afterDisable.enabled).toBe(false);

    // Enable
    await client.claudeCode.plugins.enable(pluginName);
    const afterEnable = await client.claudeCode.plugins.retrieve(pluginName);
    expect(afterEnable.enabled).toBe(true);

    // Delete
    await client.claudeCode.plugins.delete(pluginName);

    // Confirm gone
    expect.assertions(10);
    try {
      await client.claudeCode.plugins.retrieve(pluginName);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});
