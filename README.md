# litellm-proxy

Production-grade TypeScript HTTP client for the [LiteLLM Proxy](https://docs.litellm.ai/docs/proxy/quick_start) server.

**Zero runtime dependencies** — uses native `fetch` (Node 18+).

## Install

```bash
npm install litellm-proxy
```

## Quick Start

```ts
import { LiteLLMProxyClient } from 'litellm-proxy';

const client = new LiteLLMProxyClient({
  baseUrl: 'http://localhost:4000',
  apiKey: 'sk-…',
});

// Chat completion
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.choices[0].message.content);
```

## Streaming

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

## Embeddings

```ts
const result = await client.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'The quick brown fox',
});
console.log(result.data[0].embedding);
```

## API Reference

### Client Configuration

```ts
new LiteLLMProxyClient({
  baseUrl: string;          // Required – proxy URL
  apiKey?: string;          // Bearer token
  timeout?: number;         // Request timeout in ms (default: 60 000)
  maxRetries?: number;      // Auto-retry count (default: 2)
  defaultHeaders?: Record<string, string>;
  fetch?: typeof fetch;     // Inject a custom fetch implementation
})
```

### Resources

| Resource | Methods |
|---|---|
| `client.chat.completions` | `create(params)` — streaming & non-streaming |
| `client.embeddings` | `create(params)` |
| `client.models` | `list()`, `info()`, `create(params)`, `delete(params)` |
| `client.keys` | `create(params)`, `update(params)`, `delete(params)`, `info(key)` |
| `client.users` | `create(params)`, `update(params)`, `delete(params)`, `info(userId)` |
| `client.teams` | `create(params)`, `update(params)`, `delete(params)`, `info(teamId)`, `addMember(params)`, `deleteMember(params)` |
| `client.budgets` | `create(params)`, `update(params)`, `delete(params)`, `info(params)` |
| `client.health` | `check()`, `liveness()`, `readiness()` |

### Error Handling

All errors extend `LiteLLMProxyError`:

```ts
import { AuthenticationError, RateLimitError } from 'litellm-proxy';

try {
  await client.chat.completions.create({ … });
} catch (err) {
  if (err instanceof RateLimitError) {
    // Back off and retry
  }
}
```

| Error class | HTTP status |
|---|---|
| `AuthenticationError` | 401 |
| `PermissionDeniedError` | 403 |
| `NotFoundError` | 404 |
| `RateLimitError` | 429 |
| `InternalServerError` | 500 |

Plus `ConnectionError` and `TimeoutError` for network-level failures.

### Retry Behavior

Requests that return 408, 429, 500, 502, 503, or 504 are automatically retried with exponential back-off (configurable via `maxRetries`). Network errors and timeouts are also retried.

## Key Management

```ts
// Create a key scoped to specific models
const key = await client.keys.create({
  models: ['gpt-4o', 'gpt-4o-mini'],
  max_budget: 100,
  metadata: { team: 'engineering' },
});
console.log(key.key); // sk-…

// Delete
await client.keys.delete({ keys: [key.key] });
```

## Team Management

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

## Development

```bash
# Install dependencies
npm install

# Type-check
npx tsc --noEmit

# Unit tests
npm run test:unit

# Unit tests with coverage
npm run test:unit -- --coverage

# E2e tests (requires Docker)
npm run test:e2e
```

## License

MIT
