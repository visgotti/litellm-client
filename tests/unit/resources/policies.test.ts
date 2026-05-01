/**
 * @group unit
 */
import { PoliciesResource } from '../../../src/resources/policies';

describe('PoliciesResource', () => {
  let request: jest.Mock;
  let r: PoliciesResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new PoliciesResource(request as any);
  });

  // ── /policies CRUD ─────────────────────────────────────────────────────

  it('list GETs /policies/list with query', async () => {
    await r.list({ page: 2, status: 'enabled' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/policies/list');
    expect(arg.options.query).toMatchObject({ page: 2, status: 'enabled' });
  });

  it('list GETs /policies/list with no params (default branch)', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/policies/list');
    expect(arg.options.query).toEqual({});
  });

  it('create POSTs /policies', async () => {
    await r.create({ policy_name: 'p1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policies',
        body: { kind: 'json', value: { policy_name: 'p1' } },
      }),
    );
  });

  it('retrieve GETs /policies/{policy_id}', async () => {
    await r.retrieve('pid-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/policies/pid-1' }),
    );
  });

  it('update PUTs /policies/{policy_id}', async () => {
    await r.update('pid-1', { status: 'disabled' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/policies/pid-1',
        body: { kind: 'json', value: { status: 'disabled' } },
      }),
    );
  });

  it('updateStatus PUTs /policies/{policy_id}/status', async () => {
    await r.updateStatus('pid-1', { status: 'enabled' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('PUT');
    expect(arg.path).toBe('/policies/pid-1/status');
    expect(arg.body).toEqual({ kind: 'json', value: { status: 'enabled' } });
  });

  it('delete DELETEs /policies/{policy_id}', async () => {
    await r.delete('pid-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/policies/pid-1' }),
    );
  });

  it('listVersions GETs /policies/name/{policy_name}/versions', async () => {
    await r.listVersions('p1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/policies/name/p1/versions',
      }),
    );
  });

  it('createVersion POSTs /policies/name/{policy_name}/versions', async () => {
    await r.createVersion('p1', { policy_name: 'p1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policies/name/p1/versions',
        body: { kind: 'json', value: { policy_name: 'p1' } },
      }),
    );
  });

  it('deleteAllVersions DELETEs /policies/name/{policy_name}/all-versions', async () => {
    await r.deleteAllVersions('p1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/policies/name/p1/all-versions',
      }),
    );
  });

  it('compare GETs /policies/compare with query', async () => {
    await r.compare({ policy_id_a: 'a', policy_id_b: 'b' });
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/policies/compare');
    expect(arg.options.query).toMatchObject({ policy_id_a: 'a', policy_id_b: 'b' });
  });

  it('compare GETs /policies/compare with no params (default branch)', async () => {
    await r.compare();
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/policies/compare');
    expect(arg.options.query).toEqual({});
  });

  it('resolvedGuardrails GETs /policies/{policy_id}/resolved-guardrails', async () => {
    await r.resolvedGuardrails('pid-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/policies/pid-1/resolved-guardrails',
      }),
    );
  });

  it('testPipeline POSTs /policies/test-pipeline', async () => {
    await r.testPipeline({ messages: [] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policies/test-pipeline',
        body: { kind: 'json', value: { messages: [] } },
      }),
    );
  });

  it('resolve POSTs /policies/resolve', async () => {
    await r.resolve({ context: { team_id: 't' } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policies/resolve',
        body: { kind: 'json', value: { context: { team_id: 't' } } },
      }),
    );
  });

  // ── attachments ────────────────────────────────────────────────────────

  it('attachments.list GETs /policies/attachments/list with filters', async () => {
    await r.attachments.list({ policy_id: 'pid-1' });
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/policies/attachments/list');
    expect(arg.options.query).toMatchObject({ policy_id: 'pid-1' });
  });

  it('attachments.list GETs /policies/attachments/list with no params (default branch)', async () => {
    await r.attachments.list();
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/policies/attachments/list');
    expect(arg.options.query).toEqual({});
  });

  it('attachments.create POSTs /policies/attachments', async () => {
    await r.attachments.create({ policy_id: 'pid-1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policies/attachments',
        body: { kind: 'json', value: { policy_id: 'pid-1' } },
      }),
    );
  });

  it('attachments.retrieve GETs /policies/attachments/{id}', async () => {
    await r.attachments.retrieve('att-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/policies/attachments/att-1',
      }),
    );
  });

  it('attachments.delete DELETEs /policies/attachments/{id}', async () => {
    await r.attachments.delete('att-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/policies/attachments/att-1',
      }),
    );
  });

  it('attachments.estimateImpact POSTs /policies/attachments/estimate-impact', async () => {
    await r.attachments.estimateImpact({ policy_id: 'pid-1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policies/attachments/estimate-impact',
        body: { kind: 'json', value: { policy_id: 'pid-1' } },
      }),
    );
  });

  // ── /policy templates / catalog ────────────────────────────────────────

  it('listCatalog GETs /policy/list', async () => {
    await r.listCatalog();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/policy/list' }),
    );
  });

  it('catalogInfo GETs /policy/info/{policy_name}', async () => {
    await r.catalogInfo('content_safety');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/policy/info/content_safety',
      }),
    );
  });

  it('validate POSTs /policy/validate', async () => {
    await r.validate({ policy: {} });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policy/validate',
        body: { kind: 'json', value: { policy: {} } },
      }),
    );
  });

  it('testCatalog POSTs /policy/test', async () => {
    await r.testCatalog({ messages: [] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policy/test',
        body: { kind: 'json', value: { messages: [] } },
      }),
    );
  });

  it('testPoliciesAndGuardrails POSTs /utils/test_policies_and_guardrails', async () => {
    await r.testPoliciesAndGuardrails({ messages: [] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/utils/test_policies_and_guardrails',
        body: { kind: 'json', value: { messages: [] } },
      }),
    );
  });

  it('templates.list GETs /policy/templates', async () => {
    await r.templates.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/policy/templates' }),
    );
  });

  it('templates.enrich POSTs /policy/templates/enrich', async () => {
    await r.templates.enrich({ template: 't' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policy/templates/enrich',
        body: { kind: 'json', value: { template: 't' } },
      }),
    );
  });

  it('templates.suggest POSTs /policy/templates/suggest', async () => {
    await r.templates.suggest({ context: 'c' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policy/templates/suggest',
        body: { kind: 'json', value: { context: 'c' } },
      }),
    );
  });

  it('templates.test POSTs /policy/templates/test', async () => {
    await r.templates.test({ template: 't' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policy/templates/test',
        body: { kind: 'json', value: { template: 't' } },
      }),
    );
  });

  it('templates.enrichStream POSTs /policy/templates/enrich/stream', async () => {
    await r.templates.enrichStream({ template: 't' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/policy/templates/enrich/stream',
        body: { kind: 'json', value: { template: 't' } },
      }),
    );
  });
});
