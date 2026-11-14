import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CircuitItem, CircuitStats, ApiClientError } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  Gift,
  Store,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
  RefreshCw,
  GitFork,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function CircuitDetailPage() {
  const { circuitId } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    error: circuitError,
    refetch: refetchCircuit,
  } = useQuery<CircuitItem, ApiClientError>({
    queryKey: ['circuit', circuitId],
    queryFn: () => api.obterCircuito(circuitId!),
    enabled: Boolean(circuitId),
  });

  const { data: stats } = useQuery<CircuitStats, ApiClientError>({
    queryKey: ['circuit-stats', circuitId],
    queryFn: () => api.obterCircuitoStats(circuitId!),
    enabled: Boolean(circuitId),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => api.alterarStatusCircuito(circuitId!, newStatus),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['circuit', circuitId] });
      queryClient.invalidateQueries({ queryKey: ['circuits'] });
    },
    onError: (err: ApiClientError) => {
      setActionError(err.message || 'Falha ao atualizar o status do circuito.');
    },
  });

  function handleStatusChange(newStatus: string) {
    if (confirm(`Deseja alterar o status do circuito para "${newStatus}"?`)) {
      statusMutation.mutate(newStatus);
    }
  }

  function getStatusBadge(status?: string) {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">ATIVO</Badge>;
      case 'FINISHED':
      case 'COMPLETED':
        return <Badge variant="default">FINALIZADO</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">CANCELADO</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="outline">RASCUNHO</Badge>;
    }
  }

  if (isCircuitLoading) {
    return (
      <div className="space-y-6" data-testid="circuit-detail-loading">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  if (isCircuitError || !circuit) {
    return (
      <div className="space-y-6">
        <Link to="/app/circuitos" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Lista de Circuitos
        </Link>
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="circuit-detail-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Circuito não encontrado</p>
              <p className="text-xs text-rose-700 mt-0.5">{circuitError?.message || 'Falha ao carregar detalhes.'}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetchCircuit()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const storesList = circuit.stores && circuit.stores.length > 0
    ? circuit.stores
    : [
        { store_id: 's1', store_name: 'Loja 1', segment: 'Moda', order: 1 },
        { store_id: 's2', store_name: 'Loja 2', segment: 'Acessórios', order: 2 },
        { store_id: 's3', store_name: 'Loja 3', segment: 'Cafeteria', order: 3 },
      ];

  const completedCount = stats?.completed_count ?? circuit.completed_count ?? 42;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/app/circuitos"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para circuitos
        </Link>
      </div>

      {/* Header and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{circuit.name}</h1>
            <Badge variant="demo">DEMO</Badge>
          </div>
          {circuit.start_date && circuit.end_date && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              Período de Vigência: <strong>{circuit.start_date} até {circuit.end_date}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(circuit.status)}
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2"
        >
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Demo Simulation Disclaimer Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
        <GitFork className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Módulo de Demonstração Sintética (DEMO)</p>
          <p className="mt-0.5 text-amber-800">
            As taxas de conclusão e percursos são gerados de forma sintética para exemplificar a dinâmica de cooperação comercial entre as lojas participantes.
          </p>
        </div>
      </div>

      {/* 3-Store Illustrative Sequence Route */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Percurso Ilustrativo do Circuito (3 Lojas Parceiras)</CardTitle>
          <CardDescription className="text-xs">
            Sequência recomendada para clientes percorrerem e carimbarem os passos da campanha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
            {storesList.map((st, index) => (
              <React.Fragment key={st.store_id || index}>
                <div className="flex-1 w-full flex flex-col items-center text-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-brand-50/50 hover:border-brand-200 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm mb-2 shadow-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900">{st.store_name}</h4>
                  {st.segment && (
                    <span className="text-xs text-slate-500 font-medium mt-0.5">{st.segment}</span>
                  )}
                  <div className="mt-2 text-[11px] text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full font-medium">
                    {index === 0 && 'Início do Circuito'}
                    {index === 1 && 'Etapa Intermediária'}
                    {index === 2 && 'Resgate da Recompensa'}
                  </div>
                </div>

                {index < storesList.length - 1 && (
                  <div className="hidden md:flex items-center text-slate-300">
                    <ArrowRight className="h-6 w-6 text-brand-400" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance & Reward Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Completed Count */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Circuitos Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{completedCount}</span>
              <span className="text-xs text-slate-500">resgates registrados</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              Métrica agregada sintética
            </p>
          </CardContent>
        </Card>

        {/* Reward Description */}
        <Card className="border-slate-200 sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Benefício / Recompensa da Campanha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{circuit.reward_description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Válido exclusivamente mediante comprovação da visita nas 3 lojas parceiras participantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Lifecycle Actions */}
      {isAdmin && (
        <Card className="border-slate-200 bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Controles Administrativos do Ciclo de Vida
            </CardTitle>
            <CardDescription className="text-xs">
              Como administrador, você pode gerenciar a ativação, encerramento ou cancelamento desta campanha.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {circuit.status === 'DRAFT' && (
              <>
                <Button
                  onClick={() => handleStatusChange('ACTIVE')}
                  isLoading={statusMutation.isPending}
                  className="gap-1.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  Ativar Circuito
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('CANCELLED')}
                  isLoading={statusMutation.isPending}
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancelar Campanha
                </Button>
              </>
            )}

            {circuit.status === 'ACTIVE' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('FINISHED')}
                  isLoading={statusMutation.isPending}
                  className="text-brand-700 border-brand-300 hover:bg-brand-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Concluir Circuito
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('CANCELLED')}
                  isLoading={statusMutation.isPending}
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancelar Circuito
                </Button>
              </>
            )}

            {(circuit.status === 'FINISHED' || circuit.status === 'COMPLETED' || circuit.status === 'CANCELLED') && (
              <p className="text-xs text-slate-500 italic">
                Este circuito atingiu um estado final ({circuit.status}) e não permite novas transições de status.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
