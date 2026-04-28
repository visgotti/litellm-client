/**
 * @group unit
 */
import { RagResource } from '../../../src/resources/rag';

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
});
