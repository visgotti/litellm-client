/**
 * @group unit
 */
import { BudgetsResource } from '../../../src/resources/budgets';

describe('BudgetsResource', () => {
  let request: jest.Mock;
  let budgets: BudgetsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    budgets = new BudgetsResource(request as any);
  });

  it('create() / update() / delete() / info()', async () => {
    await budgets.create({ budget_id: 'b', max_budget: 100 } as any);
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'POST', path: '/budget/new' });

    await budgets.update({ budget_id: 'b', max_budget: 200 } as any);
    expect(request.mock.calls[1][0].path).toBe('/budget/update');

    await budgets.delete({ id: 'b' } as any);
    expect(request.mock.calls[2][0].path).toBe('/budget/delete');

    await budgets.info({ budgets: ['b'] } as any);
    expect(request.mock.calls[3][0]).toMatchObject({
      method: 'POST',
      path: '/budget/info',
      body: { kind: 'json', value: { budgets: ['b'] } },
    });
  });

  it('list() / settings() / providerBudgets()', async () => {
    await budgets.list();
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'GET', path: '/budget/list' });

    await budgets.settings();
    expect(request.mock.calls[1][0].path).toBe('/budget/settings');

    await budgets.providerBudgets();
    expect(request.mock.calls[2][0].path).toBe('/provider/budgets');
  });
});
