import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Recommendation, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Skeleton } from '@/components/ui';
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, RefreshCw, AlertCircle, Sparkles, Filter } from 'lucide-react';

export function RecommendationsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROPOSED' | 'ACCEPTED' | 'DISMISSED'>('ALL');
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const queryKey = ['recommendations', storeId, statusFilter];

  const {
    data: recommendations,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Recommendation[], ApiClientError>({
    queryKey,
    queryFn: () => api.listarRecomendacoes(storeId!, statusFilter),
    enabled: Boolean(storeId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'DISMISSED' }) =>
      api.atualizarRecomendacao(storeId!, id, status),
    onSuccess: () => {
      setConflictMessage(null);
      queryClient.invalidateQueries({ queryKey: ['recommendations', storeId] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiClientError && err.status === 409) {
        setConflictMessage('Conflito de estado: esta recomendação foi modificada em outra sessão. A lista foi atualizada.');
        queryClient.invalidateQueries({ queryKey: ['recommendations', storeId] });
      } else {
        setConflictMessage(err instanceof Error ? err.message : 'Falha ao atualizar recomendação.');
      }
    },
  });

  function handleAction(id: string, status: 'ACCEPTED' | 'DISMISSED') {
    updateMutation.mutate({ id, status });
  }

  function getPriorityBadge(priority: 'HIGH' | 'MEDIUM' | 'LOW') {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="danger">Alta Prioridade</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Média Prioridade</Badge>;
      case 'LOW':
        return <Badge variant="default">Baixa Prioridade</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recomendações Comerciais</h1>
            <Badge variant="demo">MOTOR DETERMINÍSTICO (DEMO)</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Ações explicáveis baseadas em regras de negócio determinísticas para otimização de vendas e circulação.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          isLoading={isFetching}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Lista
        </Button>
      </div>

      {/* Conflict / Notification Alert */}
      {conflictMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-900"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{conflictMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setConflictMessage(null)}
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-sm">
        {(['ALL', 'PROPOSED', 'ACCEPTED', 'DISMISSED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-2 font-medium rounded-t-lg transition-colors border-b-2 -mb-[2px] ${
              statusFilter === tab
                ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'ALL' && 'Todas'}
            {tab === 'PROPOSED' && 'Propostas'}
            {tab === 'ACCEPTED' && 'Aceitas'}
            {tab === 'DISMISSED' && 'Descartadas'}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4" data-testid="recommendations-loading">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="recommendations-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro ao carregar recomendações</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {error?.message || 'Falha na comunicação com o servidor.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Recarregar
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && recommendations && recommendations.length === 0 && (
        <Card className="p-8 text-center" data-testid="recommendations-empty">
          <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">Nenhuma recomendação neste filtro</h3>
          <p className="mt-1 text-sm text-slate-500">
            Não há itens para a categoria selecionada ({statusFilter}).
          </p>
        </Card>
      )}

      {/* Recommendation Cards */}
      {!isLoading && !isError && recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="border-slate-200 hover:border-slate-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900">{rec.title}</CardTitle>
                      <span className="text-[11px] text-slate-500">
                        Método: {rec.generation_method || 'RULE_BASED_DEMO'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getPriorityBadge(rec.priority)}
                    {rec.status === 'ACCEPTED' && <Badge variant="success">Aceita</Badge>}
                    {rec.status === 'DISMISSED' && <Badge variant="default">Descartada</Badge>}
                    {rec.status === 'PROPOSED' && <Badge variant="outline">Pendente</Badge>}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed border border-slate-100">
                  <span className="font-semibold block text-slate-900 mb-0.5">Hipótese / Proposta:</span>
                  {rec.hypothesis}
                </div>

                <div className="rounded-lg bg-blue-50/60 p-3 text-xs text-blue-900 border border-blue-100">
                  <span className="font-semibold block text-blue-950 mb-0.5">Evidência Identificada:</span>
                  {rec.evidence_summary}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {rec.status === 'PROPOSED' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAction(rec.id, 'ACCEPTED')}
                        isLoading={updateMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Aceitar Recomendação
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(rec.id, 'DISMISSED')}
                        isLoading={updateMutation.isPending}
                        className="text-slate-600 hover:text-rose-600"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Descartar
                      </Button>
                    </>
                  )}

                  {rec.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/app/lojas/${storeId}/experimentos?recommendation_id=${rec.id}`)}
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Criar Experimento
                    </Button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Criada em: {new Date(rec.created_at).toLocaleDateString('pt-BR')}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
