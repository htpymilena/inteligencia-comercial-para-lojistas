import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, ComparativeReportResponse, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Skeleton } from '@/components/ui';
import { DateRangePicker } from '@/features/dashboard/DateRangePicker';
import { BarChart3, Download, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RefreshCw, FileText } from 'lucide-react';

export function calculateEqualBaseline(startDate: string, endDate: string): { start: string; end: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const baselineEnd = new Date(start);
  baselineEnd.setDate(baselineEnd.getDate() - 1);

  const baselineStart = new Date(baselineEnd);
  baselineStart.setDate(baselineStart.getDate() - (diffDays - 1));

  return {
    start: baselineStart.toISOString().split('T')[0],
    end: baselineEnd.toISOString().split('T')[0],
  };
}

export function generateReportCsv(report: ComparativeReportResponse): string {
  const headers = ['Métrica', 'Período Atual', 'Período Anterior', 'Variação Absoluta', 'Variação (%)', 'Variação (p.p.)'];
  const rows = report.metrics.map((m) => [
    `"${m.metric_name}"`,
    `"${m.current_value}"`,
    `"${m.previous_value}"`,
    `"${m.absolute_change}"`,
    m.percentage_change !== null ? `"${m.percentage_change > 0 ? '+' : ''}${m.percentage_change.toFixed(2)}%"` : '"—"',
    m.percentage_points_change !== null && m.percentage_points_change !== undefined
      ? `"${m.percentage_points_change > 0 ? '+' : ''}${m.percentage_points_change.toFixed(2)} p.p."`
      : '""',
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
}

export function ReportsPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const today = new Date();
  const past30 = new Date();
  past30.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(past30.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const baseline = calculateEqualBaseline(startDate, endDate);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<ComparativeReportResponse, ApiClientError>({
    queryKey: ['comparative-report', storeId, startDate, endDate],
    queryFn: () => api.obterRelatorioComparativo(storeId!, startDate, endDate),
    enabled: Boolean(storeId),
  });

  function handleExportCsv() {
    if (!report) return;

    const csvContent = generateReportCsv(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-comparativo-${storeId}-${startDate}-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleApplyPeriod(newStart: string, newEnd: string) {
    setStartDate(newStart);
    setEndDate(newEnd);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Relatório Comparativo</h1>
            <Badge variant="demo">DEMO</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Comparação de desempenho comercial entre períodos contíguos de igual duração.
          </p>
        </div>

        {report && (
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            aria-label="Exportar CSV do relatório comparativo"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Date Filter Bar */}
      <DateRangePicker
        initialStartDate={startDate}
        initialEndDate={endDate}
        onApply={handleApplyPeriod}
        isLoading={isFetching}
      />

      {/* Comparison Windows Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-600" />
          <span>
            Período Avaliado:{' '}
            <strong className="text-slate-900">
              {startDate} até {endDate}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Período Anterior Equivalente:{' '}
            <strong className="text-slate-900">
              {baseline.start} até {baseline.end}
            </strong>
          </span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="reports-loading">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-48" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="reports-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro ao gerar relatório comparativo</p>
              <p className="text-xs text-rose-700 mt-0.5">{error?.message || 'Falha ao consultar API.'}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Content when loaded */}
      {!isLoading && !isError && report && (
        <>
          {/* Comparison KPI Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {report.metrics.map((metric) => {
              const isPositive =
                (metric.percentage_change !== null && metric.percentage_change > 0) ||
                (metric.percentage_points_change !== null &&
                  metric.percentage_points_change !== undefined &&
                  metric.percentage_points_change > 0);

              const isZero =
                (metric.percentage_change === 0 || metric.percentage_points_change === 0) &&
                metric.percentage_change !== null;

              return (
                <Card key={metric.metric_name} className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {metric.metric_name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-slate-900">{metric.current_value}</div>
                      {/* Variation Badge */}
                      {metric.percentage_points_change !== null &&
                      metric.percentage_points_change !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                            metric.percentage_points_change > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : metric.percentage_points_change < 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {metric.percentage_points_change > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : metric.percentage_points_change < 0 ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {metric.percentage_points_change > 0 ? '+' : ''}
                          {metric.percentage_points_change.toFixed(2)} p.p.
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                            metric.percentage_change === null
                              ? 'bg-slate-100 text-slate-600'
                              : isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {metric.percentage_change !== null ? (
                            <>
                              {isPositive ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {metric.percentage_change > 0 ? '+' : ''}
                              {metric.percentage_change.toFixed(2)}%
                            </>
                          ) : (
                            '—'
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Anterior: {metric.previous_value}</span>
                      <span>Diferença: {metric.absolute_change}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Accessible Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Tabela Comparativa Consolidada</CardTitle>
              <CardDescription className="text-xs">
                Apresentação tabular acessível dos indicadores consolidados para conferência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <caption className="sr-only">Tabela detalhada de métricas comparativas entre períodos</caption>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                      <th scope="col" className="py-2.5 px-3">Métrica</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Período Atual</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Período Anterior</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Variação Absoluta</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Variação (%)</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Delta (p.p.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.metrics.map((row) => (
                      <tr key={row.metric_name} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{row.metric_name}</td>
                        <td className="py-2.5 px-3 text-right">{row.current_value}</td>
                        <td className="py-2.5 px-3 text-right">{row.previous_value}</td>
                        <td className="py-2.5 px-3 text-right">{row.absolute_change}</td>
                        <td className="py-2.5 px-3 text-right">
                          {row.percentage_change !== null
                            ? `${row.percentage_change > 0 ? '+' : ''}${row.percentage_change.toFixed(2)}%`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {row.percentage_points_change !== null && row.percentage_points_change !== undefined
                            ? `${row.percentage_points_change > 0 ? '+' : ''}${row.percentage_points_change.toFixed(2)} p.p.`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
