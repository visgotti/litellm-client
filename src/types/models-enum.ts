// ─────────────────────────────────────────────────────────────────────────────
// LiteLLM provider prefixes & well-known model string literals
//
// These types give autocomplete / compile-time validation for the `model`
// field sent through the LiteLLM proxy.  Because LiteLLM also accepts any
// arbitrary string (custom deployments, fine-tunes, etc.) the union always
// includes `(string & {})` so unknown models still compile.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Provider prefixes ───────────────────────────────────────────────────────

/** All known LiteLLM provider routing prefixes */
export type LiteLLMProvider =
  | 'openai'
  | 'azure'
  | 'azure_ai'
  | 'azure_text'
  | 'anthropic'
  | 'bedrock'
  | 'vertex_ai'
  | 'gemini'
  | 'groq'
  | 'mistral'
  | 'cohere_chat'
  | 'deepseek'
  | 'fireworks_ai'
  | 'together_ai'
  | 'perplexity'
  | 'openrouter'
  | 'replicate'
  | 'huggingface'
  | 'ollama'
  | 'databricks'
  | 'cloudflare'
  | 'text-completion-openai'
  | 'sagemaker';

// ─── OpenAI models ───────────────────────────────────────────────────────────

export type OpenAIModel =
  // GPT-5 family
  | 'gpt-5'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'gpt-5-chat'
  | 'gpt-5-chat-latest'
  | 'gpt-5-pro'
  | 'gpt-5-2025-08-07'
  | 'gpt-5-mini-2025-08-07'
  | 'gpt-5-nano-2025-08-07'
  // GPT-5.1+
  | 'gpt-5.1'
  | 'gpt-5.1-codex'
  | 'gpt-5.1-codex-mini'
  | 'gpt-5.1-codex-max'
  // GPT-5.2+
  | 'gpt-5.2'
  | 'gpt-5.2-2025-12-11'
  | 'gpt-5.2-chat-latest'
  | 'gpt-5.2-pro'
  | 'gpt-5.2-pro-2025-12-11'
  // GPT-5.3 / 5.4
  | 'gpt-5.3-chat-latest'
  | 'gpt-5.4'
  | 'gpt-5.4-2026-03-05'
  | 'gpt-5.4-pro'
  | 'gpt-5.4-pro-2026-03-05'
  // GPT-4.1
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  // O-series reasoning
  | 'o4-mini'
  | 'o3'
  | 'o3-mini'
  | 'o3-pro'
  | 'o3-deep-research'
  | 'o1-mini'
  | 'o1-preview'
  // GPT-4o
  | 'gpt-4o'
  | 'gpt-4o-2024-08-06'
  | 'gpt-4o-2024-05-13'
  | 'gpt-4o-mini'
  | 'gpt-4o-mini-2024-07-18'
  // GPT-4
  | 'gpt-4-turbo'
  | 'gpt-4-turbo-preview'
  | 'gpt-4-0125-preview'
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-0613'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-4-32k-0613'
  // GPT-3.5
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0301'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-16k-0613'
  // Search
  | 'gpt-5-search-api'
  | 'gpt-4o-search-preview'
  | 'gpt-4o-mini-search-preview';

// ─── Anthropic / Claude models ───────────────────────────────────────────────

export type AnthropicModel =
  // Claude 4.x
  | 'claude-opus-4-6-20260205'
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-sonnet-4-5-20250929'
  | 'claude-opus-4-5-20251101'
  | 'claude-opus-4-5'
  | 'claude-opus-4-1-20250805'
  | 'claude-opus-4-1'
  | 'claude-opus-4-20250514'
  | 'claude-opus-4'
  | 'claude-sonnet-4-20250514'
  | 'claude-sonnet-4'
  | 'claude-4'
  // Claude 3.x
  | 'claude-3-7-sonnet-20250219'
  | 'claude-3.7'
  | 'claude-3-5-sonnet-20240620'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3.5'
  | 'claude-3-haiku-20240307'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3'
  // Claude 2.x & instant
  | 'claude-2.1'
  | 'claude-2'
  | 'claude-instant-1.2'
  | 'claude-instant-1';

// ─── Google / Gemini models ──────────────────────────────────────────────────

