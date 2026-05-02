# litellm-client

[![CI](https://github.com/visgotti/litellm-client/actions/workflows/ci.yml/badge.svg)](https://github.com/visgotti/litellm-client/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/visgotti/litellm-client/graph/badge.svg?token=U7KS3N0NQ7)](https://codecov.io/gh/visgotti/litellm-client)
[![npm](https://img.shields.io/npm/v/litellm-client.svg)](https://www.npmjs.com/package/litellm-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Production-grade TypeScript HTTP client for the [LiteLLM Proxy](https://docs.litellm.ai/docs/proxy/quick_start) server.

- **Zero runtime dependencies** — uses native `fetch` (Node ≥ 18, modern browsers, edge runtimes)
- **Comprehensive endpoint coverage** — typed methods for every documented LiteLLM proxy endpoint group, source-verified against the LiteLLM Pydantic models for endpoints whose docs page isn't yet published
- **Streaming-aware** — Server-Sent Events with `for await … of`, abortable mid-stream
- **Robust** — automatic retries with exponential backoff, `Retry-After` honoring, configurable timeout, typed error hierarchy
- **Strongly typed** — TS types for every request/response shape, with `[key: string]: unknown` escape hatches on rapidly-evolving surfaces (RAG, MCP, Search) so unmodelled fields still pass through
- **Tested** — ≥ 90 % unit-test coverage gate, plus end-to-end suite running the real LiteLLM container against live providers in CI

## Install

```bash
npm install litellm-client
```

## Quick start

```ts
import { LiteLLMClient } from 'litellm-client';

const client = new LiteLLMClient({
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
new LiteLLMClient({
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
| `client.assistants` ⚠️ *deprecated by OpenAI; sunsets 2026-08-26 — migrate to `client.responses`* | `create()`, `list()`, `retrieve()`, `update()`, `delete()` (sets `OpenAI-Beta` header) |
| `client.assistants.threads` ⚠️ deprecated | `create()`, `retrieve()`, `update()`, `delete()` |
| `client.assistants.threads.messages` ⚠️ deprecated | `create()`, `list()` |
| `client.assistants.threads.runs` ⚠️ deprecated | `create()`, `retrieve()`, `cancel()` |
| `client.vectorStores` | full CRUD + file/batch sub-resources |
| `client.containers` | `create()`, `list()`, `retrieve()`, `delete()` |
| `client.containers.files` | `create()` (multipart), `list()`, `retrieve()`, `content()`, `delete()` |
| `client.evals` | full CRUD on evals |
| `client.realtime` | `createClientSecret()`, `createCall()` (+ typed event-protocol unions for the WebSocket side) |
| `client.videos` | `create()`, `list()`, `retrieve()`, `content()`, `remix()`, `edit()`, `extend()`, character endpoints |
| `client.ocr` | `create()` — JSON document or multipart file |
| `client.search` | search endpoints |
| `client.rag` | RAG endpoints |
| `client.prompts` | `create()`, `list()`, `retrieve()`, `update()`, `delete()`, `versions()`, `info()`, `test()`, `dotpromptJsonConverter()`, `integration()` |

### Provider-native passthroughs

Every passthrough provider exposes raw `get/post/put/patch/delete` (escape hatch). The starred ones additionally have **typed first-class methods** for their most-used endpoints.

| Property | Description |
|---|---|
| `client.anthropic.messages` | Anthropic-native `/v1/messages` and `count_tokens` (typed) |
| `client.anthropic.skills` | Anthropic skills CRUD (multipart upload + auto-injected `anthropic-beta` header) |
| `client.gemini` | Gemini-native `generateContent`, `streamGenerateContent`, `countTokens`, `interactions` (typed) |
| `client.passThrough.bedrock` ★ | Typed `converse`, `converseStream` (`Stream<ConverseStreamEvent>`), `invoke`, `invokeWithResponseStream`, `guardrails.apply`, `knowledgeBases.{retrieve, retrieveAndGenerate}`, `agents.invoke` |
| `client.passThrough.cursor` ★ | Typed `me`, `models`, `repositories`, `agents.{list, launch, get, delete, conversation, followup, stop}` |
| `client.passThrough.vertex` ★ | Typed `generateContent`, `streamGenerateContent`, `embedContent`, `predict`, `batchPredictionJobs.*` |
| `client.passThrough.cohere` ★ | Typed `chat`, `chatV2`, `embed`, `rerank`, `classify`, `generate`, `tokenize`, `detokenize` |
| `client.passThrough.mistral` ★ | Typed `chat.completions.create`, `embeddings.create`, `fim.completions.create`, `agents.completions.create`, `models.list` |
| `client.passThrough.vllm` ★ | Typed `chat.completions.create`, `completions.create`, `embeddings.create`, `models.list` |
| `client.passThrough.milvus` ★ | Typed `collections.*`, `entities.*`, `partitions.*`, `indexes.*` (vector DB CRUD) |
| `client.passThrough.azure` ★ | Typed `chatCompletions`, `completions`, `embeddings`, `images.generations`, `audio.transcriptions` (deployment-routed) |
| `client.passThrough.langfuse` ★ | Typed `traces.*`, `observations.*`, `spans.*`, `scores.*`, `datasets.*`, `prompts.*` |
| `client.passThrough.assemblyAi` / `.assemblyAiEu` ★ | Typed `transcript.*`, `lemur.*`, `realtime.token`, `upload` |
| `client.passThrough.openai` / `.openaiPassthrough` | Raw HTTP only (use `client.chat.completions` etc. for typed OpenAI calls) |
| `client.passThroughConfig` | Admin CRUD for *registering* custom passthrough endpoints (`/config/pass_through_endpoint*`) |
| `client.mcp` | MCP servers, tools, toolsets, access groups, network, registry, user credentials, REST sub-resource |
| `client.agents` | LiteLLM agents — list/create/update/patch/delete/daily-activity |
| `client.a2a` | Agent-to-agent endpoints (JSON-RPC `message/send` + invoke) |

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
| `client.cache` | Cache delete/flush, ping (`/cache/ping`), redis info (`/cache/redis/info`), settings (get/update/test) |
| `client.health` | `check()`, `liveness()`, `readiness()`, `services()`, `backlog()`, `license()`, `history()`, `latest()`, `sharedStatus()`, `testConnection()`, `test()`, `settings()` |
| `client.compliance` | Compliance/audit endpoints (`euAiAct`, `gdpr`) |
| `client.utils` | `tokenCounter`, `transformRequest`, `supportedOpenAiParams`, `routes`, `availableRoutes` |
| `client.memory` | KV store for conversation/context memory (`/v1/memory` CRUD) |
| `client.fallbacks` | Model fallback config (`/fallback`, `/fallback/{model}` CRUD) |
| `client.tools` | Cross-provider tool registry — `/v1/tool/*` (list, retrieve, detail, logs, policy CRUD) |
| `client.routerSettings` | `getSettings()`, `getFields()` — router introspection |
| `client.callbacks` | `list()`, `configs()` — callback config (read-only) |
| `client.policies` | Policy management — full CRUD + `policies.{attachments, templates}` sub-resources, plus `resolve`, `validate`, `testCatalog` |
| `client.jwt` | JWT-claim → virtual-key mapping CRUD |
| `client.accessGroups` | Access group CRUD (top-level + `accessGroups.models` for model-scoped) |
| `client.public` | Public/unauthed metadata endpoints — `modelHub`, `agentHub`, `mcpHub`, `skillHub`, `providers`, `litellmModelCostMap`, `litellmBlogPosts`, `endpoints` |

## Errors

All HTTP errors are subclasses of `LiteLLMError`:

```ts
import {
  LiteLLMError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
  ConnectionError,
  TimeoutError,
} from 'litellm-client';

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

### Provider-native error bodies

`LiteLLMError.body` is typed as `LiteLLMErrorBody | null` — an OpenAI-shaped envelope that covers most cases. When a request is routed to a non-OpenAI provider, the proxy passes the upstream error through, and the body's actual shape is provider-specific. Cast `body` to a provider-native interface when you know which provider was hit:

```ts
import {
  type AnthropicApiErrorBody,
  type GeminiErrorBody,
  type BedrockErrorBody,
  type CohereErrorBody,
  type MistralErrorBody,
  RateLimitError,
} from 'litellm-client';

try {
  await client.anthropic.messages.create({ /* … */ });
} catch (err) {
  if (err instanceof RateLimitError) {
    const body = err.body as AnthropicApiErrorBody | null;
    console.log(body?.error.type); // 'rate_limit_error' | 'overloaded_error' | …
  }
}
```

Available provider-native HTTP error bodies: `AnthropicApiErrorBody`, `GeminiErrorBody`, `BedrockErrorBody`, `CohereErrorBody`, `MistralErrorBody`. The convenience union `ProviderErrorBody` covers all of the above plus the default `LiteLLMErrorBody`.

> The name `AnthropicApiErrorBody` is used (rather than `AnthropicErrorBody`) because the latter is already exported as the inline payload type of streaming `error` SSE events on `/v1/messages`.

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

### Embeddings

```ts
const embeddings = await client.embeddings.create({
  model: 'text-embedding-3-small',
  input: ['hello world', 'foo bar'],
});

embeddings.data.forEach(({ embedding, index }) => {
  console.log(`[${index}]`, embedding); // 1536-dim vector
});
```

### Images

```ts
// Generate images
const images = await client.images.generate({
  model: 'dall-e-3',
  prompt: 'a serene landscape',
  n: 1,
  size: '1024x1024',
});

console.log(images.data[0].url); // or .b64_json if format: 'b64_json'

// Edit an existing image
const edited = await client.images.edit({
  model: 'dall-e-2',
  image: await fs.readFile('original.png'),
  mask: await fs.readFile('mask.png'),
  prompt: 'replace the sky with stars',
});
```

### Audio

```ts
// Text-to-speech (returns ArrayBuffer)
const speechBuffer = await client.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy',
  input: 'Hello, world!',
});
await fs.writeFile('output.mp3', Buffer.from(speechBuffer));

