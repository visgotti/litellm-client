# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/visgotti/litellm-proxy/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/visgotti/litellm-proxy/releases/tag/v1.0.0
