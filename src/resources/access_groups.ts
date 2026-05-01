import type {
  AccessGroupCreateParams,
  AccessGroupUpdateParams,
  AccessGroupResponse,
  ModelAccessGroupCreateParams,
  ModelAccessGroupUpdateParams,
  ModelAccessGroupMutationResponse,
  ModelAccessGroupInfo,
  ModelAccessGroupListResponse,
  ModelAccessGroupDeleteResponse,
} from '../types/access_groups';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Model-scoped access groups under `/access_group/...` — bundles of model
 * names that can be granted to teams/keys at once.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
class ModelAccessGroupsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new model access group (`POST /access_group/new`).
   *
   * @param params - Group name + model names / ids.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The mutation summary including how many deployments were updated.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
   */
  create(
    params: ModelAccessGroupCreateParams,
    options?: RequestOptions,
  ): Promise<ModelAccessGroupMutationResponse> {
    return this.request<ModelAccessGroupMutationResponse>({
      method: 'POST',
      path: '/access_group/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List all model access groups (`GET /access_group/list`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of groups + their deployment counts.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
   */
  list(options?: RequestOptions): Promise<ModelAccessGroupListResponse> {
    return this.request<ModelAccessGroupListResponse>({
      method: 'GET',
      path: '/access_group/list',
      options,
    });
  }

  /**
   * Get info for a single model access group
   * (`GET /access_group/{access_group}/info`).
   *
   * @param accessGroup - The group name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The group info.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
   */
  info(
    accessGroup: string,
    options?: RequestOptions,
  ): Promise<ModelAccessGroupInfo> {
    return this.request<ModelAccessGroupInfo>({
      method: 'GET',
      path: `/access_group/${encodeURIComponent(accessGroup)}/info`,
      options,
    });
  }

  /**
   * Update a model access group (`PUT /access_group/{access_group}/update`).
   *
   * @param accessGroup - The group name.
   * @param params - Replacement model names / ids.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The mutation summary.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
   */
  update(
    accessGroup: string,
    params: ModelAccessGroupUpdateParams,
    options?: RequestOptions,
  ): Promise<ModelAccessGroupMutationResponse> {
    return this.request<ModelAccessGroupMutationResponse>({
      method: 'PUT',
      path: `/access_group/${encodeURIComponent(accessGroup)}/update`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a model access group
   * (`DELETE /access_group/{access_group}/delete`).
   *
   * @param accessGroup - The group name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
   */
  delete(
    accessGroup: string,
    options?: RequestOptions,
  ): Promise<ModelAccessGroupDeleteResponse> {
    return this.request<ModelAccessGroupDeleteResponse>({
      method: 'DELETE',
      path: `/access_group/${encodeURIComponent(accessGroup)}/delete`,
      options,
    });
  }
}

/**
 * Top-level access-group CRUD under `/v1/access_group/...` plus
 * the model-scoped variant (under `client.accessGroups.models.*`).
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
 */
export class AccessGroupsResource {
  /** Model-scoped access groups under `/access_group/...`. */
  readonly models: ModelAccessGroupsResource;

  constructor(private request: RequestFn) {
    this.models = new ModelAccessGroupsResource(request);
  }

  /**
   * Create a new top-level access group (`POST /v1/access_group`).
   *
   * @param params - Group fields.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created group record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
   */
  create(
    params: AccessGroupCreateParams,
    options?: RequestOptions,
  ): Promise<AccessGroupResponse> {
    return this.request<AccessGroupResponse>({
      method: 'POST',
      path: '/v1/access_group',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List all top-level access groups (`GET /v1/access_group`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of access groups.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
   */
  list(options?: RequestOptions): Promise<AccessGroupResponse[]> {
    return this.request<AccessGroupResponse[]>({
      method: 'GET',
      path: '/v1/access_group',
      options,
    });
  }

  /**
   * Retrieve a top-level access group by id
   * (`GET /v1/access_group/{access_group_id}`).
   *
   * @param accessGroupId - The group id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The group record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
   */
  retrieve(
    accessGroupId: string,
    options?: RequestOptions,
  ): Promise<AccessGroupResponse> {
    return this.request<AccessGroupResponse>({
      method: 'GET',
      path: `/v1/access_group/${encodeURIComponent(accessGroupId)}`,
      options,
    });
  }

  /**
   * Update a top-level access group
   * (`PUT /v1/access_group/{access_group_id}`).
   *
   * @param accessGroupId - The group id.
   * @param params - Partial replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated group record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
   */
  update(
    accessGroupId: string,
    params: AccessGroupUpdateParams,
    options?: RequestOptions,
  ): Promise<AccessGroupResponse> {
    return this.request<AccessGroupResponse>({
      method: 'PUT',
      path: `/v1/access_group/${encodeURIComponent(accessGroupId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a top-level access group
   * (`DELETE /v1/access_group/{access_group_id}`).
   *
   * @param accessGroupId - The group id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns `void` — endpoint returns 204.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
   */
  delete(accessGroupId: string, options?: RequestOptions): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      path: `/v1/access_group/${encodeURIComponent(accessGroupId)}`,
      options,
    });
  }
}
