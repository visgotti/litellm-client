// ─────────────────────────────────────────────────────────────────────────────
// Milvus pass-through types.
// References:
//   https://milvus.io/api-reference/restful/v2.5.x/About.md
//
// The Milvus v2 RESTful API has wide, schema-driven request/response payloads.
// To keep the TypeScript surface useful without locking callers into one Milvus
// version's collection schema, the request bodies are typed with a small set of
// known fields plus an open `[key: string]: unknown` index signature; responses
// follow the standard `{ code, data, message? }` envelope.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Common envelope ─────────────────────────────────────────────────────────

export interface MilvusResponse<TData = unknown> {
  code: number;
  data?: TData;
  message?: string;
  cost?: number;
  [key: string]: unknown;
}

export interface MilvusEmptyResponse extends MilvusResponse<Record<string, never>> {}

// ─── Collections ─────────────────────────────────────────────────────────────

export interface MilvusCollectionsListParams {
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusCollectionsListResponse = MilvusResponse<string[]>;

export interface MilvusFieldSchema {
  fieldName: string;
  dataType: string;
  isPrimary?: boolean;
  isPartitionKey?: boolean;
  isClusteringKey?: boolean;
  autoID?: boolean;
  nullable?: boolean;
  defaultValue?: unknown;
  elementTypeParams?: Record<string, unknown>;
  description?: string;
  [key: string]: unknown;
}

export interface MilvusCollectionSchema {
  fields?: MilvusFieldSchema[];
  enableDynamicField?: boolean;
  autoID?: boolean;
  [key: string]: unknown;
}

export interface MilvusIndexParam {
  fieldName: string;
  indexName?: string;
  metricType?: 'L2' | 'IP' | 'COSINE' | 'HAMMING' | 'JACCARD' | (string & {});
  indexType?: string;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MilvusCollectionCreateParams {
  collectionName: string;
  dbName?: string;
  dimension?: number;
  metricType?: 'L2' | 'IP' | 'COSINE' | (string & {});
  idType?: 'Int64' | 'VarChar' | (string & {});
  primaryFieldName?: string;
  vectorFieldName?: string;
  schema?: MilvusCollectionSchema;
  indexParams?: MilvusIndexParam[];
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MilvusCollectionDropParams {
  collectionName: string;
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusCollectionDescribeParams {
  collectionName: string;
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusCollectionDescription {
  collectionName: string;
  dbName?: string;
  description?: string;
  autoId?: boolean;
  enableDynamicField?: boolean;
  fields?: MilvusFieldSchema[];
  indexes?: Array<Record<string, unknown>>;
  load?: string;
  partitionsNum?: number;
  shardsNum?: number;
  consistencyLevel?: string;
  aliases?: string[];
  collectionID?: number;
  [key: string]: unknown;
}

export type MilvusCollectionDescribeResponse = MilvusResponse<MilvusCollectionDescription>;

// ─── Entities ────────────────────────────────────────────────────────────────

export interface MilvusSearchParams {
  collectionName: string;
  data: number[][] | Array<Record<string, unknown>>;
  annsField?: string;
  filter?: string;
  limit?: number;
  offset?: number;
  outputFields?: string[];
  groupingField?: string;
  partitionNames?: string[];
  searchParams?: Record<string, unknown>;
  consistencyLevel?: string;
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusSearchResponse = MilvusResponse<Array<Record<string, unknown>>>;

export interface MilvusInsertParams {
  collectionName: string;
  data: Array<Record<string, unknown>>;
  partitionName?: string;
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusInsertResult {
  insertCount?: number;
  insertIds?: Array<string | number>;
  [key: string]: unknown;
}

export type MilvusInsertResponse = MilvusResponse<MilvusInsertResult>;

export interface MilvusUpsertParams {
  collectionName: string;
  data: Array<Record<string, unknown>>;
  partitionName?: string;
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusUpsertResult {
  upsertCount?: number;
  upsertIds?: Array<string | number>;
  [key: string]: unknown;
}

export type MilvusUpsertResponse = MilvusResponse<MilvusUpsertResult>;

export interface MilvusDeleteParams {
  collectionName: string;
  filter?: string;
  id?: Array<string | number> | string | number;
  partitionName?: string;
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusDeleteResponse = MilvusResponse<Record<string, unknown>>;

export interface MilvusQueryParams {
  collectionName: string;
  filter?: string;
  outputFields?: string[];
  limit?: number;
  offset?: number;
  partitionNames?: string[];
  consistencyLevel?: string;
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusQueryResponse = MilvusResponse<Array<Record<string, unknown>>>;

// ─── Partitions ──────────────────────────────────────────────────────────────

export interface MilvusPartitionListParams {
  collectionName: string;
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusPartitionListResponse = MilvusResponse<string[]>;

export interface MilvusPartitionParams {
  collectionName: string;
  partitionName: string;
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusPartitionMultiParams {
  collectionName: string;
  partitionNames: string[];
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusPartitionHasResponse extends MilvusResponse<{ has: boolean }> {}

// ─── Indexes ─────────────────────────────────────────────────────────────────

export interface MilvusIndexCreateParams {
  collectionName: string;
  indexParams: MilvusIndexParam[];
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusIndexDropParams {
  collectionName: string;
  indexName: string;
  dbName?: string;
  [key: string]: unknown;
}

export interface MilvusIndexDescribeParams {
  collectionName: string;
  indexName: string;
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusIndexDescribeResponse = MilvusResponse<Record<string, unknown>>;

export interface MilvusIndexListParams {
  collectionName: string;
  dbName?: string;
  [key: string]: unknown;
}

export type MilvusIndexListResponse = MilvusResponse<string[]>;
