# litellm-proxy

[![CI](https://github.com/visgotti/litellm-proxy/actions/workflows/ci.yml/badge.svg)](https://github.com/visgotti/litellm-proxy/actions/workflows/ci.yml)
[![E2E](https://github.com/visgotti/litellm-proxy/actions/workflows/live-e2e.yml/badge.svg)](https://github.com/visgotti/litellm-proxy/actions/workflows/live-e2e.yml)
[![npm](https://img.shields.io/npm/v/litellm-proxy.svg)](https://www.npmjs.com/package/litellm-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Production-grade TypeScript HTTP client for the [LiteLLM Proxy](https://docs.litellm.ai/docs/proxy/quick_start) server.

- **Zero runtime dependencies** — uses native `fetch` (Node ≥ 18, modern browsers, edge runtimes)
- **Full surface coverage** — every documented LiteLLM proxy endpoint surfaced as a typed method
- **Streaming-aware** — Server-Sent Events with `for await … of`, abortable mid-stream
- **Robust** — automatic retries with exponential backoff, `Retry-After` honoring, configurable timeout, typed error hierarchy
- **Strongly typed** — full TS types for every request/response shape
- **Tested** — ≥ 90 % unit-test coverage gate, plus end-to-end suite running the real LiteLLM container against live providers in CI

## Install

```bash
npm install litellm-proxy
```

## Quick start

```ts
import { LiteLLMProxyClient } from 'litellm-proxy';

const client = new LiteLLMProxyClient({
  baseUrl: 'http://localhost:4000',
  apiKey: 'sk-…',
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.choices[0].message.content);
```

## Streaming

Streaming responses come back as an async iterable that you can drive with `for await`:

```ts
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}
```

Cancel a stream from the outside with an `AbortSignal`:

```ts
const ac = new AbortController();
setTimeout(() => ac.abort(), 1000);

const stream = await client.chat.completions.create(
  { model: 'gpt-4o', messages: [...], stream: true },
  { signal: ac.signal },
);

for await (const chunk of stream) { /* … */ }
```

## Configuration

```ts
new LiteLLMProxyClient({
  baseUrl: string;          // Required — proxy URL (trailing slashes are stripped)
  apiKey?: string;          // Sent as `Authorization: Bearer <apiKey>`
  timeout?: number;         // Per-request timeout in ms (default 60_000)
  maxRetries?: number;      // Auto-retry count for 408/409/429/5xx + network errors (default 2)
  defaultHeaders?: Record<string, string>;
  fetch?: typeof fetch;     // Inject a custom fetch (for testing or edge runtimes)
});
```

Per-request overrides:

```ts
await client.chat.completions.create(
  { model: 'gpt-4o', messages: [...] },
  {
    timeout: 5_000,        // override client timeout
    maxRetries: 0,         // disable retries for this call
    headers: { 'x-trace-id': 'abc' },
    signal: ac.signal,     // AbortSignal
  },
);
```

## Resource map

The client exposes every documented LiteLLM proxy endpoint group as a typed property on the client.

### OpenAI-compatible inference

| Property | Endpoints |
|---|---|
| `client.chat.completions` | `create()` — non-streaming and streaming chat completions |
| `client.completions` | `create()` — legacy text completion (streaming + non-streaming) |
| `client.embeddings` | `create()` |
| `client.images` | `generate()`, `edit()`, `variations()` |
| `client.audio.speech` | `create()` — TTS, returns `ArrayBuffer` |
| `client.audio.transcriptions` | `create()` — speech-to-text (multipart) |
| `client.audio.translations` | `create()` — translate audio (multipart) |
| `client.moderations` | `create()` |
| `client.rerank` | `create()` |
| `client.responses` | `create()`, `retrieve()`, `cancel()`, `delete()`, `listInputItems()`, `compact()` |
| `client.batches` | `create()`, `list()`, `retrieve()`, `cancel()` |
| `client.files` | `create()`, `list()`, `retrieve()`, `delete()`, `content()` |
| `client.fineTuning.jobs` | `create()`, `list()`, `retrieve()`, `cancel()`, `events()` |
| `client.assistants` | `create()`, `list()`, `retrieve()`, `update()`, `delete()` (sets `OpenAI-Beta` header) |
| `client.assistants.threads` | `create()`, `retrieve()`, `update()`, `delete()` |
| `client.assistants.threads.messages` | `create()`, `list()` |
| `client.assistants.threads.runs` | `create()`, `retrieve()`, `cancel()` |
| `client.vectorStores` | full CRUD + file/batch sub-resources |
| `client.containers` | `create()`, `list()`, `retrieve()`, `delete()` |
| `client.evals` | full CRUD on evals |
| `client.realtime` | `createClientSecret()`, `createCall()` |
| `client.videos` | `create()`, `list()`, `retrieve()`, `content()`, `remix()`, `edit()`, `extend()`, character endpoints |
| `client.ocr` | `create()` — JSON document or multipart file |
| `client.search` | search endpoints |
| `client.rag` | RAG endpoints |

### Provider-native passthroughs

| Property | Description |
|---|---|
| `client.anthropic.messages` | Anthropic-native `/v1/messages` and `count_tokens` |
| `client.anthropic.skills` | Anthropic skills CRUD |
| `client.gemini` | Gemini-native `generateContent`, `streamGenerateContent`, `countTokens`, `interactions` |
| `client.passThrough.<provider>` | Generic pass-through for `anthropic`, `gemini`, `vertex`, `cohere`, `mistral`, `vllm`, `milvus`, `bedrock`, `assemblyAi`, `azure`, `openai`, `cursor`, `langfuse` (`get/post/put/patch/delete`) |
| `client.mcp` | MCP servers, tools, toolsets, access groups, network, registry, user credentials |
| `client.agents` | LiteLLM agents — list/create/update/patch/delete/daily-activity |
| `client.a2a` | Agent-to-agent endpoints |

### Admin / operations

| Property | Description |
|---|---|
| `client.models` | List, info, create, update, patch, delete, group info, metrics, settings, cost-map source/reload/schedule |
| `client.keys` | Virtual key CRUD, regenerate, block/unblock, info, list, health, service-account, bulk update, infoV2, reset-spend, aliases |
| `client.users` | Internal-user CRUD, info(V2), list, getUsers, availableRoles, bulkUpdate, dailyActivityAggregated |
| `client.teams` | Team CRUD, members, models, permissions, callbacks, daily activity, listV2, available, myMembership |
| `client.organizations` | Organization CRUD, members, models |
| `client.customers` | End-customer CRUD, info, list, block/unblock, daily activity |
| `client.budgets` | Budget CRUD, info, list, settings, provider budgets |
| `client.spend` | Spend logs, tags, calculate, daily activity, global aggregates, activity exceptions, cache hits |
| `client.cost` | Cost endpoints |
| `client.guardrails` | Guardrail CRUD, register, submissions, UI helpers, custom-code testing, usage analytics |
| `client.credentials` | Credential CRUD |
| `client.tags` | Tag CRUD and analytics |
| `client.cache` | Cache delete/flush, ping, redis info, settings (get/update/test) |
| `client.health` | `check()`, `liveness()`, `readiness()`, `services()`, `backlog()`, `license()`, `history()`, `latest()`, `sharedStatus()`, `testConnection()`, `test()`, `settings()` |
| `client.compliance` | Compliance/audit endpoints |
| `client.utils` | Utility endpoints |

## Errors

All HTTP errors are subclasses of `LiteLLMProxyError`:

```ts
import {
  LiteLLMProxyError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
  ConnectionError,
  TimeoutError,
} from 'litellm-proxy';

try {
  await client.chat.completions.create({ /* … */ });
} catch (err) {
  if (err instanceof RateLimitError) {
    // err.status === 429, err.headers, err.errorBody
  } else if (err instanceof AuthenticationError) {
    // 401
  } else if (err instanceof TimeoutError) {
    // request exceeded `timeout` ms
  } else if (err instanceof ConnectionError) {
    // network failure
  }
}
```

| Class | HTTP status |
|---|---|
| `AuthenticationError` | 401 |
| `PermissionDeniedError` | 403 |
| `NotFoundError` | 404 |
| `RateLimitError` | 429 |
| `InternalServerError` | 500–599 |

`ConnectionError` and `TimeoutError` cover network-level failures.

## Retry behavior

By default the client retries up to `maxRetries` (default 2) times for:

- HTTP `408`, `409`, `429`, `500`, `502`, `503`, `504`
- Network `TypeError`s (`fetch failed` etc.)
- `TimeoutError` from the per-request timeout

Backoff is exponential (`500ms × 2^attempt`, capped at 30 s). When the response carries a `Retry-After` header on a 429, the client honors it (capped at 30 s).

## Practical examples

### Key management

```ts
const key = await client.keys.create({
  models: ['gpt-4o', 'gpt-4o-mini'],
  max_budget: 100,
  metadata: { team: 'engineering' },
});
console.log(key.key); // sk-…

await client.keys.delete({ keys: [key.key] });
```

### Team management

```ts
const team = await client.teams.create({
  team_alias: 'backend-team',
  models: ['gpt-4o'],
  max_budget: 500,
});

await client.teams.addMember({
  team_id: team.team_id,
  member: [{ role: 'user', user_id: 'user-123' }],
});
```

### Files + batches

```ts
const file = await client.files.create({
  file: await fs.readFile('jobs.jsonl'),
  filename: 'jobs.jsonl',
  purpose: 'batch',
});

const batch = await client.batches.create({
  input_file_id: file.id,
  endpoint: '/v1/chat/completions',
  completion_window: '24h',
});

console.log(batch.status); // 'validating' | 'in_progress' | …
```

### Anthropic-native messages

```ts
const result = await client.anthropic.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'hi' }],
});
```

### Health probes

```ts
await client.health.liveness();   // GET /health/liveliness
await client.health.readiness();  // GET /health/readiness
await client.health.check();      // GET /health (full per-model check)
```

### Generic passthrough

```ts
// Forward an arbitrary request to the proxy's anthropic passthrough.
const out = await client.passThrough.anthropic.post(
  '/v1/messages',
  { model: 'claude-opus-4-5', max_tokens: 512, messages: [...] },
);
```

## Compatibility

- Node.js ≥ 18 (uses native `fetch`, `AbortController`, `ReadableStream`)
- Modern browsers
- Cloudflare Workers / Vercel Edge — pass `fetch: globalThis.fetch` if your runtime needs an explicit binding

## Development

```bash
# Install
npm install

# Type-check
npx tsc --noEmit

# Unit tests (with coverage gate)
npm run test:unit

# Build
npm run build

# E2E against a real LiteLLM proxy + live providers
# Requires Docker and at least one of:
#   OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY,
#   GEMINI_API_KEY, ALIBABA_API_KEY
npm run test:e2e
```

The unit suite enforces a 90 % coverage threshold (statements / branches / lines / functions). The e2e suite spins up the official `ghcr.io/berriai/litellm:main-stable` container against a Postgres backend and exercises the SDK end-to-end against any provider key you supply.

## Versioning & release

This package follows [semver](https://semver.org/). Breaking changes are documented in [CHANGELOG.md](CHANGELOG.md). Releases are cut from `main`; published artifacts are built and published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements).

## License

MIT — see [LICENSE](LICENSE).
