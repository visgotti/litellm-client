/**
 * @group e2e
 *
 * End-to-end tests against a real LiteLLM proxy running in Docker.
 *
 * Prerequisites:
 *   npm run test:e2e:setup    (or let the CI pipeline handle it)
 *
 * The proxy runs on http://localhost:14000 with master key "sk-e2e-test-master-key"
 * and a "fake-openai-chat" model that returns synthetic responses.
 */

import { LiteLLMProxyClient } from '../../src/client';
import { Stream } from '../../src/streaming';
import type { ChatCompletion, ChatCompletionChunk } from '../../src/types/chat';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMProxyClient;

beforeAll(() => {
  client = new LiteLLMProxyClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 30_000,
    maxRetries: 2,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────────────────────

describe('Health', () => {
  it('liveness returns healthy', async () => {
    const result = await client.health.liveness();
    expect(result.status).toBe('healthy');
  });

  it('readiness returns status', async () => {
    const result = await client.health.readiness();
    expect(result.status).toBeDefined();
    expect(result.litellm_version).toBeDefined();
  });

  it('health check returns endpoint info', async () => {
    const result = await client.health.check();
    expect(result).toHaveProperty('healthy_endpoints');
    expect(result).toHaveProperty('unhealthy_endpoints');
    expect(typeof result.healthy_count).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────────────────────────────────────

describe('Models', () => {
  it('lists available models', async () => {
    const result = await client.models.list();
    expect(result.object).toBe('list');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    // The fake model should be present
    const ids = result.data.map((m) => m.id);
    expect(ids).toContain('fake-openai-chat');
  });

  it('gets model info', async () => {
    const result = await client.models.info();
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completions
// ─────────────────────────────────────────────────────────────────────────────

describe('Chat Completions', () => {
  it('creates a non-streaming completion', async () => {
    const result = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'Say hello' }],
    });

    expect(result).toHaveProperty('id');
    expect(result.object).toBe('chat.completion');
    expect(result.model).toBeDefined();
    expect(result.choices).toHaveLength(1);
    expect(result.choices[0].message.role).toBe('assistant');
    expect(typeof result.choices[0].message.content).toBe('string');
    expect(result.choices[0].finish_reason).toBeDefined();
    expect(result.usage).toBeDefined();
    expect(typeof result.usage!.prompt_tokens).toBe('number');
    expect(typeof result.usage!.completion_tokens).toBe('number');
    expect(typeof result.usage!.total_tokens).toBe('number');
  });

  it('creates a completion with optional parameters', async () => {
    const result = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'count to 3' }],
      temperature: 0.5,
      max_tokens: 50,
      top_p: 0.9,
    });

    expect(result.choices.length).toBeGreaterThan(0);
  });

  it('returns a streaming response', async () => {
    const stream = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true,
    });

    expect(stream).toBeInstanceOf(Stream);

    const chunks: ChatCompletionChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    // First chunk should have a role delta
    const firstChunk = chunks[0];
    expect(firstChunk).toHaveProperty('id');
    expect(firstChunk.object).toBe('chat.completion.chunk');
    expect(firstChunk.choices[0]).toHaveProperty('delta');

    // Last chunk should have finish_reason
    const lastChunk = chunks[chunks.length - 1];
    expect(lastChunk.choices[0].finish_reason).toBeDefined();
  });

  it('handles system + user messages', async () => {
    const result = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
      ],
    });

    expect(result.choices[0].message.content).toBeDefined();
  });

  it('supports response_format json_object', async () => {
    const result = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'return json' }],
      response_format: { type: 'json_object' },
    });

    // The fake model may not actually return JSON, but the request should succeed
    expect(result.choices.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Key Management
// ─────────────────────────────────────────────────────────────────────────────

describe('Key Management', () => {
  let createdKey: string;

  it('creates a new key', async () => {
    const result = await client.keys.create({
      models: ['fake-openai-chat'],
      max_budget: 100,
      metadata: { environment: 'test' },
    });

    expect(result).toHaveProperty('key');
    expect(typeof result.key).toBe('string');
    expect(result.key.length).toBeGreaterThan(0);
    createdKey = result.key;
  });

  it('retrieves key info', async () => {
    // If create succeeded, check info
    if (!createdKey) return;

    const result = await client.keys.info(createdKey);
    expect(result).toHaveProperty('info');
  });

  it('uses a generated key for a completion', async () => {
    if (!createdKey) return;

    const keyClient = new LiteLLMProxyClient({
      baseUrl: PROXY_URL,
      apiKey: createdKey,
      timeout: 30_000,
    });

    const result = await keyClient.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'auth test' }],
    });

    expect(result.choices.length).toBeGreaterThan(0);
  });

  it('deletes a key', async () => {
    if (!createdKey) return;

    const result = await client.keys.delete({ keys: [createdKey] });
    expect(result).toHaveProperty('deleted_keys');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

describe('User Management', () => {
  let createdUserId: string;

  it('creates a user', async () => {
    const result = await client.users.create({
      user_email: 'e2e-test@example.com',
      user_role: 'internal_user',
      max_budget: 50,
    });

    expect(result).toHaveProperty('user_id');
    createdUserId = result.user_id;
  });

  it('gets user info', async () => {
    if (!createdUserId) return;
    const result = await client.users.info(createdUserId);
    expect(result.user_id).toBe(createdUserId);
  });

  it('updates a user', async () => {
    if (!createdUserId) return;
    await client.users.update({
      user_id: createdUserId,
      max_budget: 100,
    });
    // If no error, update succeeded
  });

  it('deletes a user', async () => {
    if (!createdUserId) return;
    const result = await client.users.delete({ user_ids: [createdUserId] });
    expect(result).toHaveProperty('deleted_users');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Team Management
// ─────────────────────────────────────────────────────────────────────────────

describe('Team Management', () => {
  let createdTeamId: string;

  it('creates a team', async () => {
    const result = await client.teams.create({
      team_alias: 'e2e-test-team',
      models: ['fake-openai-chat'],
      max_budget: 200,
    });

    expect(result).toHaveProperty('team_id');
    createdTeamId = result.team_id;
  });

  it('gets team info', async () => {
    if (!createdTeamId) return;
    const result = await client.teams.info(createdTeamId);
    expect(result.team_id).toBe(createdTeamId);
  });

  it('updates a team', async () => {
    if (!createdTeamId) return;
    await client.teams.update({
      team_id: createdTeamId,
      max_budget: 500,
    });
  });

  it('deletes a team', async () => {
    if (!createdTeamId) return;
    const result = await client.teams.delete({ team_ids: [createdTeamId] });
    expect(result).toHaveProperty('deleted_teams');
  });
});
