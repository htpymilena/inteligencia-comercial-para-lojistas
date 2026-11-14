export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
  request_id?: string;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown> | null;
  requestId?: string;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.error.message || `Erro de API (${status})`);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = payload.error.code || 'UNKNOWN_ERROR';
    this.details = payload.error.details;
    this.requestId = payload.request_id;
  }
}

export interface HealthResponse {
  status: string;
  service?: string;
  timestamp?: string;
  version?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'LOJISTA';
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface StoreItem {
  id: string;
  name: string;
  segment: string;
  floor?: string;
  is_demo: boolean;
}

export interface DailyMetric {
  date: string;
  visitors: number;
  interactions: number;
  sales: number;
  conversion_rate: number | null;
  revenue: string;
}

export interface DashboardResponse {
  store_id: string;
  period_start: string;
  period_end: string;
  total_visitors: number;
  total_interactions: number;
  total_sales: number;
  conversion_rate: number | null;
  total_revenue: string;
  is_simulated: boolean;
  daily_metrics: DailyMetric[];
}

export interface CameraSnapshot {
  camera_id: string;
  name: string;
  zone: string;
  current_count: number;
  entries_count: number;
  exits_count: number;
  is_simulated: boolean;
  timestamp: string;
}

export interface HeatmapCell {
  x: number;
  y: number;
  intensity: number;
  zone_name: string;
}

export interface HeatmapResponse {
  store_id: string;
  date: string;
  grid_width: number;
  grid_height: number;
  cells: HeatmapCell[];
  is_simulated: boolean;
}

export interface Recommendation {
  id: string;
  store_id: string;
  title: string;
  hypothesis: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence_summary: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'DISMISSED';
  generation_method: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  store_id: string;
  recommendation_id?: string;
  title: string;
  target_metric: 'VISITORS' | 'SALES' | 'REVENUE' | 'CONVERSION';
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  notes?: string;
}

export interface ExperimentResult {
  experiment_id: string;
  target_metric: string;
  before_value: string;
  after_value: string;
  relative_change_percent: number | null;
  is_observational: boolean;
  data_available: boolean;
}

export interface ComparativeReportItem {
  metric_name: string;
  current_value: string;
  previous_value: string;
  absolute_change: string;
  percentage_change: number | null;
  percentage_points_change?: number | null;
}

export interface ComparativeReportResponse {
  store_id: string;
  period_start: string;
  period_end: string;
  comparison_start: string;
  comparison_end: string;
  metrics: ComparativeReportItem[];
  is_simulated: boolean;
}

export interface CircuitStoreSummary {
  store_id: string;
  store_name: string;
  segment?: string;
  order?: number;
}

export interface CircuitItem {
  id: string;
  name: string;
  reward_description: string;
  status: 'DRAFT' | 'ACTIVE' | 'FINISHED' | 'CANCELLED' | 'COMPLETED';
  store_ids?: string[];
  stores?: CircuitStoreSummary[];
  start_date?: string;
  end_date?: string;
  created_at?: string;
  completed_count?: number;
  is_simulated?: boolean;
}

export interface CircuitStats {
  circuit_id: string;
  data_origin?: string;
  period_start?: string;
  period_end?: string;
  completed_count: number;
}

