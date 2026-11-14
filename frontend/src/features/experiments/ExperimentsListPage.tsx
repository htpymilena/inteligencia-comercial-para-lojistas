import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Experiment, Recommendation, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Modal, Input, Skeleton } from '@/components/ui';
import { FlaskConical, Plus, Calendar, ArrowRight, Play, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export function ExperimentsListPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const preselectedRecId = searchParams.get('recommendation_id') || '';

  const [isModalOpen, setIsModalOpen] = useState(Boolean(preselectedRecId));
  const [title, setTitle] = useState('');
  const [recommendationId, setRecommendationId] = useState(preselectedRecId);
  const [targetMetric, setTargetMetric] = useState<'VISITORS' | 'SALES' | 'REVENUE' | 'CONVERSION'>('CONVERSION');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: experiments, isLoading, isError, error, refetch } = useQuery<Experiment[], ApiClientError>({
    queryKey: ['experiments', storeId],
    queryFn: () => api.listarExperimentos(storeId!),
    enabled: Boolean(storeId),
  });

  const { data: acceptedRecommendations } = useQuery<Recommendation[], ApiClientError>({
    queryKey: ['recommendations', storeId, 'ACCEPTED'],
    queryFn: () => api.listarRecomendacoes(storeId!, 'ACCEPTED'),
    enabled: Boolean(storeId),
  });

  // Automatically fill title if preselected recommendation is found
  useEffect(() => {
    if (preselectedRecId && acceptedRecommendations) {
      const rec = acceptedRecommendations.find((r) => r.id === preselectedRecId);
      if (rec && !title) {
        setTitle(`Teste: ${rec.title}`);
      }
    }
  }, [preselectedRecId, acceptedRecommendations, title]);

  const createMutation = useMutation({
    mutationFn: (newExp: {
      title: string;
      recommendation_id?: string;
      target_metric: string;
      planned_start_date: string;
      planned_end_date: string;
    }) => api.criarExperimento(storeId!, newExp),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['experiments', storeId] });
      setIsModalOpen(false);
      navigate(`/app/lojas/${storeId}/experimentos/${created.id}`);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Falha ao criar experimento.');
    },
  });

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Informe o título do experimento.');
      return;
    }

    if (startDate > endDate) {
      setFormError('A data de início deve ser anterior ou igual à data de fim.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      recommendation_id: recommendationId || undefined,
      target_metric: targetMetric,
      planned_start_date: startDate,
      planned_end_date: endDate,
    });
  }

  function getStatusBadge(status: Experiment['status']) {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'RUNNING':
        return <Badge variant="warning" className="animate-pulse">Em Execução</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Concluído</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelado</Badge>;
    }
  }

  function getMetricLabel(metric: Experiment['target_metric']) {
    switch (metric) {
      case 'VISITORS':
        return 'Fluxo de Visitantes';
      case 'SALES':
        return 'Vendas Concluídas';
      case 'REVENUE':
        return 'Faturamento Bruto';
      case 'CONVERSION':
        return 'Taxa de Conversão (%)';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Experimentos e Testes A/B</h1>
            <Badge variant="demo">DEMO</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Validação prática de hipóteses comerciais através de testes estruturados com período pré-definido.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Experimento
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4" data-testid="experiments-loading">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="experiments-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro ao carregar experimentos</p>
              <p className="text-xs text-rose-700 mt-0.5">{error?.message || 'Falha na comunicação com a API.'}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && experiments && experiments.length === 0 && (
        <Card className="p-8 text-center" data-testid="experiments-empty">
          <FlaskConical className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">Nenhum experimento cadastrado</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Aceite uma recomendação comercial proposta para iniciar seu primeiro ciclo de testes controlado.
          </p>
          <div className="mt-5">
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Configurar Primeiro Experimento
            </Button>
          </div>
        </Card>
      )}

      {/* Experiments List */}
      {!isLoading && !isError && experiments && experiments.length > 0 && (
        <div className="grid gap-4">
          {experiments.map((exp) => (
            <Card key={exp.id} className="border-slate-200 hover:border-brand-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900">{exp.title}</CardTitle>
                      <span className="text-xs text-slate-500">Métrica-alvo: {getMetricLabel(exp.target_metric)}</span>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto">{getStatusBadge(exp.status)}</div>
                </div>
              </CardHeader>

              <CardContent className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>
                    Planejado: {exp.planned_start_date} até {exp.planned_end_date}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/app/lojas/${storeId}/experimentos/${exp.id}`)}
                >
                  <span>Ver Detalhes e Resultados</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Experiment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Experimento Comercial"
        description="Configure um teste de melhoria associado a uma recomendação aceita."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <Input
            label="Título do Experimento"
            id="exp-title"
            placeholder="Ex: Teste da arara de promoção na entrada"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Recommendation select */}
          <div className="space-y-1.5">
            <label htmlFor="exp-rec" className="block text-sm font-medium text-slate-700">
              Recomendação Vinculada (Opcional)
            </label>
            <select
              id="exp-rec"
              value={recommendationId}
              onChange={(e) => setRecommendationId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Sem recomendação vinculada</option>
              {acceptedRecommendations?.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.title} ({rec.priority})
                </option>
              ))}
            </select>
          </div>

          {/* Target Metric */}
          <div className="space-y-1.5">
            <label htmlFor="exp-metric" className="block text-sm font-medium text-slate-700">
              Métrica-Alvo de Avaliação
            </label>
            <select
              id="exp-metric"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value as any)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="CONVERSION">Taxa de Conversão (%)</option>
              <option value="VISITORS">Total de Visitantes</option>
              <option value="SALES">Vendas Concluídas</option>
              <option value="REVENUE">Faturamento Bruto (R$)</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Início Planejado"
              type="date"
              id="exp-start"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Fim Planejado"
              type="date"
              id="exp-end"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Criar Experimento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
