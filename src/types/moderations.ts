// ─────────────────────────────────────────────────────────────────────────────
// Moderations API
// ─────────────────────────────────────────────────────────────────────────────

export type ModerationModel =
  | 'text-moderation-latest'
  | 'text-moderation-stable'
  | 'omni-moderation-latest'
  | (string & {});

export interface ModerationCreateParams {
  input: string | string[];
  model?: ModerationModel;
}

export interface ModerationCategories {
  sexual: boolean;
  hate: boolean;
  harassment: boolean;
  'self-harm': boolean;
  'sexual/minors': boolean;
  'hate/threatening': boolean;
  'violence/graphic': boolean;
  'self-harm/intent': boolean;
  'self-harm/instructions': boolean;
  'harassment/threatening': boolean;
  violence: boolean;
  illicit?: boolean;
  'illicit/violent'?: boolean;
  [key: string]: boolean | undefined;
}

export type ModerationCategoryScores = {
  [K in keyof ModerationCategories]: number;
};

export interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategories;
  category_scores: ModerationCategoryScores;
  category_applied_input_types?: { [k: string]: string[] };
}

export interface ModerationResponse {
  id: string;
  model: string;
  results: ModerationResult[];
}
