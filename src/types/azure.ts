// ─────────────────────────────────────────────────────────────────────────────
// Azure OpenAI pass-through types.
// References:
//   https://learn.microsoft.com/en-us/azure/ai-services/openai/reference
//
// Azure OpenAI's REST API is OpenAI-compatible but uses
// `/openai/deployments/{deployment}/...` paths and an `api-version` query
// parameter. The body shapes match the OpenAI types we already define, so we
// re-export them here as Azure-named aliases.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatCompletionCreateParams, ChatCompletion } from './chat';
import type {
  CompletionCreateParams,
  Completion,
} from './completions';
import type { EmbeddingCreateParams, EmbeddingResponse } from './embeddings';
import type {
  TranscriptionCreateParams,
  Transcription,
  TranscriptionVerbose,
} from './audio';
import type { ImageGenerateParams, ImageResponse } from './images';

export type AzureChatCompletionCreateParams = ChatCompletionCreateParams;
export type AzureChatCompletion = ChatCompletion;

export type AzureCompletionCreateParams = CompletionCreateParams;
export type AzureCompletion = Completion;

export type AzureEmbeddingCreateParams = EmbeddingCreateParams;
export type AzureEmbeddingResponse = EmbeddingResponse;

export type AzureImageGenerateParams = ImageGenerateParams;
export type AzureImageResponse = ImageResponse;

export type AzureTranscriptionCreateParams = TranscriptionCreateParams;
export type AzureTranscription = Transcription;
export type AzureTranscriptionVerbose = TranscriptionVerbose;

/**
 * Default Azure OpenAI API version used when callers don't pass one explicitly.
 * Pinned to a stable GA version; override per-call as needed.
 */
export const DEFAULT_AZURE_API_VERSION = '2024-10-21';
