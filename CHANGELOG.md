# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`PromptsResource`** — full CRUD for `/prompts` (`create`, `list`, `retrieve`,
  `update`, `delete`) plus `integration()` for `/beta/litellm_prompt_management`.
- **`ContainerFilesResource`** — `client.containers.files.{create, list,
  retrieve, content, delete}` for managing files inside code-interpreter
  containers (multipart upload, binary `content()` returning `ArrayBuffer`).
- **`BedrockPassThroughResource`** — typed methods promoted from raw passthrough:
  `bedrock.converse`, `bedrock.converseStream` (returns
  `Stream<ConverseStreamEvent>`), `bedrock.invoke`,
  `bedrock.invokeWithResponseStream`, plus sub-resources
  `bedrock.guardrails.apply`, `bedrock.knowledgeBases.{retrieve,
  retrieveAndGenerate}`, `bedrock.agents.invoke`.
- **`CursorPassThroughResource`** — typed methods for the Cursor Cloud Agents
  REST API: `cursor.{me, models, repositories}` and
  `cursor.agents.{list, launch, get, delete, conversation, followup, stop}`.
- **`passThrough.openaiPassthrough`** — recommended `/openai_passthrough` prefix
  alongside the legacy `passThrough.openai` (now `@deprecated`).
- **`passThrough.assemblyAiEu`** — AssemblyAI EU prefix `/eu.assemblyai`.
- **Realtime event-type discriminated union** — `RealtimeClientEvent`,
  `RealtimeServerEvent`, plus `Known*` variants for exhaustive `switch`
  narrowing across 38 documented event types (`session.update`,
  `response.created`, `response.audio.delta`, etc.). Two-tier `Known | Unknown`
  pattern preserves both narrowing and forward-compat with new event types.
- **`LiteLLMForwardingOverrides`** shared mixin (`timeout`, `api_base`,
  `api_version`, `api_key`, `api_type`, `num_retries`) applied to chat,
  embeddings, images, audio, and responses param types.
- **Multipart support for `client.anthropic.skills.create()`** — was previously
  marshaling JSON, now correctly sends multipart/form-data with `display_title`
  + `files[]`. `anthropic-beta: skills-2025-10-02` header auto-injected on every
  skills method (exported as `ANTHROPIC_BETA_SKILLS`).
- RAG vector-store config typed as a discriminated union over
  `custom_llm_provider` (OpenAI / Bedrock / Vertex AI / S3 Vectors) with
  provider-specific fields like `aws_region_name`, `gcs_bucket`,
  `vector_bucket_name`, etc.
- Moderations input widened to multi-modal array
  (`{type:'image_url', image_url:{url}} | {type:'text', text}`).
- Assistants gained `custom_llm_provider`, `tool_choice`, `response_format`,
  `parallel_tool_calls`, `truncation_strategy` on run params.
- Vector store search params gained `custom_llm_provider`,
  `litellm_embedding_model`, `azure_search_service_name`, `milvus_text_field`,
  etc.
- A2A JSON-RPC envelope now correctly typed (`kind` discriminator;
  `jsonrpc`/`id`/`method` required); typed `A2ATaskResult` with
  `status` + `artifacts[]`.
- MCP types: `'jwt_signer'` added to `MCPAuthType`; registry/discover/openapi
  responses tightened.
- Search params: `search_provider` discriminator + Tavily/Serper-specific fields
  (`topic`, `search_depth`, `gl`, `hl`, `tbs`, `page`, etc.).
- Customers gained `object_permission` (extracted to shared `common.ts`).
- `responses.compact()` types fleshed out per LiteLLM spec
  (`model`, `input`, `instructions`, `previous_response_id` on params;
  `created_at`, `output[]`, `usage` on response).
- `ContainerObject` gained explicit `expires_at` and `file_ids` fields.
- Comprehensive JSDoc upgraded across all 42 resource files (~341 methods)
  with `@see` linking to the canonical LiteLLM docs page.

