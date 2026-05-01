// ─────────────────────────────────────────────────────────────────────────────
// Moderations API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Moderation model identifier.
 *
 * - `text-moderation-latest`: Latest text-only OpenAI moderation model.
 * - `text-moderation-stable`: Stable text-only OpenAI moderation model.
 * - `omni-moderation-latest`: Multi-modal moderation model accepting text and image inputs.
 */
export type ModerationModel =
  | 'text-moderation-latest'
  | 'text-moderation-stable'
  | 'omni-moderation-latest'
  | (string & {});

/** Multi-modal input element (omni-moderation models). */
export type ModerationInputElement =
  | string
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

/**
 * Parameters for classifying content for policy violations.
 *
 * @see https://docs.litellm.ai/docs/moderation
 */
export interface ModerationCreateParams {
  /** Text or multi-modal input to classify. */
  input:
    | string
    | string[]
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
  /** Moderation model to use. */
  model?: ModerationModel;
}

/**
 * Boolean flags per moderation category.
 *
 * @see https://docs.litellm.ai/docs/moderation
 */
export interface ModerationCategories {
  /** Sexual content. */
  sexual: boolean;
  /** Hateful content. */
  hate: boolean;
  /** Harassment. */
  harassment: boolean;
  /** Self-harm content. */
  'self-harm': boolean;
  /** Sexual content involving minors. */
  'sexual/minors': boolean;
  /** Hate speech with threats. */
  'hate/threatening': boolean;
  /** Graphic violence. */
  'violence/graphic': boolean;
  /** Self-harm with declared intent. */
  'self-harm/intent': boolean;
  /** Self-harm instructions. */
  'self-harm/instructions': boolean;
  /** Harassment with threats. */
  'harassment/threatening': boolean;
  /** Violent content. */
  violence: boolean;
  /** Illicit-activity content (omni-moderation only). */
  illicit?: boolean;
  /** Illicit-activity content involving violence (omni-moderation only). */
  'illicit/violent'?: boolean;
  /** Free-form additional categories returned by the upstream provider. */
  [key: string]: boolean | undefined;
}

/** Numeric confidence scores (0–1) for each moderation category. */
export type ModerationCategoryScores = {
  [K in keyof ModerationCategories]: number;
};

/**
 * Moderation result for a single input element.
 *
 * @see https://docs.litellm.ai/docs/moderation
 */
export interface ModerationResult {
  /** `true` if the content violates any policy. */
  flagged: boolean;
  /** Per-category booleans describing which policies were violated. */
  categories: ModerationCategories;
  /** Per-category confidence scores. */
  category_scores: ModerationCategoryScores;
  /** Map from category to which input modalities triggered it (omni-moderation). */
  category_applied_input_types?: { [k: string]: string[] };
}

/**
 * Moderation response payload.
 *
 * @see https://docs.litellm.ai/docs/moderation
 */
export interface ModerationResponse {
  /** Unique identifier for this moderation request. */
  id: string;
  /** Model that produced the classification. */
  model: string;
  /** One result per input element, in the same order. */
  results: ModerationResult[];
}