// Speech-to-text (multipart FormData upload)
const transcription = await client.audio.transcriptions.create({
  model: 'whisper-1',
  file: await fs.readFile('audio.mp3'),
  filename: 'audio.mp3',
});
console.log(transcription.text);

// Translate audio to English
const translation = await client.audio.translations.create({
  model: 'whisper-1',
  file: await fs.readFile('spanish_audio.mp3'),
  filename: 'spanish_audio.mp3',
});
```

### Rerank

```ts
const reranked = await client.rerank.create({
  model: 'jina-reranker-v2-base-multilingual',
  query: 'What is the capital of France?',
  documents: [
    'Paris is the capital of France',
    'London is the capital of England',
    'Berlin is the capital of Germany',
  ],
  top_n: 2,
});

console.log(reranked.results); // sorted by relevance score
```

### Typed model strings

All model parameters accept typed model enums for IDE autocomplete:

```ts
import type {
  ChatModel,
  AnthropicModel,
  OpenAIModel,
  GeminiModel,
  MistralModel,
} from 'litellm-client';

// Typed — your IDE shows available models as you type
const response = await client.chat.completions.create({
  model: 'gpt-4o' as OpenAIModel,
  messages: [{ role: 'user', content: 'Hi' }],
});

const anthropic = await client.anthropic.messages.create({
  model: 'claude-opus-4-5' as AnthropicModel,
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hi' }],
});