### Deprecated
- **`AssistantsResource`** — OpenAI is sunsetting the Assistants API on
  **2026-08-26**. The `client.assistants.*` surface is now tagged `@deprecated`
  and frozen — no further parity work or field updates. New integrations should
  use `client.responses` (the Responses API). The SDK keeps the resource for
  backwards compatibility until the upstream endpoint stops responding.

### Changed
- Anthropic Skills `create()` request shape changed (multipart now). **Breaking**
  if you were calling it before — the previous JSON form would have failed at
  runtime against any real Anthropic backend.
- Gemini Interactions request/response re-modeled to match the LiteLLM proxy
  adapter shape (snake_case `input` / `previous_interaction_id` /
  `system_instruction` / `generation_config`; response `outputs[]` / `usage` /
  `status`). **Breaking** for any caller relying on the old camelCase shape.
- `RagVectorStoreConfig` is now a discriminated union; old single-shape consumers
  with `custom_llm_provider: 'openai'` continue to work.
- `cache.ping()` now hits `GET /cache/ping` (was `GET /ping` — the proxy's
  liveness probe). **Breaking** for any caller depending on the old response
  shape; use `client.health.liveness()` for the proxy-liveness equivalent.
- Fine-tuning `custom_llm_provider` is now required on `FineTuningCreateParams`
  (per LiteLLM docs).

### Fixed
- A2A message parts now use `kind` discriminator (was incorrectly `type`).
- spend `calculate()` and `global()` JSDoc paths corrected to match runtime
  behavior.
- `videos.error` is now typed as `string` (was `Record<string, unknown>`).
- `videos.input_reference` widened to accept either a string ID or an
  OpenAI-style file object `{ file_id, ... }`.

### Tests
- 549+ unit tests with **100% statements / 99.83% branches / 100% functions /
  100% lines** coverage (was 478 / 98.76% / 91.76% / 99.79% / 99.09%).
- E2E coverage extended to PromptsResource, ContainerFilesResource,
  `Stream.toArray()`, Realtime, Bedrock typed methods, Cursor Cloud Agents.

## [1.0.0] — 2026-04-27

Initial production release.

### Added
- Full coverage of the LiteLLM proxy surface across 41 resource modules:
  chat completions, completions, embeddings, images, audio (speech /
  transcriptions / translations), moderations, rerank, responses, batches,
  files, fine-tuning jobs, assistants (with threads / messages / runs),
  vector stores, containers, evals, realtime, videos, OCR, search, RAG,
  Anthropic-native messages + skills, Gemini-native generate / stream /
  count tokens / interactions, generic provider passthrough for 13
  providers, MCP (servers / tools / toolsets / access groups / network /
  registry / user credentials), agents, A2A, models (CRUD + metrics +
  cost map), keys, users, teams, organizations, customers, budgets,
  spend, cost, guardrails, credentials, tags, cache, health, compliance,
  utils.
- Streaming for chat / text completions, responses, anthropic messages,
  and gemini `streamGenerateContent` via async-iterable `Stream<T>`.
- Typed error hierarchy (`AuthenticationError`, `PermissionDeniedError`,
  `NotFoundError`, `RateLimitError`, `InternalServerError`,
  `ConnectionError`, `TimeoutError`).
- Automatic retry with exponential backoff on `408 / 409 / 429 / 5xx` and
  network errors, honoring `Retry-After`.
- Per-request `timeout`, `maxRetries`, `headers`, `signal`, and `query`
  override via `RequestOptions`.
- Custom `fetch` injection for edge runtimes and tests.
- TypeScript types for every documented request and response shape.

### Tested
- 455 unit tests with a 90 % coverage gate (statements / branches /
  functions / lines), enforced in CI on Node 18 / 20 / 22.
- End-to-end suite running the official LiteLLM proxy container against
  Postgres, exercising chat / streaming / embeddings / images / audio /
  moderations / rerank / batches / files / vector stores / MCP /
  passthroughs / management endpoints. Runs post-merge on `main` with
  any of the supported provider keys.

[Unreleased]: https://github.com/visgotti/litellm-client/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/visgotti/litellm-client/releases/tag/v1.0.0
