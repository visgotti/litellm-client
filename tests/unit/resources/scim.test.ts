/**
 * @group unit
 */
import { ScimResource } from '../../../src/resources/scim';

describe('ScimResource', () => {
  let request: jest.Mock;
  let scim: ScimResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    scim = new ScimResource(request as any);
  });

  // ── root ──────────────────────────────────────────────────────────────────

  describe('root', () => {
    it('discover() GETs /scim/v2', async () => {
      await scim.discover();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/scim/v2' }),
      );
    });

    it('serviceProviderConfig() GETs /scim/v2/ServiceProviderConfig', async () => {
      await scim.serviceProviderConfig();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/scim/v2/ServiceProviderConfig',
        }),
      );
    });
  });

  // ── users ─────────────────────────────────────────────────────────────────

  describe('users', () => {
    it('list() GETs /scim/v2/Users with no params', async () => {
      await scim.users.list();
      const arg = request.mock.calls[0][0];
      expect(arg.method).toBe('GET');
      expect(arg.path).toBe('/scim/v2/Users');
      expect(arg.options.query).toEqual({});
    });

    it('list() forwards startIndex / count / filter as query params', async () => {
      await scim.users.list({ startIndex: 5, count: 25, filter: 'userName eq "a@b.c"' });
      const arg = request.mock.calls[0][0];
      expect(arg.method).toBe('GET');
      expect(arg.path).toBe('/scim/v2/Users');
      expect(arg.options.query).toEqual({
        startIndex: 5,
        count: 25,
        filter: 'userName eq "a@b.c"',
      });
    });

    it('create() POSTs /scim/v2/Users with the SCIMUser body', async () => {
      const body = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'alice@example.com',
        emails: [{ value: 'alice@example.com', primary: true }],
      };
      await scim.users.create(body as any);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/scim/v2/Users',
          body: { kind: 'json', value: body },
        }),
      );
    });

    it('retrieve() GETs /scim/v2/Users/{id} (encoded)', async () => {
      await scim.users.retrieve('user/with slash');
      expect(request.mock.calls[0][0]).toMatchObject({
        method: 'GET',
        path: '/scim/v2/Users/user%2Fwith%20slash',
      });
    });

    it('replace() PUTs /scim/v2/Users/{id}', async () => {
      const body = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'alice',
      };
      await scim.users.replace('u-1', body as any);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: '/scim/v2/Users/u-1',
          body: { kind: 'json', value: body },
        }),
      );
    });

    it('update() PATCHes /scim/v2/Users/{id} with PatchOp', async () => {
      const body = {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: [{ op: 'replace', path: 'active', value: false }],
      };
      await scim.users.update('u-1', body as any);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          path: '/scim/v2/Users/u-1',
          body: { kind: 'json', value: body },
        }),
      );
    });

    it('delete() DELETEs /scim/v2/Users/{id}', async () => {
      await scim.users.delete('u-1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/scim/v2/Users/u-1',
        }),
      );
    });
  });

  // ── groups ────────────────────────────────────────────────────────────────

  describe('groups', () => {
    it('list() GETs /scim/v2/Groups with no params', async () => {
      await scim.groups.list();
      const arg = request.mock.calls[0][0];
      expect(arg.method).toBe('GET');
      expect(arg.path).toBe('/scim/v2/Groups');
      expect(arg.options.query).toEqual({});
    });

    it('list() forwards pagination params', async () => {
      await scim.groups.list({ startIndex: 1, count: 50, filter: 'displayName sw "eng"' });
      const arg = request.mock.calls[0][0];
      expect(arg.options.query).toEqual({
        startIndex: 1,
        count: 50,
        filter: 'displayName sw "eng"',
      });
    });

    it('create() POSTs /scim/v2/Groups with the SCIMGroup body', async () => {
      const body = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        displayName: 'Engineering',
        members: [{ value: 'u-1' }],
      };
      await scim.groups.create(body as any);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/scim/v2/Groups',
          body: { kind: 'json', value: body },
        }),
      );
    });

    it('retrieve() GETs /scim/v2/Groups/{id} (encoded)', async () => {
      await scim.groups.retrieve('grp:1/2');
      expect(request.mock.calls[0][0]).toMatchObject({
        method: 'GET',
        path: '/scim/v2/Groups/grp%3A1%2F2',
      });
    });

    it('replace() PUTs /scim/v2/Groups/{id}', async () => {
      const body = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        displayName: 'Engineering',
      };
      await scim.groups.replace('g-1', body as any);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: '/scim/v2/Groups/g-1',
          body: { kind: 'json', value: body },
        }),
      );
    });

    it('update() PATCHes /scim/v2/Groups/{id} with PatchOp', async () => {
      const body = {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: [{ op: 'add', path: 'members', value: [{ value: 'u-2' }] }],
      };
      await scim.groups.update('g-1', body as any);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          path: '/scim/v2/Groups/g-1',
          body: { kind: 'json', value: body },
        }),
      );
    });

    it('delete() DELETEs /scim/v2/Groups/{id}', async () => {
      await scim.groups.delete('g-1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/scim/v2/Groups/g-1',
        }),
      );
    });
  });

  // ── resourceTypes ─────────────────────────────────────────────────────────

  describe('resourceTypes', () => {
    it('list() GETs /scim/v2/ResourceTypes', async () => {
      await scim.resourceTypes.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/scim/v2/ResourceTypes' }),
      );
    });

    it('retrieve() GETs /scim/v2/ResourceTypes/{id} (encoded)', async () => {
      await scim.resourceTypes.retrieve('User');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/scim/v2/ResourceTypes/User',
        }),
      );
    });
  });

  // ── schemas ───────────────────────────────────────────────────────────────

  describe('schemas', () => {
    it('list() GETs /scim/v2/Schemas', async () => {
      await scim.schemas.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/scim/v2/Schemas' }),
      );
    });

    it('retrieve() encodes the schema URI', async () => {
      await scim.schemas.retrieve('urn:ietf:params:scim:schemas:core:2.0:User');
      expect(request.mock.calls[0][0].path).toBe(
        '/scim/v2/Schemas/urn%3Aietf%3Aparams%3Ascim%3Aschemas%3Acore%3A2.0%3AUser',
      );
    });
  });
});