// Generic ChatModel covers all providers
const generic: ChatModel = 'gpt-4o'; // or any supported model string
```

### Vector stores

```ts
// Create and upload to a vector store
const store = await client.vectorStores.create({
  name: 'my-embeddings',
});

const file = await client.files.create({
  file: await fs.readFile('documents.pdf'),
  filename: 'documents.pdf',
  purpose: 'assistants',
});

await client.vectorStores.files.create({
  vector_store_id: store.id,
  file_id: file.id,
});

// Search the store
const results = await client.vectorStores.search({
  vector_store_id: store.id,
  query: 'machine learning',
  limit: 5,
});
```

### Spending and observability

```ts
// View recent spend
const logs = await client.spend.logs({
  limit: 10,
});
logs.data.forEach(({ cost, model, total_tokens, user_id }) => {
  console.log(`${user_id} used ${model}: $${cost} (${total_tokens} tokens)`);
});

// Get global spend aggregates
const global = await client.spend.global();
console.log(`Total spend: $${global.total_spend}`);
console.log(`Total requests: ${global.total_requests}`);

// Cache hit tracking
const hits = await client.spend.activityCacheHits();
console.log(`Cache hit rate: ${(hits.cache_hit_rate * 100).toFixed(2)}%`);
```

### Cache management

```ts
// Check cache health
const info = await client.cache.redisInfo();
console.log(`Redis memory: ${info.used_memory_human}`);

