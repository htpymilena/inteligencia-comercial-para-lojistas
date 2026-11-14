import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '@/lib/api/client';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function reply(value: unknown) {
  return new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('contrato do frontend com a API do backend', () => {
  it('combina resumo e métricas diárias do painel sem perder valores', async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => reply(url.toString().includes('/metrics/daily')
      ? { items: [{ date: '2026-11-14', visitor_count: 10, interaction_count: 12,
        sales_count: 2, revenue_brl: '39.80', conversion_rate: 20 }] }
      : { store_id: 'store-1', period_start: '2026-11-14', period_end: '2026-11-14',
        data_origin: 'DEMO', visitors: 10, interactions: 12, sales_count: 2,
        revenue_brl: '39.80', conversion_rate: 20 }));
    globalThis.fetch = fetchMock;

    const dashboard = await new ApiClient().obterDashboard('store-1', '2026-11-14', '2026-11-14');

    expect(dashboard.total_visitors).toBe(10);
    expect(dashboard.daily_metrics[0].revenue).toBe('39.80');
    expect(dashboard.is_simulated).toBe(true);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(expect.arrayContaining([
      '/api/v1/stores/store-1/dashboard?period_start=2026-11-14&period_end=2026-11-14',
      '/api/v1/stores/store-1/metrics/daily?period_start=2026-11-14&period_end=2026-11-14',
    ]));
  });

  it('usa as rotas reais de monitoramento e preserva os dados DEMO', async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => reply(
      url.toString().endsWith('/cameras')
        ? { items: [{ id: 'camera-1', name: 'Câmera DEMO', placement: 'Entrada', is_simulated: true }] }
        : { snapshot_at: '2026-11-14T12:00:00Z', people_now: 9, entries_today: 25, exits_today: 16 }
    ));
    globalThis.fetch = fetchMock;

    const cameras = await new ApiClient().listarCamerasDemo('store-1');

    expect(cameras).toEqual([expect.objectContaining({
      camera_id: 'camera-1', zone: 'Entrada', current_count: 9, is_simulated: true,
    })]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toContain('/api/v1/stores/store-1/monitoring/demo');
  });

  it('envia o payload aceito ao criar um experimento', async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => reply({ id: 'experiment-1', store_id: 'store-1',
      recommendation_id: 'recommendation-1', title: 'Teste', metric: 'SALES',
      start_date: '2026-11-14', end_date: '2026-11-20', status: 'DRAFT',
      created_at: '2026-11-14T12:00:00Z' }));
    globalThis.fetch = fetchMock;

    const experiment = await new ApiClient().criarExperimento('store-1', {
      title: 'Teste', recommendation_id: 'recommendation-1', target_metric: 'SALES',
      planned_start_date: '2026-11-14', planned_end_date: '2026-11-20',
    });

    expect(experiment.target_metric).toBe('SALES');
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
      title: 'Teste', recommendation_id: 'recommendation-1', metric: 'SALES',
      start_date: '2026-11-14', end_date: '2026-11-20',
    });
  });
});
