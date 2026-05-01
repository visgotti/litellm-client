import type {
  PolicyDBResponse,
  PolicyCreateParams,
  PolicyUpdateParams,
  PolicyStatusUpdateParams,
  PolicyListDBResponse,
  PolicyListParams,
  PolicyVersionListResponse,
  PolicyCompareParams,
  PolicyVersionCompareResponse,
  PolicyAttachmentDBResponse,
  PolicyAttachmentCreateParams,
  PolicyAttachmentListResponse,
  PolicyAttachmentListParams,
  PolicyResolveParams,
  PolicyResolveResponse,
  AttachmentImpactParams,
  AttachmentImpactResponse,
  PolicyListResponse,
  PolicyInfoResponse,
  PolicyValidateParams,
  PolicyValidationResponse,
  PolicyTestParams,
  PolicyTestResponse,
} from '../types/policies';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

function withQuery(
  options: RequestOptions | undefined,
  params: Record<string, unknown>,
): RequestOptions {
  return {
    ...(options ?? {}),
    query: { ...(options?.query ?? {}), ...params } as Record<
      string,
      string | number | boolean | undefined | null
    >,
  };
}

/**
 * Read-only policy templates / catalog under `/policy/...` —
 * the older "templates" router separate from the newer engine CRUD.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
 */
class PolicyTemplatesResource {
  constructor(private request: RequestFn) {}