// Flush cache
await client.cache.flushAll();

// Test connection
const settings = await client.cache.settings.get();
console.log(`Cache type: ${settings.cache_type}`);
```

### Prompts (templated prompt management)

```ts
const prompt = await client.prompts.create({
  prompt_id: 'support-greeting',
  prompt_template: 'Hello {{name}}, how can I help you today?',
  metadata: { team: 'support' },
});

const all = await client.prompts.list();
await client.prompts.update(prompt.prompt_id!, { prompt_template: 'Hi {{name}}!' });
await client.prompts.delete(prompt.prompt_id!);

// Discover which prompt-management integration the proxy is configured with
const info = await client.prompts.integration();
console.log(info.integration); // 'langfuse' | 'humanloop' | etc.
```

### Container files (code-interpreter sandboxes)

```ts
// Create a sandbox container, then upload + read files inside it
const container = await client.containers.create({ name: 'session-1' });

const upload = await client.containers.files.create(container.id, {
  file: await fs.readFile('data.csv'),
  filename: 'data.csv',
  contentType: 'text/csv',
});

const files = await client.containers.files.list(container.id);
const bytes = await client.containers.files.content(container.id, upload.id);
console.log(`Got ${bytes.byteLength} bytes back`);

await client.containers.files.delete(container.id, upload.id);
```

### Bedrock (typed Converse / Invoke / Knowledge Bases)

```ts
// Bedrock Converse — strongly typed; works with any model on Bedrock
const result = await client.passThrough.bedrock.converse(
  'anthropic.claude-3-haiku-20240307-v1:0',
  {
    messages: [{ role: 'user', content: [{ text: 'Hi!' }] }],
    inferenceConfig: { maxTokens: 100, temperature: 0.7 },
  },
);
console.log(result.output.message.content[0]); // { text: '...' }

// Streaming variant — discriminated union of stream events
const stream = await client.passThrough.bedrock.converseStream(
  'anthropic.claude-3-haiku-20240307-v1:0',
  { messages: [{ role: 'user', content: [{ text: 'Stream!' }] }] },
);
for await (const event of stream) {
  if (event.contentBlockDelta) {
    process.stdout.write(event.contentBlockDelta.delta.text ?? '');
  }
}

// Knowledge bases — RAG retrieval against a Bedrock KB
const docs = await client.passThrough.bedrock.knowledgeBases.retrieve(
  'KB-XYZ',
  { retrievalQuery: { text: 'How do I reset my password?' } },
);

// Guardrails — apply a Bedrock guardrail to text
const guarded = await client.passThrough.bedrock.guardrails.apply(
  'gr-abc',
  'DRAFT',
  { source: 'INPUT', content: [{ text: { text: 'sensitive content', qualifiers: [] } }] },
);
```

### Cursor Cloud Agents

```ts
const me = await client.passThrough.cursor.me();
const repos = await client.passThrough.cursor.repositories();

// Launch an agent against a repo
const agent = await client.passThrough.cursor.agents.launch({
  prompt: { text: 'Refactor src/utils to use async/await' },
  source: { repository: 'github.com/visgotti/my-repo', ref: 'main' },
  target: { autoCreatePr: true },
});

