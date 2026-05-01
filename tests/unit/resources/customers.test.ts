/**
 * @group unit
 */
import { CustomersResource } from '../../../src/resources/customers';

describe('CustomersResource', () => {
  let request: jest.Mock;
  let customers: CustomersResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    customers = new CustomersResource(request as any);
  });

  it('create() / update() / delete() POST to their /customer/* paths', async () => {
    await customers.create({ user_id: 'u' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/customer/new',
    });

    await customers.update({ user_id: 'u' } as any);
    expect(request.mock.calls[1][0].path).toBe('/customer/update');

    await customers.delete({ user_ids: ['u'] } as any);
    expect(request.mock.calls[2][0].path).toBe('/customer/delete');
  });

  it('info() puts end_user_id in query', async () => {
    await customers.info('cust 1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/customer/info',
      options: { query: { end_user_id: 'cust 1' } },
    });
  });

  it('list() GETs /customer/list', async () => {
    await customers.list();
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/customer/list',
    });
  });

  it('block() / unblock()', async () => {
    await customers.block({ user_ids: ['u'] } as any);
    expect(request.mock.calls[0][0].path).toBe('/customer/block');

    await customers.unblock({ user_ids: ['u'] } as any);
    expect(request.mock.calls[1][0].path).toBe('/customer/unblock');
  });

  it('dailyActivity() forwards params via query', async () => {
    await customers.dailyActivity({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/customer/daily/activity',
    });
  });
});
