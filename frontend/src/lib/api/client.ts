import {
  ApiClientError,
  ApiErrorPayload,
  HealthResponse,
  LoginResponse,
  UserProfile,
  StoreItem,
  DashboardResponse,
  CameraSnapshot,
  HeatmapResponse,
  Recommendation,
  Experiment,
  ExperimentResult,
  ComparativeReportResponse,
  CircuitItem,
  CircuitStats,
} from './types';

type BackendExperiment = {
  id: string; store_id: string; recommendation_id: string; title: string;
  metric: Experiment['target_metric']; start_date: string; end_date: string;
  status: Experiment['status']; created_at: string;
};

type MetricTotals = {
  visitors: number; interactions: number; sales_count: number;
  revenue_brl: string; conversion_rate: number | null;
};

type MetricChanges = {
  visitor_change_percent: number | null;
  interaction_change_percent: number | null;
  sales_change_percent: number | null;
  revenue_change_percent: number | null;
  conversion_change_pp: number | null;
};

function mapExperiment(value: BackendExperiment): Experiment {
  return {
    ...value,
    target_metric: value.metric,
    planned_start_date: value.start_date,
    planned_end_date: value.end_date,
  };
}

function metricValue(totals: MetricTotals | null, metric: Experiment['target_metric']): string {
  if (!totals) return '—';
  const key = { VISITORS: 'visitors', SALES: 'sales_count', REVENUE: 'revenue_brl',
    CONVERSION: 'conversion_rate' } as const;
  return String(totals[key[metric]] ?? '—');
}

