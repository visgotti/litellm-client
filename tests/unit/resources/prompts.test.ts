/**
 * @group unit
 */
import { PromptsResource } from '../../../src/resources/prompts';

describe('PromptsResource', () => {
  let request: jest.Mock;
  let r: PromptsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new PromptsResource(request as any);
  });

  it('create POSTs /prompts', async () => {
    const params = {
      prompt_id: 'simple_prompt',
      name: 'Simple Prompt',
      description: 'a basic prompt',
      prompt_template: [{ role: 'system', content: 'You are helpful.' }],
      model: 'gpt-4',
      prompt_template_optional_params: { temperature: 0.7, max_tokens: 500 },
      tags: ['greeting'],
    };
    await r.create(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/prompts',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('retrieve GETs /prompts/{id} with encoded id', async () => {
    await r.retrieve('prompt id/1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/prompts/prompt%20id%2F1',
      }),
    );
  });

  it('update PUTs /prompts/{id} with partial body', async () => {
    await r.update('p1', {
      name: 'updated',
      prompt_template: [{ role: 'system', content: 'new' }],
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('PUT');
    expect(arg.path).toBe('/prompts/p1');
    expect(arg.body).toEqual({
      kind: 'json',
      value: {
        name: 'updated',
        prompt_template: [{ role: 'system', content: 'new' }],
      },
    });
  });

  it('delete DELETEs /prompts/{id}', async () => {
    await r.delete('p1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/prompts/p1' }),
    );
  });

  it('patch PATCHes /prompts/{id}', async () => {
    await r.patch('p1', { description: 'updated' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        path: '/prompts/p1',
        body: { kind: 'json', value: { description: 'updated' } },
      }),
    );
  });

  it('listLegacy GETs /prompts/list', async () => {
    await r.listLegacy();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/prompts/list' }),
    );
  });

  it('versions GETs /prompts/{id}/versions with optional environment query', async () => {
    await r.versions('p1', { environment: 'staging' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/prompts/p1/versions');
    expect(arg.options.query).toMatchObject({ environment: 'staging' });
  });

  it('versions GETs /prompts/{id}/versions with no params (default branch)', async () => {
    await r.versions('p1');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/prompts/p1/versions');
    expect(arg.options.query).toEqual({});
  });

  it('info GETs /prompts/{id}/info', async () => {
    await r.info('p1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/prompts/p1/info',
      }),
    );
  });

  it('test POSTs /prompts/test with dotprompt body', async () => {
    await r.test({
      dotprompt_content: '---\nmodel: gpt-4o\n---\nUser: Hi {{n}}',
      prompt_variables: { n: 'World' },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/prompts/test',
        body: {
          kind: 'json',
          value: {
            dotprompt_content: '---\nmodel: gpt-4o\n---\nUser: Hi {{n}}',
            prompt_variables: { n: 'World' },
          },
        },
      }),
    );
  });

  it('dotpromptJsonConverter POSTs /utils/dotprompt_json_converter as form', async () => {
    const form = new FormData();
    await r.dotpromptJsonConverter(form);
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/utils/dotprompt_json_converter');
    expect(arg.body.kind).toBe('form');
    expect(arg.body.value).toBe(form);
  });
});
