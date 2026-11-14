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
    return this.request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async obterPerfil(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v1/auth/me');
  }

  async listarLojas(): Promise<StoreItem[]> {
    return this.request<StoreItem[]>('/api/v1/stores');
  }

  async obterLoja(storeId: string): Promise<StoreItem> {
    return this.request<StoreItem>(`/api/v1/stores/${storeId}`);
  }

  // --- M02: Painel e Métricas ---
  async obterDashboard(storeId: string, periodStart: string, periodEnd: string): Promise<DashboardResponse> {
    const params = new URLSearchParams({ period_start: periodStart, period_end: periodEnd });
    return this.request<DashboardResponse>(`/api/v1/stores/${storeId}/dashboard?${params}`);
  }

  // --- M03: Monitoramento e Mapa de Calor ---
  async listarCamerasDemo(storeId: string): Promise<CameraSnapshot[]> {
    return this.request<CameraSnapshot[]>(`/api/v1/stores/${storeId}/demo-cameras`);
  }

  async obterMapaCalorDemo(storeId: string, date: string): Promise<HeatmapResponse> {
    const params = new URLSearchParams({ date });
    return this.request<HeatmapResponse>(`/api/v1/stores/${storeId}/heatmap?${params}`);
  }

  // --- M04: Recomendações ---
  async listarRecomendacoes(storeId: string, status?: string): Promise<Recommendation[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return this.request<Recommendation[]>(`/api/v1/stores/${storeId}/recommendations${query}`);
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
    return this.request<Experiment[]>(`/api/v1/stores/${storeId}/experiments`);
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
    return this.request<Experiment>(`/api/v1/stores/${storeId}/experiments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async obterExperimento(storeId: string, experimentId: string): Promise<Experiment> {
    return this.request<Experiment>(`/api/v1/stores/${storeId}/experiments/${experimentId}`);
  }

  async alterarStatusExperimento(
    storeId: string,
    experimentId: string,
    status: 'RUNNING' | 'COMPLETED' | 'CANCELLED'
  ): Promise<Experiment> {
    return this.request<Experiment>(`/api/v1/stores/${storeId}/experiments/${experimentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async obterResultadoExperimento(storeId: string, experimentId: string): Promise<ExperimentResult> {
    return this.request<ExperimentResult>(`/api/v1/stores/${storeId}/experiments/${experimentId}/result`);
  }

  // --- M06: Relatórios Comparativos ---
  async obterRelatorioComparativo(
    storeId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<ComparativeReportResponse> {
    const params = new URLSearchParams({ period_start: periodStart, period_end: periodEnd });
    return this.request<ComparativeReportResponse>(`/api/v1/stores/${storeId}/reports/comparative?${params}`);
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