function metricChange(changes: MetricChanges | null, metric: Experiment['target_metric']): number | null {
  if (!changes) return null;
  const key = { VISITORS: 'visitor_change_percent', SALES: 'sales_change_percent',
    REVENUE: 'revenue_change_percent', CONVERSION: 'conversion_change_pp' } as const;
  return changes[key[metric]];
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onUnauthorized?: () => void;

  constructor(options?: {
    baseUrl?: string;
    getToken?: () => string | null;
    onUnauthorized?: () => void;
  }) {
    this.baseUrl = options?.baseUrl || '';
    this.getToken = options?.getToken || (() => null);
    this.onUnauthorized = options?.onUnauthorized;
  }

  setTokenGetter(getter: () => string | null) {
    this.getToken = getter;
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(init?.headers || {});

    if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...init,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && this.onUnauthorized) {
          this.onUnauthorized();
        }

        let errorPayload: ApiErrorPayload;
        try {
          errorPayload = await response.json();
        } catch {
          errorPayload = {
            error: {
              code: 'HTTP_ERROR',
              message: `Servidor retornou status ${response.status}`,
            },
          };
        }

        throw new ApiClientError(response.status, errorPayload);
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, {
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Falha na comunicação de rede com o servidor.',
        },
      });
    }
  }

  // --- M00: Health Check ---
  async verificarSaude(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // --- M01: Autenticação e Lojas ---
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse & { user: UserProfile & { display_name: string } }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return { ...response, user: { ...response.user, full_name: response.user.display_name } };
  }

  async obterPerfil(): Promise<UserProfile> {
    const user = await this.request<UserProfile & { display_name: string }>('/api/v1/auth/me');
    return { ...user, full_name: user.display_name };
  }

  async listarLojas(): Promise<StoreItem[]> {
    const response = await this.request<{ items: Array<StoreItem & { description?: string }> }>('/api/v1/stores');
    return response.items;
  }

  async obterLoja(storeId: string): Promise<StoreItem> {
    return this.request<StoreItem>(`/api/v1/stores/${storeId}`);
  }

  // --- M02: Painel e Métricas ---
  async obterDashboard(storeId: string, periodStart: string, periodEnd: string): Promise<DashboardResponse> {
    const params = new URLSearchParams({ period_start: periodStart, period_end: periodEnd });
    const [summary, daily] = await Promise.all([
      this.request<{
        store_id: string; period_start: string; period_end: string; visitors: number;
        interactions: number; sales_count: number; conversion_rate: number | null;
        revenue_brl: string; data_origin: string;
      }>(`/api/v1/stores/${storeId}/dashboard?${params}`),
      this.request<{ items: Array<{
        date: string; visitor_count: number; interaction_count: number;
        sales_count: number; conversion_rate: number | null; revenue_brl: string;
      }> }>(`/api/v1/stores/${storeId}/metrics/daily?${params}`),
    ]);
    return {
      store_id: summary.store_id,
      period_start: summary.period_start,
      period_end: summary.period_end,
      total_visitors: summary.visitors,
      total_interactions: summary.interactions,
      total_sales: summary.sales_count,
      conversion_rate: summary.conversion_rate,
      total_revenue: summary.revenue_brl,
      is_simulated: summary.data_origin === 'DEMO',
      daily_metrics: daily.items.map((item) => ({
        date: item.date, visitors: item.visitor_count, interactions: item.interaction_count,
        sales: item.sales_count, conversion_rate: item.conversion_rate, revenue: item.revenue_brl,
      })),
    };
  }

  // --- M03: Monitoramento e Mapa de Calor ---
  async listarCamerasDemo(storeId: string): Promise<CameraSnapshot[]> {
    const [cameras, snapshot] = await Promise.all([
      this.request<{ items: Array<{ id: string; name: string; placement: string; is_simulated: boolean }> }>(
        `/api/v1/stores/${storeId}/cameras`
      ),
      this.request<{ snapshot_at: string; people_now: number; entries_today: number; exits_today: number }>(
        `/api/v1/stores/${storeId}/monitoring/demo`
      ),
    ]);
    return cameras.items.map((camera) => ({
      camera_id: camera.id,
      name: camera.name,
      zone: camera.placement,
      current_count: snapshot.people_now,
      entries_count: snapshot.entries_today,
      exits_count: snapshot.exits_today,
      is_simulated: camera.is_simulated,
      timestamp: snapshot.snapshot_at,
    }));
  }

  async obterMapaCalorDemo(storeId: string, date: string): Promise<HeatmapResponse> {
    const params = new URLSearchParams({ date });
    const [heatmap, zones] = await Promise.all([
      this.request<{ store_id: string; date: string; grid_width: number; grid_height: number;
        data_origin: string; cells: Array<{ grid_x: number; grid_y: number; intensity: number }> }>(
        `/api/v1/stores/${storeId}/heatmap/demo?${params}`
      ),
      this.request<{ items: Array<{ name: string; grid_x: number; grid_y: number;
        grid_width: number; grid_height: number }> }>(`/api/v1/stores/${storeId}/zones`),
    ]);
    return {
      store_id: heatmap.store_id, date: heatmap.date,
      grid_width: heatmap.grid_width, grid_height: heatmap.grid_height,
      is_simulated: heatmap.data_origin === 'DEMO',
      cells: heatmap.cells.map((cell) => ({
        x: cell.grid_x, y: cell.grid_y, intensity: cell.intensity,
        zone_name: zones.items.find((zone) =>
          cell.grid_x >= zone.grid_x && cell.grid_x < zone.grid_x + zone.grid_width &&
          cell.grid_y >= zone.grid_y && cell.grid_y < zone.grid_y + zone.grid_height
        )?.name || 'Área comum',
      })),
    };
  }

  // --- M04: Recomendações ---
  async listarRecomendacoes(storeId: string, status?: string): Promise<Recommendation[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const response = await this.request<{ items: Array<Recommendation & { evidence: string }> }>(
      `/api/v1/stores/${storeId}/recommendations${query}`
    );
    return response.items.map((item) => ({ ...item, evidence_summary: item.evidence }));
  }

  async atualizarRecomendacao(
    storeId: string,
    recommendationId: string,
    status: 'ACCEPTED' | 'DISMISSED'
  ): Promise<Recommendation> {
    return this.request<Recommendation>(`/api/v1/stores/${storeId}/recommendations/${recommendationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- M05: Experimentos ---
  async listarExperimentos(storeId: string): Promise<Experiment[]> {
    const response = await this.request<{ items: BackendExperiment[] }>(`/api/v1/stores/${storeId}/experiments`);
    return response.items.map(mapExperiment);
  }

  async criarExperimento(
    storeId: string,
    payload: {
      title: string;
      recommendation_id?: string;
      target_metric: string;
      planned_start_date: string;
      planned_end_date: string;
      notes?: string;
    }
  ): Promise<Experiment> {
    if (!payload.recommendation_id) {
      throw new ApiClientError(422, { error: {
        code: 'VALIDATION_ERROR', message: 'Selecione uma recomendação aceita para criar o experimento.'
      } });
    }
    const response = await this.request<BackendExperiment>(`/api/v1/stores/${storeId}/experiments`, {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        recommendation_id: payload.recommendation_id,
        metric: payload.target_metric,
        start_date: payload.planned_start_date,
        end_date: payload.planned_end_date,
      }),
    });
    return mapExperiment(response);
  }

  async obterExperimento(storeId: string, experimentId: string): Promise<Experiment> {
    const response = await this.request<BackendExperiment>(`/api/v1/stores/${storeId}/experiments/${experimentId}`);
    return mapExperiment(response);
  }

  async alterarStatusExperimento(
    storeId: string,
    experimentId: string,
    status: 'RUNNING' | 'COMPLETED' | 'CANCELLED'
  ): Promise<Experiment> {
    const response = await this.request<BackendExperiment>(`/api/v1/stores/${storeId}/experiments/${experimentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return mapExperiment(response);
  }

  async obterResultadoExperimento(storeId: string, experimentId: string): Promise<ExperimentResult> {
    const response = await this.request<{
      experiment_id: string; available: boolean; baseline: MetricTotals | null;
      during: MetricTotals | null; changes: MetricChanges | null;
    }>(`/api/v1/stores/${storeId}/experiments/${experimentId}/result`);
    const experiment = await this.obterExperimento(storeId, experimentId);
    const metric = experiment.target_metric;
    return {
      experiment_id: response.experiment_id,
      target_metric: metric,
      before_value: metricValue(response.baseline, metric),
      after_value: metricValue(response.during, metric),
      relative_change_percent: metricChange(response.changes, metric),
      is_observational: true,
      data_available: response.available,
    };
  }

  // --- M06: Relatórios Comparativos ---
  async obterRelatorioComparativo(
    storeId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<ComparativeReportResponse> {
    const params = new URLSearchParams({ period_start: periodStart, period_end: periodEnd });
    const response = await this.request<{
      store_id: string; period_start: string; period_end: string;
      baseline_start: string; baseline_end: string; data_origin: string;
      baseline: MetricTotals | null; current: MetricTotals | null; changes: MetricChanges | null;
    }>(`/api/v1/stores/${storeId}/reports/summary?${params}`);
    const rows: Array<[string, keyof MetricTotals, keyof MetricChanges, boolean]> = [
      ['Visitantes', 'visitors', 'visitor_change_percent', false],
      ['Interações', 'interactions', 'interaction_change_percent', false],
      ['Vendas', 'sales_count', 'sales_change_percent', false],
      ['Faturamento', 'revenue_brl', 'revenue_change_percent', false],
      ['Conversão', 'conversion_rate', 'conversion_change_pp', true],
    ];
    return {
      store_id: response.store_id,
      period_start: response.period_start,
      period_end: response.period_end,
      comparison_start: response.baseline_start,
      comparison_end: response.baseline_end,
      is_simulated: response.data_origin === 'DEMO',
      metrics: rows.map(([name, key, changeKey, points]) => {
        const current = response.current?.[key];
        const previous = response.baseline?.[key];
        const difference = current == null || previous == null ? null : Number(current) - Number(previous);
        return {
          metric_name: name,
          current_value: current == null ? '—' : String(current),
          previous_value: previous == null ? '—' : String(previous),
          absolute_change: difference == null ? '—' : difference.toFixed(2),
          percentage_change: points ? null : response.changes?.[changeKey] ?? null,
          percentage_points_change: points ? response.changes?.[changeKey] ?? null : null,
        };
      }),
    };
  }

  // --- M07: Circuitos ---
  async listarCircuitos(storeId?: string): Promise<CircuitItem[]> {
    const query = storeId ? `?store_id=${encodeURIComponent(storeId)}` : '';
    const response = await this.request<{ items: CircuitItem[] } | CircuitItem[]>(`/api/v1/circuits${query}`);
    return Array.isArray(response) ? response : response.items;
  }

  async criarCircuito(payload: {
    name: string;
    reward_description: string;
    store_ids: string[];
    start_date?: string;
    end_date?: string;
  }): Promise<CircuitItem> {
    return this.request<CircuitItem>('/api/v1/circuits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async obterCircuito(circuitId: string): Promise<CircuitItem> {
    return this.request<CircuitItem>(`/api/v1/circuits/${circuitId}`);
  }

  async alterarStatusCircuito(circuitId: string, status: string): Promise<CircuitItem> {
    return this.request<CircuitItem>(`/api/v1/circuits/${circuitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async obterCircuitoStats(circuitId: string): Promise<CircuitStats> {
    return this.request<CircuitStats>(`/api/v1/circuits/${circuitId}/stats`);
  }
}

export const api = new ApiClient();
