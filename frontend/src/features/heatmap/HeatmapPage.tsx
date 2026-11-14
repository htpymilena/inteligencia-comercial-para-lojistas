import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, HeatmapResponse, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Skeleton, Badge } from '@/components/ui';
import { HeatmapGrid } from './HeatmapGrid';
import { Flame, Calendar, RefreshCw, AlertCircle, Info, MapPin } from 'lucide-react';

export function HeatmapPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [appliedDate, setAppliedDate] = useState(todayStr);

  const {
    data: heatmap,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<HeatmapResponse, ApiClientError>({
    queryKey: ['heatmap', storeId, appliedDate],
    queryFn: () => api.obterMapaCalorDemo(storeId!, appliedDate),
    enabled: Boolean(storeId),
  });

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDate) {
      setAppliedDate(selectedDate);
    }
  }

  const hasData = Boolean(heatmap && heatmap.cells && heatmap.cells.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mapa de Calor da Loja</h1>
            <Badge variant="demo">SIMULAÇÃO SINTÉTICA</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Distribuição espacial do tempo de permanência de clientes nas zonas da loja.
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <Card className="p-4 border-slate-200">
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
          <div className="flex-1">
            <Input
              label="Data de observação"
              type="date"
              id="heatmap-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={isFetching} className="shrink-0">
            <Calendar className="h-4 w-4 mr-2" />
            Aplicar Data
          </Button>
        </form>
      </Card>

      {/* Loading Skeletons */}
      {isLoading && (
        <Card className="p-6 space-y-4" data-testid="heatmap-loading">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="heatmap-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro ao carregar mapa de calor</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {error?.message || 'Falha na consulta ao servidor.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty State when no points exist for date */}
      {!isLoading && !isError && (!hasData || heatmap?.cells.length === 0) && (
        <div className="space-y-4" data-testid="heatmap-empty">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Sem dados registrados para a data selecionada ({appliedDate})</p>
              <p className="text-amber-800 mt-0.5">
                Apresentando a planta baixa esquemática da loja sem sobreposição de calor.
                Utilize o filtro de data acima para consultar dias com fluxo demonstrativo registrado.
              </p>
            </div>
          </div>

          {/* Blank perimeter grid */}
          <HeatmapGrid cells={[]} gridWidth={10} gridHeight={8} isSimulated={true} />
        </div>
      )}

      {/* Populated Grid */}
      {!isLoading && !isError && hasData && heatmap && (
        <HeatmapGrid
          cells={heatmap.cells}
          gridWidth={heatmap.grid_width}
          gridHeight={heatmap.grid_height}
          isSimulated={heatmap.is_simulated}
        />
      )}
    </div>
  );
}
