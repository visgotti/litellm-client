/**
 * @group unit
 */
import { RagResource } from '../../../src/resources/rag';
import type {
  RagIngestParams,
  RagIngestResponse,
  RagQueryResponse,
  RagVectorStoreBedrock,
  RagVectorStoreVertexAI,
  RagVectorStoreS3Vectors,
} from '../../../src/types/rag';

describe('RagResource', () => {
  let request: jest.Mock;
  let r: RagResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new RagResource(request as any);
  });

  it('ingest POSTs /v1/rag/ingest', async () => {
    await r.ingest({
      ingest_options: { vector_store: { custom_llm_provider: 'openai' } },
      file_url: 'https://example.com/doc.pdf',
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/rag/ingest',
        body: {
          kind: 'json',
          value: {
            ingest_options: { vector_store: { custom_llm_provider: 'openai' } },
            file_url: 'https://example.com/doc.pdf',
          },
        },
      }),
    );
  });

  it('ingest forwards name and chunking_strategy in ingest_options', async () => {
    const params: RagIngestParams = {
      ingest_options: {
        name: 'docs-pipeline',
        chunking_strategy: { chunk_size: 500, chunk_overlap: 100 },
        vector_store: { custom_llm_provider: 'openai' },
      },
      file: {
        filename: 'doc.txt',
        content: 'aGVsbG8=',
        content_type: 'text/plain',
      },
    };
    await r.ingest(params);
    const sent = request.mock.calls[0][0].body.value as RagIngestParams;
    expect(sent.ingest_options.name).toBe('docs-pipeline');
    expect(sent.ingest_options.chunking_strategy).toEqual({
      chunk_size: 500,
      chunk_overlap: 100,
    });
    expect(sent.file?.content_type).toBe('text/plain');
  });

  it('ingest accepts a typed Bedrock vector_store', async () => {
    const bedrock: RagVectorStoreBedrock = {
      custom_llm_provider: 'bedrock',
      wait_for_ingestion: true,
      ingestion_timeout: 600,
      s3_bucket: 'my-bucket',
      s3_prefix: 'data/',
      embedding_model: 'amazon.titan-embed-text-v2:0',
      aws_region_name: 'us-west-2',
    };
    await r.ingest({
      ingest_options: { vector_store: bedrock },
      file_id: 'file_123',
    });
    const sent = request.mock.calls[0][0].body.value as RagIngestParams;
    expect(sent.ingest_options.vector_store).toEqual(bedrock);
    expect(sent.file_id).toBe('file_123');
  });

  it('ingest accepts a typed Vertex AI vector_store', async () => {
    const vertex: RagVectorStoreVertexAI = {
      custom_llm_provider: 'vertex_ai',
      vector_store_id: 'corpus-1',
      gcs_bucket: 'my-gcs',
      vertex_project: 'my-project',
      vertex_location: 'us-central1',
      wait_for_import: false,
      import_timeout: 900,
    };
    await r.ingest({
      ingest_options: { vector_store: vertex },
      file_url: 'https://example.com/doc.pdf',
    });
    const sent = request.mock.calls[0][0].body.value as RagIngestParams;
    expect(sent.ingest_options.vector_store).toEqual(vertex);
  });

  it('ingest accepts a typed AWS S3 Vectors vector_store', async () => {
    const s3v: RagVectorStoreS3Vectors = {
      custom_llm_provider: 's3_vectors',
      vector_bucket_name: 'my-embeddings',
      index_name: 'idx-1',
      dimension: 1536,
      distance_metric: 'cosine',
      non_filterable_metadata_keys: ['source_text'],
      aws_region_name: 'us-west-2',
    };
    await r.ingest({
      ingest_options: { vector_store: s3v },
      file_url: 'https://example.com/doc.pdf',
    });
    const sent = request.mock.calls[0][0].body.value as RagIngestParams;
    expect(sent.ingest_options.vector_store).toEqual(s3v);
  });

  it('ingest accepts an unknown provider via the open fallback', async () => {
    await r.ingest({
      ingest_options: {
        vector_store: {
          custom_llm_provider: 'pinecone',
          some_future_param: 42,
        },
      },
      file_url: 'https://example.com/doc.pdf',
    });
    const sent = request.mock.calls[0][0].body.value as RagIngestParams;
    expect(sent.ingest_options.vector_store).toEqual({
      custom_llm_provider: 'pinecone',
      some_future_param: 42,
    });
  });

  it('ingest returns id and status from the response shape', async () => {
    const fake: RagIngestResponse = {
      id: 'ingest_abc123',
      status: 'completed',
      vector_store_id: 'vs_xyz789',
      file_id: 'file_123',
    };
    request.mockResolvedValueOnce(fake);
    const result = await r.ingest({
      ingest_options: { vector_store: { custom_llm_provider: 'openai' } },
      file_id: 'file_123',
    });
    expect(result.id).toBe('ingest_abc123');
    expect(result.status).toBe('completed');
    expect(result.vector_store_id).toBe('vs_xyz789');
  });

  it('query POSTs /v1/rag/query', async () => {
    await r.query({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'What is LiteLLM?' }],
      retrieval_config: {
        vector_store_id: 'vs_abc',
        custom_llm_provider: 'openai',
        top_k: 5,
      },
      rerank: { enabled: true, model: 'cohere/rerank-english-v3.0', top_n: 3 },
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/rag/query');
    expect(arg.body.value.model).toBe('gpt-4o-mini');
    expect(arg.body.value.retrieval_config.vector_store_id).toBe('vs_abc');
    expect(arg.body.value.rerank.top_n).toBe(3);
  });

  it('query response surfaces created and _hidden_params metadata', async () => {
    const fake: RagQueryResponse = {
      id: 'chatcmpl-abc123',
      object: 'chat.completion',
      created: 1703123456,
      model: 'gpt-4o-mini',
      choices: [{ index: 0, message: { role: 'assistant', content: 'hi' } }],
      _hidden_params: {
        search_results: [{ id: 'doc-1', score: 0.9 }],
        rerank_results: [{ id: 'doc-1', score: 0.95 }],
      },
    };
    request.mockResolvedValueOnce(fake);
    const result = await r.query({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hi' }],
      retrieval_config: { vector_store_id: 'vs_abc' },
    });
    expect(result.created).toBe(1703123456);
    expect(result._hidden_params?.search_results).toEqual([
      { id: 'doc-1', score: 0.9 },
    ]);
    expect(result._hidden_params?.rerank_results).toEqual([
      { id: 'doc-1', score: 0.95 },
    ]);
  });
});
