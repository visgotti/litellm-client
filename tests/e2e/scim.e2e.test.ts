/**
 * @group e2e
 *
 * E2E tests for the SCIM v2 resource against a live LiteLLM proxy in Docker.
 *
 * SCIM v2 is an Enterprise-only feature on the LiteLLM proxy. On the OSS build
 * used by these e2e tests every `/scim/v2/*` endpoint returns HTTP 403 with
 * a body explaining that the caller needs a `LITELLM_LICENSE`. Each test in
 * this file therefore commits to a single typed-error pin (403) so that we
 * still exercise the SDK's request marshalling end-to-end without requiring
 * the enterprise license.
 *
 * If a future build of the proxy starts returning 200 for these endpoints the
 * pin will need to be relaxed to `expectShape`; see the per-test comments.
 */
import { LiteLLMClient } from '../../src/client';
import { expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 60_000,
    maxRetries: 1,
  });
});

// ── root ────────────────────────────────────────────────────────────────────

describe('SCIM v2: root discovery', () => {
  it('discover() returns 403 on the OSS proxy (enterprise feature)', async () => {
    await expectTypedError(client.scim.discover(), 403);
  });

  it('serviceProviderConfig() returns 403 on the OSS proxy', async () => {
    await expectTypedError(client.scim.serviceProviderConfig(), 403);
  });
});

// ── users ───────────────────────────────────────────────────────────────────

describe('SCIM v2: users', () => {
  it('list() returns 403 (enterprise gated)', async () => {
    await expectTypedError(client.scim.users.list(), 403);
  });

  it('list() with pagination + filter returns 403', async () => {
    await expectTypedError(
      client.scim.users.list({
        startIndex: 1,
        count: 10,
        filter: 'userName eq "alice@example.com"',
      }),
      403,
    );
  });

  it('create() returns 403', async () => {
    await expectTypedError(
      client.scim.users.create({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'alice-e2e@example.com',
        name: { givenName: 'Alice', familyName: 'Example' },
        emails: [{ value: 'alice-e2e@example.com', primary: true, type: 'work' }],
        active: true,
      }),
      403,
    );
  });

  it('retrieve(unknown id) returns 403 (enterprise gate runs before lookup)', async () => {
    await expectTypedError(client.scim.users.retrieve('nonexistent-user-xyz'), 403);
  });

  it('replace(unknown id) returns 403', async () => {
    await expectTypedError(
      client.scim.users.replace('nonexistent-user-xyz', {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'replace-e2e@example.com',
      }),
      403,
    );
  });

  it('update(unknown id) returns 403', async () => {
    await expectTypedError(
      client.scim.users.update('nonexistent-user-xyz', {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: [{ op: 'replace', path: 'active', value: false }],
      }),
      403,
    );
  });

  it('delete(unknown id) returns 403', async () => {
    await expectTypedError(client.scim.users.delete('nonexistent-user-xyz'), 403);
  });
});

// ── groups ──────────────────────────────────────────────────────────────────

describe('SCIM v2: groups', () => {
  it('list() returns 403', async () => {
    await expectTypedError(client.scim.groups.list(), 403);
  });

  it('list() with pagination returns 403', async () => {
    await expectTypedError(
      client.scim.groups.list({ startIndex: 1, count: 5 }),
      403,
    );
  });

  it('create() returns 403', async () => {
    await expectTypedError(
      client.scim.groups.create({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        displayName: 'engineering-e2e',
        members: [],
      }),
      403,
    );
  });

  it('retrieve(unknown id) returns 403', async () => {
    await expectTypedError(client.scim.groups.retrieve('nonexistent-group-xyz'), 403);
  });

  it('replace(unknown id) returns 403', async () => {
    await expectTypedError(
      client.scim.groups.replace('nonexistent-group-xyz', {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        displayName: 'engineering-e2e',
      }),
      403,
    );
  });

  it('update(unknown id) returns 403', async () => {
    await expectTypedError(
      client.scim.groups.update('nonexistent-group-xyz', {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: [
          { op: 'add', path: 'members', value: [{ value: 'u-1' }] },
        ],
      }),
      403,
    );
  });

  it('delete(unknown id) returns 403', async () => {
    await expectTypedError(client.scim.groups.delete('nonexistent-group-xyz'), 403);
  });
});

// ── resourceTypes / schemas ─────────────────────────────────────────────────

describe('SCIM v2: resourceTypes', () => {
  it('list() returns 403', async () => {
    await expectTypedError(client.scim.resourceTypes.list(), 403);
  });

  it('retrieve("User") returns 403', async () => {
    await expectTypedError(client.scim.resourceTypes.retrieve('User'), 403);
  });

  it('retrieve(unknown id) returns 403', async () => {
    await expectTypedError(
      client.scim.resourceTypes.retrieve('NotARealResourceType'),
      403,
    );
  });
});

describe('SCIM v2: schemas', () => {
  it('list() returns 403', async () => {
    await expectTypedError(client.scim.schemas.list(), 403);
  });

  it('retrieve(core User schema URI) returns 403', async () => {
    await expectTypedError(
      client.scim.schemas.retrieve('urn:ietf:params:scim:schemas:core:2.0:User'),
      403,
    );
  });

  it('retrieve(unknown URI) returns 403', async () => {
    await expectTypedError(
      client.scim.schemas.retrieve('urn:not:a:real:schema'),
      403,
    );
  });
});
