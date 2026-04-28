// ─────────────────────────────────────────────────────────────────────────────
// Pass-through resource — typed escape hatch for provider catch-all routes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Names of every supported pass-through provider on the LiteLLM proxy.
 * Each maps to a URL prefix served by the proxy.
 */
export type PassThroughProviderName =
  | 'anthropic'
  | 'gemini'
  | 'vertex'
  | 'cohere'
  | 'mistral'
  | 'vllm'
  | 'milvus'
  | 'bedrock'
  | 'assemblyAi'
  | 'azure'
  | 'openai'
  | 'cursor'
  | 'langfuse';

/** URL prefix associated with a pass-through provider. */
export const PASS_THROUGH_PREFIXES: Record<PassThroughProviderName, string> = {
  anthropic: '/anthropic',
  gemini: '/gemini',
  vertex: '/vertex_ai',
  cohere: '/cohere',
  mistral: '/mistral',
  vllm: '/vllm',
  milvus: '/milvus',
  bedrock: '/bedrock',
  assemblyAi: '/assemblyai',
  azure: '/azure',
  openai: '/openai',
  cursor: '/cursor',
  langfuse: '/langfuse',
};