const conversation = await client.passThrough.cursor.agents.conversation(agent.id);
await client.passThrough.cursor.agents.followup(agent.id, {
  prompt: { text: 'Also add tests for the new helpers' },
});

await client.passThrough.cursor.agents.stop(agent.id);
```

### Realtime events (typed discriminated union)

The Realtime API is bidirectional WebSocket-based — clients connect directly to
the URL the proxy returns. The SDK ships exhaustive types for all 38 documented
event variants so you can narrow with `switch`:

```ts
import {
  type RealtimeServerEvent,
  type RealtimeClientEvent,
} from 'litellm-client';

const session = await client.realtime.createClientSecret({
  session: { type: 'realtime', model: 'gpt-realtime' },
});

const ws = new WebSocket(session.value);

ws.onmessage = (raw) => {
  const event: RealtimeServerEvent = JSON.parse(raw.data);
  switch (event.type) {
    case 'session.created':
      console.log('Session ready:', event.session.id);
      break;
    case 'response.audio.delta':
      playAudioChunk(event.delta);
      break;
    case 'response.done':
      console.log('Final response:', event.response);
      break;
    case 'error':
      console.error(event.error.message);
      break;
  }
};

// Send a typed client event
const update: RealtimeClientEvent = {
  type: 'session.update',
  session: { instructions: 'You are a friendly assistant.' },
};
ws.send(JSON.stringify(update));
```

### Compliance and auditing

```ts
// Check compliance status
const compliance = await client.compliance.getStatus();
console.log(compliance.status);

// View audit logs
const logs = await client.compliance.logs({
  limit: 50,
  offset: 0,
});
```

## Migrating from Assistants to Responses

OpenAI is sunsetting the Assistants API on **2026-08-26**. The SDK keeps `client.assistants.*` for back-compat (every method/type is now tagged `@deprecated`), but new code should use `client.responses` — the Responses API.

Roughly:

| Assistants concept | Responses equivalent |
|---|---|
| `assistants.create({ model, instructions, tools })` | Pass `model`, `instructions`, `tools` directly to `responses.create({ ... })` per call. No persistent assistant object needed. |
| `threads.create()` + `threads.messages.create()` + `runs.create()` | One call: `responses.create({ model, input, previous_response_id })`. Pass the prior `response.id` to chain turns. |
| `threads.messages.list(threadId)` | `responses.listInputItems(responseId)` |
| `runs.cancel(threadId, runId)` | `responses.cancel(responseId)` |
| `threads.delete(threadId)` | `responses.delete(responseId)` |
| `tool_choice` / `response_format` on Run | Same fields on `responses.create({ tool_choice, response_format })` |
| Streaming run events | `responses.create({ stream: true })` returning `Stream<ResponseStreamEvent>` |

Minimal example:

```ts
// Old (Assistants — deprecated):
const assistant = await client.assistants.create({ model: 'gpt-4o', instructions: 'You are helpful.' });
const thread = await client.assistants.threads.create();
await client.assistants.threads.messages.create(thread.id, { role: 'user', content: 'Hi' });
const run = await client.assistants.threads.runs.create(thread.id, { assistant_id: assistant.id });

// New (Responses):
const r = await client.responses.create({
  model: 'gpt-4o',
  instructions: 'You are helpful.',
  input: 'Hi',
});
console.log(r.output[0]); // assistant turn
```

For the full mapping see [OpenAI's official migration guide](https://platform.openai.com/docs/assistants/migration).

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
# Requires Docker and at least one provider API key.
# Copy the template, fill in whichever keys you have, then export them:
cp .env.template .env
set -a; source .env; set +a
npm run test:e2e
```

The unit suite enforces a 90 % coverage threshold (statements / branches / lines / functions). The e2e suite spins up the official `ghcr.io/berriai/litellm:main-stable` container against a Postgres backend and exercises the SDK end-to-end against any provider key you supply.

## Versioning & release

This package follows [semver](https://semver.org/). Breaking changes are documented in [CHANGELOG.md](CHANGELOG.md). Releases are cut from `main`; published artifacts are built and published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements).

## License

MIT — see [LICENSE](LICENSE).
