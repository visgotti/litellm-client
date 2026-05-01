/**
 * @group unit
 */
import { VectorStoresResource } from '../../../src/resources/vector_stores';

describe('VectorStoresResource', () => {
  let request: jest.Mock;
  let resource: VectorStoresResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    resource = new VectorStoresResource(request as any);
  });

  // ─── OpenAI-shape ──────────────────────────────────────────────────────────

  describe('create', () => {
    it('POSTs /v1/vector_stores with the body', async () => {
      await resource.create({ name: 'my-store', file_ids: ['file_1'] });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/vector_stores',
        body: { kind: 'json', value: { name: 'my-store', file_ids: ['file_1'] } },
        options: undefined,
      });
    });

    it('accepts no params', async () => {
      await resource.create();
      expect(request.mock.calls[0][0].body).toEqual({ kind: 'json', value: {} });
    });
  });

  describe('list', () => {
    it('GETs /v1/vector_stores with cursor params as query', async () => {
      await resource.list({ limit: 10, order: 'desc', after: 'vs_a', before: 'vs_b' });
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/vector_stores',
        options: {
          query: { limit: 10, order: 'desc', after: 'vs_a', before: 'vs_b' },
        },
      });
    });

    it('defaults to empty params', async () => {
      await resource.list();
      expect(request.mock.calls[0][0].path).toBe('/v1/vector_stores');
      expect(request.mock.calls[0][0].options.query).toEqual({});
    });
  });

  describe('retrieve', () => {
    it('GETs /v1/vector_stores/{id}', async () => {
      await resource.retrieve('vs_123');
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/vector_stores/vs_123',
        options: undefined,
      });
    });

    it('encodes path params with special characters', async () => {
      await resource.retrieve('vs id/with spaces&special?');
      expect(request.mock.calls[0][0].path).toBe(
        `/v1/vector_stores/${encodeURIComponent('vs id/with spaces&special?')}`,
      );
    });
  });

  describe('update', () => {
    it('POSTs /v1/vector_stores/{id} with body', async () => {
      await resource.update('vs_1', { name: 'renamed', metadata: { k: 'v' } });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/vector_stores/vs_1',
        body: { kind: 'json', value: { name: 'renamed', metadata: { k: 'v' } } },
        options: undefined,
      });
    });
  });

  describe('delete', () => {
    it('DELETEs /v1/vector_stores/{id}', async () => {
      await resource.delete('vs_1');
      expect(request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v1/vector_stores/vs_1',
        options: undefined,
      });
    });
  });

  describe('search', () => {
    it('POSTs /v1/vector_stores/{id}/search with body', async () => {
      await resource.search('vs_1', {
        query: 'hello',
        max_num_results: 5,
        filters: { type: { eq: 'doc' } },
        rewrite_query: true,
      });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/vector_stores/vs_1/search',
        body: {
          kind: 'json',
          value: {
            query: 'hello',
            max_num_results: 5,
            filters: { type: { eq: 'doc' } },
            rewrite_query: true,
          },
        },
        options: undefined,
      });
    });

    it('encodes vector store id in search path', async () => {
      await resource.search('vs/weird id', { query: 'q' });
      expect(request.mock.calls[0][0].path).toBe(
        `/v1/vector_stores/${encodeURIComponent('vs/weird id')}/search`,
      );
    });
  });

  // ─── Files sub-resource ────────────────────────────────────────────────────

  describe('files.create', () => {
    it('POSTs /v1/vector_stores/{id}/files', async () => {
      await resource.files.create('vs_1', { file_id: 'file_1', attributes: { lang: 'en' } });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/vector_stores/vs_1/files',
        body: { kind: 'json', value: { file_id: 'file_1', attributes: { lang: 'en' } } },
        options: undefined,
      });
    });
  });

  describe('files.list', () => {
    it('GETs /v1/vector_stores/{id}/files with query params', async () => {
      await resource.files.list('vs_1', { limit: 5, filter: 'completed', order: 'asc' });
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/vector_stores/vs_1/files',
        options: {
          query: { limit: 5, filter: 'completed', order: 'asc' },
        },
      });
    });

    it('defaults to empty params', async () => {
      await resource.files.list('vs_1');
      expect(request.mock.calls[0][0].options.query).toEqual({});
    });
  });

  describe('files.retrieve', () => {
    it('GETs /v1/vector_stores/{id}/files/{file_id}', async () => {
      await resource.files.retrieve('vs_1', 'file_1');
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/vector_stores/vs_1/files/file_1',
        options: undefined,
      });
    });
  });

  describe('files.content', () => {
    it('GETs /v1/vector_stores/{id}/files/{file_id}/content', async () => {
      await resource.files.content('vs_1', 'file_1');
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/vector_stores/vs_1/files/file_1/content',
        options: undefined,
      });
    });
  });

  describe('files.update', () => {
    it('POSTs /v1/vector_stores/{id}/files/{file_id}', async () => {
      await resource.files.update('vs_1', 'file_1', { attributes: { tag: 'a' } });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/vector_stores/vs_1/files/file_1',
        body: { kind: 'json', value: { attributes: { tag: 'a' } } },
        options: undefined,
      });
    });
  });

  describe('files.delete', () => {
    it('DELETEs /v1/vector_stores/{id}/files/{file_id}', async () => {
      await resource.files.delete('vs_1', 'file_1');
      expect(request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v1/vector_stores/vs_1/files/file_1',
        options: undefined,
      });
    });

    it('encodes both path params', async () => {
      await resource.files.delete('vs/1', 'file id');
      expect(request.mock.calls[0][0].path).toBe(
        `/v1/vector_stores/${encodeURIComponent('vs/1')}/files/${encodeURIComponent('file id')}`,
      );
    });
  });

  // ─── LiteLLM-shape management ──────────────────────────────────────────────

  describe('management.create', () => {
    it('POSTs /vector_store/new', async () => {
      await resource.management.create({
        vector_store_id: 'vs_1',
        custom_llm_provider: 'bedrock',
        vector_store_name: 'name',
      });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/vector_store/new',
        body: {
          kind: 'json',
          value: {
            vector_store_id: 'vs_1',
            custom_llm_provider: 'bedrock',
            vector_store_name: 'name',
          },
        },
        options: undefined,
      });
    });
  });

  describe('management.list', () => {
    it('GETs /vector_store/list with pagination', async () => {
      await resource.management.list({ page: 2, page_size: 50 });
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/vector_store/list',
        options: { query: { page: 2, page_size: 50 } },
      });
    });

    it('defaults to empty params', async () => {
      await resource.management.list();
      expect(request.mock.calls[0][0].options.query).toEqual({});
    });
  });

  describe('management.info', () => {
    it('POSTs /vector_store/info with body', async () => {
      await resource.management.info({ vector_store_id: 'vs_1' });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/vector_store/info',
        body: { kind: 'json', value: { vector_store_id: 'vs_1' } },
        options: undefined,
      });
    });
  });

  describe('management.update', () => {
    it('POSTs /vector_store/update', async () => {
      await resource.management.update({
        vector_store_id: 'vs_1',
        vector_store_name: 'new',
      });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/vector_store/update',
        body: {
          kind: 'json',
          value: { vector_store_id: 'vs_1', vector_store_name: 'new' },
        },
        options: undefined,
      });
    });
  });

  describe('management.delete', () => {
    it('POSTs /vector_store/delete', async () => {
      await resource.management.delete({ vector_store_id: 'vs_1' });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/vector_store/delete',
        body: { kind: 'json', value: { vector_store_id: 'vs_1' } },
        options: undefined,
      });
    });
  });

  // ─── Indexes ───────────────────────────────────────────────────────────────

  describe('indexes.create', () => {
    it('POSTs /v1/indexes with body', async () => {
      await resource.indexes.create({
        index_name: 'idx-1',
        litellm_params: {
          vector_store_index: 'real-index',
          vector_store_name: 'azure-ai-search',
        },
      });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/indexes',
        body: {
          kind: 'json',
          value: {
            index_name: 'idx-1',
            litellm_params: {
              vector_store_index: 'real-index',
              vector_store_name: 'azure-ai-search',
            },
          },
        },
        options: undefined,
      });
    });
  });

  // ─── Options forwarding ────────────────────────────────────────────────────

  describe('options forwarding', () => {
    it('forwards RequestOptions to retrieve', async () => {
      const signal = new AbortController().signal;
      await resource.retrieve('vs_1', { headers: { 'x-test': 'y' }, signal });
      expect(request.mock.calls[0][0].options).toEqual({
        headers: { 'x-test': 'y' },
        signal,
      });
    });

    it('merges options.query with list params', async () => {
      await resource.list({ limit: 5 }, { query: { extra: 'val' } });
      expect(request.mock.calls[0][0].options.query).toEqual({ extra: 'val', limit: 5 });
    });
  });
});