  /**
   * List policy templates (`GET /policy/templates`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of templates (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  list(options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: '/policy/templates',
      options,
    });
  }

  /**
   * Enrich a policy template with extra metadata
   * (`POST /policy/templates/enrich`).
   *
   * @param params - Free-form template payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The enriched template (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  enrich(params: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/policy/templates/enrich',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Streaming version of `enrich` (`POST /policy/templates/enrich/stream`).
   *
   * The proxy returns a server-sent event stream; this method returns the
   * raw response body (use the SDK's `Stream` helpers to consume it).
   *
   * @param params - Free-form template payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Raw streaming response (consume manually).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  enrichStream(
    params: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/policy/templates/enrich/stream',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Suggest policy templates based on the supplied context
   * (`POST /policy/templates/suggest`).
   *
   * @param params - Free-form context payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Suggested templates (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  suggest(params: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/policy/templates/suggest',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Test a candidate policy template (`POST /policy/templates/test`).
   *
   * @param params - Free-form template + sample request.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Test result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  test(params: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/policy/templates/test',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/**
 * Policy attachment CRUD under `/policies/attachments/...`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
class PolicyAttachmentsResource {
  constructor(private request: RequestFn) {}

  /**
   * List policy attachments (`GET /policies/attachments/list`).
   *
   * @param params - Optional filters (`policy_id`, `team_id`, `key_hash`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The matching attachments.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  list(
    params: PolicyAttachmentListParams = {},
    options?: RequestOptions,
  ): Promise<PolicyAttachmentListResponse> {
    return this.request<PolicyAttachmentListResponse>({
      method: 'GET',
      path: '/policies/attachments/list',
      options: withQuery(options, params),
    });
  }

  /**
   * Create a policy attachment (`POST /policies/attachments`).
   *
   * @param params - Attachment payload (policy id + scope).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created attachment record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  create(
    params: PolicyAttachmentCreateParams,
    options?: RequestOptions,
  ): Promise<PolicyAttachmentDBResponse> {
    return this.request<PolicyAttachmentDBResponse>({
      method: 'POST',
      path: '/policies/attachments',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve an attachment by id (`GET /policies/attachments/{attachment_id}`).
   *
   * @param attachmentId - The attachment id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The attachment record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  retrieve(
    attachmentId: string,
    options?: RequestOptions,
  ): Promise<PolicyAttachmentDBResponse> {
    return this.request<PolicyAttachmentDBResponse>({
      method: 'GET',
      path: `/policies/attachments/${encodeURIComponent(attachmentId)}`,
      options,
    });
  }

  /**
   * Delete an attachment by id (`DELETE /policies/attachments/{attachment_id}`).
   *
   * @param attachmentId - The attachment id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  delete(attachmentId: string, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'DELETE',
      path: `/policies/attachments/${encodeURIComponent(attachmentId)}`,
      options,
    });
  }

  /**
   * Estimate the impact of a candidate attachment
   * (`POST /policies/attachments/estimate-impact`).
   *
   * @param params - Candidate attachment + sample requests.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Impact estimate (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_resolve_endpoints.py
   */
  estimateImpact(
    params: AttachmentImpactParams,
    options?: RequestOptions,
  ): Promise<AttachmentImpactResponse> {
    return this.request<AttachmentImpactResponse>({
      method: 'POST',
      path: '/policies/attachments/estimate-impact',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

/**
 * Policy engine — `/policies` CRUD plus older `/policy/...` template
 * helpers and the `/policies/resolve` evaluation endpoint.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export class PoliciesResource {
  /** Catalog/template helpers under `/policy/...`. */
  readonly templates: PolicyTemplatesResource;
  /** Attachment CRUD under `/policies/attachments/...`. */
  readonly attachments: PolicyAttachmentsResource;

  constructor(private request: RequestFn) {
    this.templates = new PolicyTemplatesResource(request);
    this.attachments = new PolicyAttachmentsResource(request);
  }

  // ─── /policies CRUD ──────────────────────────────────────────────────────

  /**
   * List policies (`GET /policies/list`).
   *
   * @param params - Optional pagination + status filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of policy records.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  list(
    params: PolicyListParams = {},
    options?: RequestOptions,
  ): Promise<PolicyListDBResponse> {
    return this.request<PolicyListDBResponse>({
      method: 'GET',
      path: '/policies/list',
      options: withQuery(options, params),
    });
  }

  /**
   * Create a new policy (`POST /policies`).
   *
   * @param params - The policy payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created policy record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  create(
    params: PolicyCreateParams,
    options?: RequestOptions,
  ): Promise<PolicyDBResponse> {
    return this.request<PolicyDBResponse>({
      method: 'POST',
      path: '/policies',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve a policy by id (`GET /policies/{policy_id}`).
   *
   * @param policyId - The policy id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The policy record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  retrieve(policyId: string, options?: RequestOptions): Promise<PolicyDBResponse> {
    return this.request<PolicyDBResponse>({
      method: 'GET',
      path: `/policies/${encodeURIComponent(policyId)}`,
      options,
    });
  }

  /**
   * Update a policy by id (`PUT /policies/{policy_id}`).
   *
   * @param policyId - The policy id.
   * @param params - Partial replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated policy record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  update(
    policyId: string,
    params: PolicyUpdateParams,
    options?: RequestOptions,
  ): Promise<PolicyDBResponse> {
    return this.request<PolicyDBResponse>({
      method: 'PUT',
      path: `/policies/${encodeURIComponent(policyId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update only the lifecycle status (`PUT /policies/{policy_id}/status`).
   *
   * @param policyId - The policy id.
   * @param params - The new status.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated policy record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  updateStatus(
    policyId: string,
    params: PolicyStatusUpdateParams,
    options?: RequestOptions,
  ): Promise<PolicyDBResponse> {
    return this.request<PolicyDBResponse>({
      method: 'PUT',
      path: `/policies/${encodeURIComponent(policyId)}/status`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a policy by id (`DELETE /policies/{policy_id}`).
   *
   * @param policyId - The policy id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  delete(policyId: string, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'DELETE',
      path: `/policies/${encodeURIComponent(policyId)}`,
      options,
    });
  }

  /**
   * List all versions for a policy name
   * (`GET /policies/name/{policy_name}/versions`).
   *
   * @param policyName - The shared policy name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns All versions known for the name.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  listVersions(
    policyName: string,
    options?: RequestOptions,
  ): Promise<PolicyVersionListResponse> {
    return this.request<PolicyVersionListResponse>({
      method: 'GET',
      path: `/policies/name/${encodeURIComponent(policyName)}/versions`,
      options,
    });
  }

  /**
   * Create a new version for an existing policy name
   * (`POST /policies/name/{policy_name}/versions`).
   *
   * @param policyName - The shared policy name.
   * @param params - The new-version payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created version record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  createVersion(
    policyName: string,
    params: PolicyCreateParams,
    options?: RequestOptions,
  ): Promise<PolicyDBResponse> {
    return this.request<PolicyDBResponse>({
      method: 'POST',
      path: `/policies/name/${encodeURIComponent(policyName)}/versions`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete every version for a policy name
   * (`DELETE /policies/name/{policy_name}/all-versions`).
   *
   * @param policyName - The shared policy name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  deleteAllVersions(policyName: string, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'DELETE',
      path: `/policies/name/${encodeURIComponent(policyName)}/all-versions`,
      options,
    });
  }

  /**
   * Compare two policy versions (`GET /policies/compare`).
   *
   * @param params - The two policy ids to compare.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Diff payload.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  compare(
    params: PolicyCompareParams = {},
    options?: RequestOptions,
  ): Promise<PolicyVersionCompareResponse> {
    return this.request<PolicyVersionCompareResponse>({
      method: 'GET',
      path: '/policies/compare',
      options: withQuery(options, params),
    });
  }

  /**
   * Get the resolved guardrails for a policy id
   * (`GET /policies/{policy_id}/resolved-guardrails`).
   *
   * @param policyId - The policy id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The resolved guardrail set (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  resolvedGuardrails(policyId: string, options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: `/policies/${encodeURIComponent(policyId)}/resolved-guardrails`,
      options,
    });
  }

  /**
   * Run the policy + guardrail pipeline for a sample request
   * (`POST /policies/test-pipeline`).
   *
   * @param params - The sample request payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Pipeline result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
   */
  testPipeline(
    params: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/policies/test-pipeline',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── /policies/resolve ───────────────────────────────────────────────────

  /**
   * Resolve effective policies for a given context
   * (`POST /policies/resolve`).
   *
   * @param params - Caller context (key, team, route, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Resolved policy set (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_resolve_endpoints.py
   */
  resolve(
    params: PolicyResolveParams,
    options?: RequestOptions,
  ): Promise<PolicyResolveResponse> {
    return this.request<PolicyResolveResponse>({
      method: 'POST',
      path: '/policies/resolve',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── /policy/* templates / catalog ───────────────────────────────────────

  /**
   * List the older policy catalog (`GET /policy/list`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The policy catalog (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  listCatalog(options?: RequestOptions): Promise<PolicyListResponse> {
    return this.request<PolicyListResponse>({
      method: 'GET',
      path: '/policy/list',
      options,
    });
  }

  /**
   * Get info for a catalog policy by name
   * (`GET /policy/info/{policy_name}`).
   *
   * @param policyName - The catalog policy name.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The policy info record.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  catalogInfo(
    policyName: string,
    options?: RequestOptions,
  ): Promise<PolicyInfoResponse> {
    return this.request<PolicyInfoResponse>({
      method: 'GET',
      path: `/policy/info/${encodeURIComponent(policyName)}`,
      options,
    });
  }

  /**
   * Validate a policy against the catalog rules (`POST /policy/validate`).
   *
   * @param params - The policy to validate.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Validation result.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  validate(
    params: PolicyValidateParams,
    options?: RequestOptions,
  ): Promise<PolicyValidationResponse> {
    return this.request<PolicyValidationResponse>({
      method: 'POST',
      path: '/policy/validate',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Run the catalog "try it" tester (`POST /policy/test`).
   *
   * @param params - The sample request payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Test result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  testCatalog(
    params: PolicyTestParams,
    options?: RequestOptions,
  ): Promise<PolicyTestResponse> {
    return this.request<PolicyTestResponse>({
      method: 'POST',
      path: '/policy/test',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Joint policy + guardrail tester
   * (`POST /utils/test_policies_and_guardrails`).
   *
   * @param params - The sample request payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Joint test result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
   */
  testPoliciesAndGuardrails(
    params: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/utils/test_policies_and_guardrails',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
