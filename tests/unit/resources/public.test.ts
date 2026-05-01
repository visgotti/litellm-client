/**
 * @group unit
 */
import { PublicResource } from '../../../src/resources/public';

describe('PublicResource', () => {
  let request: jest.Mock;
  let r: PublicResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new PublicResource(request as any);
  });

  it.each([
    ['modelHub', '/public/model_hub'],
    ['agentHub', '/public/agent_hub'],
    ['mcpHub', '/public/mcp_hub'],
    ['skillHub', '/public/skill_hub'],
    ['modelHubInfo', '/public/model_hub/info'],
    ['providers', '/public/providers'],
    ['providerFields', '/public/providers/fields'],
    ['litellmModelCostMap', '/public/litellm_model_cost_map'],
    ['litellmBlogPosts', '/public/litellm_blog_posts'],
    ['endpoints', '/public/endpoints'],
    ['agentFields', '/public/agents/fields'],
  ])('%s GETs %s', async (method, path) => {
    await (r as unknown as Record<string, () => Promise<unknown>>)[method]();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe(path);
    expect(arg.body).toBeUndefined();
  });
});