export type GeminiModel =
  | 'gemini/gemini-2.5-pro'
  | 'gemini/gemini-2.5-flash'
  | 'gemini/gemini-2.0-flash'
  | 'gemini/gemini-2.0-flash-lite'
  | 'gemini/gemini-1.5-pro'
  | 'gemini/gemini-1.5-flash'
  | 'gemini/gemini-1.0-pro';

// ─── Vertex AI (Google Cloud) ────────────────────────────────────────────────

export type VertexAIModel =
  | 'vertex_ai/gemini-2.5-pro'
  | 'vertex_ai/gemini-2.5-flash'
  | 'vertex_ai/gemini-2.0-flash'
  | 'vertex_ai/gemini-2.0-flash-lite'
  | 'vertex_ai/gemini-1.5-pro'
  | 'vertex_ai/gemini-1.5-flash'
  | 'vertex_ai/gemini-1.0-pro'
  | 'vertex_ai/claude-sonnet-4-5@20250929'
  | 'vertex_ai/claude-opus-4-1@20250805'
  | 'vertex_ai/claude-3-7-sonnet@20250219';

// ─── Mistral models ─────────────────────────────────────────────────────────

export type MistralModel =
  | 'mistral/mistral-small-latest'
  | 'mistral/mistral-medium-latest'
  | 'mistral/mistral-large-latest'
  | 'mistral/mistral-large-2407'
  | 'mistral/magistral-small-2506'
  | 'mistral/magistral-medium-2506'
  | 'mistral/open-mistral-7b'
  | 'mistral/open-mixtral-8x7b'
  | 'mistral/open-mixtral-8x22b'
  | 'mistral/codestral-latest'
  | 'mistral/open-mistral-nemo'
  | 'mistral/open-mistral-nemo-2407'
  | 'mistral/open-codestral-mamba'
  | 'mistral/codestral-mamba-latest'
  | 'mistral/mistral-embed';

// ─── Groq models ─────────────────────────────────────────────────────────────

export type GroqModel =
  | 'groq/llama-3.3-70b-versatile'
  | 'groq/llama-3.1-8b-instant'
  | 'groq/llama3-8b-8192'
  | 'groq/llama3-70b-8192'
  | 'groq/meta-llama/llama-4-scout-17b-16e-instruct'
  | 'groq/meta-llama/llama-4-maverick-17b-128e-instruct'
  | 'groq/meta-llama/llama-guard-4-12b'
  | 'groq/qwen/qwen3-32b'
  | 'groq/mixtral-8x7b-32768'
  | 'groq/whisper-large-v3';

// ─── Deepseek models ─────────────────────────────────────────────────────────

export type DeepseekModel =
  | 'deepseek/deepseek-chat'
  | 'deepseek/deepseek-coder'
  | 'deepseek/deepseek-reasoner';

// ─── Cohere models ───────────────────────────────────────────────────────────

export type CohereModel =
  | 'cohere_chat/command-a-03-2025'
  | 'cohere_chat/command-r-plus-08-2024'
  | 'cohere_chat/command-r-08-2024'
  | 'cohere_chat/command-r-plus'
  | 'cohere_chat/command-r'
  | 'cohere_chat/command-light'
  | 'cohere_chat/command-nightly';

// ─── AWS Bedrock models ──────────────────────────────────────────────────────

export type BedrockModel =
  | 'bedrock/anthropic.claude-3-5-sonnet-20240620-v1:0'
  | 'bedrock/anthropic.claude-3-haiku-20240307-v1:0'
  | 'bedrock/anthropic.claude-3-opus-20240229-v1:0'
  | 'bedrock/anthropic.claude-3-sonnet-20240229-v1:0'
  | 'bedrock/anthropic.claude-v2:1'
  | 'bedrock/anthropic.claude-v2'
  | 'bedrock/anthropic.claude-instant-v1'
  | 'bedrock/amazon.titan-text-express-v1'
  | 'bedrock/amazon.titan-text-lite-v1'
  | 'bedrock/meta.llama3-8b-instruct-v1:0'
  | 'bedrock/meta.llama3-70b-instruct-v1:0'
  | 'bedrock/mistral.mistral-7b-instruct-v0:2'
  | 'bedrock/mistral.mixtral-8x7b-instruct-v0:1';

// ─── Azure models ────────────────────────────────────────────────────────────

