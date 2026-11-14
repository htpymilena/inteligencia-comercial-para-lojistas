import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Experiment, ExperimentResult, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Skeleton } from '@/components/ui';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  AlertCircle,
  TrendingUp,
  Info,
  ShieldAlert,
} from 'lucide-react';

export function ExperimentDetailPage() {
  const { storeId, experimentId } = useParams<{ storeId: string; experimentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: experiment,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Experiment, ApiClientError>({
    queryKey: ['experiment', storeId, experimentId],
    queryFn: () => api.obterExperimento(storeId!, experimentId!),
    enabled: Boolean(storeId && experimentId),
  });

  const { data: result, isLoading: isLoadingResult } = useQuery<ExperimentResult, ApiClientError>({
    queryKey: ['experiment-result', storeId, experimentId],
    queryFn: () => api.obterResultadoExperimento(storeId!, experimentId!),
    enabled: Boolean(storeId && experimentId && (experiment?.status === 'RUNNING' || experiment?.status === 'COMPLETED')),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: 'RUNNING' | 'COMPLETED' | 'CANCELLED') =>
      api.alterarStatusExperimento(storeId!, experimentId!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', storeId, experimentId] });
      queryClient.invalidateQueries({ queryKey: ['experiments', storeId] });
      queryClient.invalidateQueries({ queryKey: ['experiment-result', storeId, experimentId] });
    },
  });

  function getStatusStep(status: Experiment['status']) {
    switch (status) {
      case 'DRAFT':
        return 1;
      case 'RUNNING':
        return 2;
      case 'COMPLETED':
        return 3;
      case 'CANCELLED':
        return -1;
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="experiment-detail-loading">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-44 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !experiment) {
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <AlertCircle className="h-6 w-6 text-rose-600 mb-2" />
        <h2 className="text-base font-semibold">Erro ao carregar detalhes do experimento</h2>
        <p className="text-xs text-rose-600 mt-1">{error?.message || 'Experimento não encontrado.'}</p>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate(`/app/lojas/${storeId}/experimentos`)}>
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const currentStep = getStatusStep(experiment.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top action and back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/lojas/${storeId}/experimentos`)}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Voltar aos Experimentos
        </Button>

        <Badge variant="demo">DADOS OBSERVACIONAIS (DEMO)</Badge>
      </div>

      {/* Main Experiment Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-900">{experiment.title}</CardTitle>
                <CardDescription className="text-xs">
                  Métrica-alvo: <span className="font-semibold text-slate-700">{experiment.target_metric}</span>
                </CardDescription>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {experiment.status === 'DRAFT' && <Badge variant="outline">Rascunho</Badge>}
              {experiment.status === 'RUNNING' && <Badge variant="warning">Em Execução</Badge>}
              {experiment.status === 'COMPLETED' && <Badge variant="success">Concluído</Badge>}
              {experiment.status === 'CANCELLED' && <Badge variant="danger">Cancelado</Badge>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lifecycle Timeline */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
              Ciclo de Vida do Experimento
            </h3>

            {experiment.status === 'CANCELLED' ? (
              <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>Este experimento foi cancelado e teve sua apuração interrompida.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

                {/* Steps */}
                <div className="flex items-center gap-2 bg-slate-50 px-2 z-10">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-xs font-medium text-slate-800">Rascunho</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-2 z-10">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs font-medium text-slate-800">Em Execução</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-2 z-10">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-medium text-slate-800">Concluído</span>
                </div>
              </div>
            )}
          </div>

          {/* Dates & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-500 block mb-1">Período Planejado:</span>
              <span className="font-semibold text-slate-800">
                {experiment.planned_start_date} até {experiment.planned_end_date}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-500 block mb-1">Período Real de Execução:</span>
              <span className="font-semibold text-slate-800">
                {experiment.actual_start_date
                  ? `${experiment.actual_start_date} até ${experiment.actual_end_date || 'em andamento'}`
                  : 'Ainda não iniciado'}
              </span>
            </div>
          </div>

          {/* Action Buttons to Transition Status */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            {experiment.status === 'DRAFT' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => statusMutation.mutate('RUNNING')}
                  isLoading={statusMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-1.5" />
                  Iniciar Experimento
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => statusMutation.mutate('CANCELLED')}
                  isLoading={statusMutation.isPending}
                  className="text-rose-600 hover:text-rose-700"
                >
                  Cancelar Teste
                </Button>
              </>
            )}

            {experiment.status === 'RUNNING' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => statusMutation.mutate('COMPLETED')}
                  isLoading={statusMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Concluir Experimento
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => statusMutation.mutate('CANCELLED')}
                  isLoading={statusMutation.isPending}
                  className="text-rose-600 hover:text-rose-700"
                >
                  Cancelar Teste
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outcome Results Section (Task 6.3) */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              <CardTitle>Comparativo Antes / Durante o Experimento</CardTitle>
            </div>
            {result?.is_observational && <Badge variant="demo">OBSERVACIONAL</Badge>}
          </div>
          <CardDescription>
            Comparação da métrica-alvo entre a janela do experimento e o período equivalente anterior.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Strict Non-Causal Methodological Disclaimer */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Nota Metodológica Obrigatória</p>
              <p className="text-amber-800 leading-relaxed">
                Resultado estritamente observacional. Não demonstra causalidade direta ou exclusividade dos fatores testados.
                Fatores externos de shopping (chuva, eventos, campanhas concorrentes) podem ter influenciado as variações observadas.
              </p>
            </div>
          </div>

          {/* Results Cards or Data Unavailable */}
          {result?.data_available ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-xs text-slate-500 font-medium uppercase">Período Anterior</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{result.before_value}</div>
              </div>

              <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-center">
                <span className="text-xs text-brand-700 font-medium uppercase">Período do Experimento</span>
                <div className="text-xl font-bold text-brand-900 mt-1">{result.after_value}</div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
                <span className="text-xs text-emerald-700 font-medium uppercase">Variação Observada</span>
                <div className="text-xl font-bold text-emerald-800 mt-1">
                  {result.relative_change_percent !== null ? (
                    `${result.relative_change_percent > 0 ? '+' : ''}${result.relative_change_percent.toFixed(2)}%`
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
              <Info className="h-6 w-6 text-slate-400 mx-auto mb-2" />
              <span>
                Dados insuficientes ou em apuração para cálculo de resultado observacional. Aguarde o acúmulo de dados diários
                durante a vigência do teste.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
