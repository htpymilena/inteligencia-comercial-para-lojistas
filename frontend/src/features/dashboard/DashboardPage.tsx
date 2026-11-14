import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, DashboardResponse, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Skeleton } from '@/components/ui';
import { DateRangePicker } from './DateRangePicker';
import { KpiCards } from './KpiCards';
import { MetricsTrendChart } from './MetricsTrendChart';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';

export function DashboardPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  // Default to last 30 days
  const today = new Date();
  const past30 = new Date();
  past30.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(past30.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<DashboardResponse, ApiClientError>({
    queryKey: ['dashboard', storeId, startDate, endDate],
    queryFn: () => api.obterDashboard(storeId!, startDate, endDate),
    enabled: Boolean(storeId),
  });

  function handleApplyPeriod(newStart: string, newEnd: string) {
    setStartDate(newStart);
    setEndDate(newEnd);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel Principal</h1>
          <p className="text-sm text-slate-500">
            Acompanhamento de fluxo de clientes, taxas de conversão e faturamento da loja.
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangePicker
        initialStartDate={startDate}
        initialEndDate={endDate}
        onApply={handleApplyPeriod}
        isLoading={isFetching}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-6" data-testid="dashboard-loading">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-32" />
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <Skeleton className="h-72 w-full" />
          </Card>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="dashboard-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro ao consultar indicadores do painel</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {error?.message || 'Falha ao buscar dados do servidor.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Recarregar
          </Button>
        </div>
      )}

      {/* Content when loaded successfully */}
      {!isLoading && !isError && dashboard && (
        <>
          {/* KPI Indicators */}
          <KpiCards
            totalVisitors={dashboard.total_visitors}
            totalInteractions={dashboard.total_interactions}
            totalSales={dashboard.total_sales}
            conversionRate={dashboard.conversion_rate}
            totalRevenue={dashboard.total_revenue}
            isSimulated={dashboard.is_simulated}
          />

          {/* Empty State when no metrics in range */}
          {dashboard.daily_metrics.length === 0 ? (
            <Card className="p-8 text-center" data-testid="dashboard-empty">
              <BarChart2 className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">Nenhum dado registrado neste período</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Não foram identificadas métricas para o intervalo selecionado ({startDate} até {endDate}).
                Experimente ampliar o período utilizando os atalhos acima.
              </p>
            </Card>
          ) : (
            /* Trends Chart */
            <MetricsTrendChart data={dashboard.daily_metrics} isSimulated={dashboard.is_simulated} />
          )}

          {/* Commercial Opportunities Banner */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50/60 to-orange-50/40">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-amber-950">Oportunidades Comerciais Identificadas</CardTitle>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5">
                      REGRAS DEMO
                    </span>
                  </div>
                  <CardDescription className="text-xs text-amber-800 mt-1">
                    O motor analítico gerou sugestões acionáveis para otimizar a conversão da vitrine e zonas de calor.
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shrink-0 self-start sm:self-auto"
                onClick={() => navigate(`/app/lojas/${storeId}/recomendacoes`)}
              >
                <span>Ver Recomendações</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardHeader>
          </Card>
        </>
      )}
    </div>
  );
}