/** Azure uses `azure/<deployment-name>`, so the type is a branded prefix */
export type AzureModel = `azure/${string}`;

// ─── Together AI models ──────────────────────────────────────────────────────

export type TogetherAIModel =
  | 'together_ai/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
  | 'together_ai/meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
  | 'together_ai/meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  | 'together_ai/mistralai/Mixtral-8x7B-Instruct-v0.1'
  | 'together_ai/mistralai/Mistral-7B-Instruct-v0.1'
  | `together_ai/${string}`;

// ─── Fireworks AI models ─────────────────────────────────────────────────────

export type FireworksAIModel =
  | 'fireworks_ai/accounts/fireworks/models/llama-v3p1-405b-instruct'
  | 'fireworks_ai/accounts/fireworks/models/llama-v3p1-70b-instruct'
  | 'fireworks_ai/accounts/fireworks/models/llama-v3p1-8b-instruct'
  | `fireworks_ai/${string}`;

// ─── Perplexity models ───────────────────────────────────────────────────────

export type PerplexityModel =
  | 'perplexity/sonar-pro'
  | 'perplexity/sonar'
  | 'perplexity/sonar-deep-research'
  | 'perplexity/sonar-reasoning-pro'
  | 'perplexity/sonar-reasoning'
  | `perplexity/${string}`;

// ─── OpenRouter models ───────────────────────────────────────────────────────

export type OpenRouterModel =
  | 'openrouter/openai/gpt-4o'
  | 'openrouter/anthropic/claude-3-opus'
  | 'openrouter/google/gemini-pro'
  | `openrouter/${string}`;

// ─── Ollama models ───────────────────────────────────────────────────────────

export type OllamaModel =
  | 'ollama/llama3'
  | 'ollama/llama3:70b'
  | 'ollama/mistral'
  | 'ollama/codellama'
  | 'ollama/phi3'
  | `ollama/${string}`;

// ─── Replicate models ────────────────────────────────────────────────────────

export type ReplicateModel = `replicate/${string}`;

// ─── Hugging Face models ─────────────────────────────────────────────────────

export type HuggingFaceModel = `huggingface/${string}`;

// ─── Databricks models ───────────────────────────────────────────────────────

export type DatabricksModel = `databricks/${string}`;

// ─── Sagemaker models ────────────────────────────────────────────────────────

export type SagemakerModel = `sagemaker/${string}`;

// ─── Embedding-specific models ───────────────────────────────────────────────

export type EmbeddingModel =
  // OpenAI
  | 'text-embedding-3-small'
  | 'text-embedding-3-large'
  | 'text-embedding-ada-002'
  // Cohere
  | 'embed-english-v3.0'
  | 'embed-english-light-v3.0'
  | 'embed-multilingual-v3.0'
  | 'embed-multilingual-light-v3.0'
  | 'embed-english-v2.0'
  | 'embed-english-light-v2.0'
  | 'embed-multilingual-v2.0'
  // Mistral
  | 'mistral/mistral-embed'
  // Bedrock
  | 'bedrock/amazon.titan-embed-text-v1'
  | 'bedrock/amazon.titan-embed-text-v2:0'
  | 'bedrock/cohere.embed-english-v3'
  | 'bedrock/cohere.embed-multilingual-v3';

// ─── Unified model type ──────────────────────────────────────────────────────

/**
 * Union of all known LiteLLM chat/completion model identifiers.
 * Includes `(string & {})` so custom or unlisted models still compile
 * while known models get full autocomplete.
 */
export type ChatModel =
  | OpenAIModel
  | AnthropicModel
  | GeminiModel
  | VertexAIModel
  | MistralModel
  | GroqModel
  | DeepseekModel
  | CohereModel
  | BedrockModel
  | AzureModel
  | TogetherAIModel
  | FireworksAIModel
  | PerplexityModel
  | OpenRouterModel
  | OllamaModel
  | ReplicateModel
  | HuggingFaceModel
  | DatabricksModel
  | SagemakerModel
  // Allow any string for custom deployments / unlisted models
  | (string & {});

/**
 * Union of known embedding model identifiers.
 * Also allows arbitrary strings for custom deployments.
 */
export type EmbeddingModelId =
  | EmbeddingModel
  | (string & {});
