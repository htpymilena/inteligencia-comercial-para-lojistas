import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CircuitItem, StoreItem, ApiClientError } from '@/lib/api';
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
  Input,
  Modal,
  Skeleton,
} from '@/components/ui';
import { GitFork, Plus, Calendar, Gift, Store, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export function CircuitsListPage() {
  const { user, selectedStore } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formReward, setFormReward] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [store1, setStore1] = useState('');
  const [store2, setStore2] = useState('');
  const [store3, setStore3] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Queries
  const {
    data: circuits,
    isLoading: isCircuitsLoading,
    isError: isCircuitsError,
    error: circuitsError,
    refetch,
  } = useQuery<CircuitItem[], ApiClientError>({
    queryKey: ['circuits', isAdmin ? 'all' : selectedStore?.id],
    queryFn: () => (isAdmin ? api.listarCircuitos() : api.listarCircuitos(selectedStore?.id)),
  });

  const { data: stores } = useQuery<StoreItem[], ApiClientError>({
    queryKey: ['stores'],
    queryFn: () => api.listarLojas(),
    enabled: isModalOpen && isAdmin,
  });

  // Mutation to create circuit
  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      reward_description: string;
      store_ids: string[];
      start_date: string;
      end_date: string;
    }) => api.criarCircuito(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circuits'] });
      handleCloseModal();
    },
  });

  function handleOpenModal() {
    setFormName('');
    setFormReward('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setFormEndDate(nextMonth.toISOString().split('T')[0]);
    setStore1('');
    setStore2('');
    setStore3('');
    setValidationError(null);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setValidationError(null);
  }

  function handleCreateCircuit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!formName.trim() || !formReward.trim() || !formStartDate || !formEndDate) {
      setValidationError('Todos os campos cadastrais são obrigatórios.');
      return;
    }

    if (formStartDate > formEndDate) {
      setValidationError('A data de início deve ser anterior ou igual à data de término.');
      return;
    }

    if (!store1 || !store2 || !store3) {
      setValidationError('O circuito cooperativo requer a seleção de exatamente 3 lojas.');
      return;
    }

    const uniqueStores = new Set([store1, store2, store3]);
    if (uniqueStores.size !== 3) {
      setValidationError('As 3 lojas participantes devem ser distintas entre si.');
      return;
    }

    createMutation.mutate({
      name: formName.trim(),
      reward_description: formReward.trim(),
      store_ids: [store1, store2, store3],
      start_date: formStartDate,
      end_date: formEndDate,
    });
  }

  function getStatusBadge(status: string) {
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Circuitos Cooperativos</h1>
            <Badge variant="demo">DEMO</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Campanhas comerciais colaborativas entre 3 lojas parceiras para incentivo de fluxo cruzado.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenModal} className="self-start sm:self-auto gap-2" aria-label="Criar novo circuito">
            <Plus className="h-4 w-4" />
            Novo Circuito
          </Button>
        )}
      </div>

      {/* Loading Skeletons */}
      {isCircuitsLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="circuits-loading">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Error View */}
      {isCircuitsError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="circuits-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Falha ao carregar circuitos cooperativos</p>
              <p className="text-xs text-rose-700 mt-0.5">{circuitsError?.message || 'Erro ao conectar à API.'}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isCircuitsLoading && !isCircuitsError && circuits && circuits.length === 0 && (
        <Card className="text-center py-12 px-6 border-dashed border-2 border-slate-200">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <GitFork className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Nenhum circuito disponível</h3>
              <p className="text-sm text-slate-500">
                {isAdmin
                  ? 'Você ainda não cadastrou campanhas cooperativas de 3 lojas.'
                  : 'Sua loja não participa de nenhum circuito ativo no momento.'}
              </p>
            </div>
            {isAdmin && (
              <Button onClick={handleOpenModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Circuito
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Circuits Grid */}
      {!isCircuitsLoading && !isCircuitsError && circuits && circuits.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {circuits.map((circuit) => {
            const storeCount = circuit.stores ? circuit.stores.length : circuit.store_ids ? circuit.store_ids.length : 3;
            return (
              <Card key={circuit.id} className="flex flex-col justify-between border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1">{circuit.name}</CardTitle>
                    {getStatusBadge(circuit.status)}
                  </div>
                  {circuit.start_date && circuit.end_date && (
                    <CardDescription className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {circuit.start_date} até {circuit.end_date}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Gift className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                      <span>Recompensa:</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{circuit.reward_description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Lojas Participantes</span>
                      <span className="text-slate-700 font-semibold">{storeCount} lojas</span>
                    </div>
                    {circuit.stores && circuit.stores.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {circuit.stores.map((s, idx) => (
                          <span
                            key={s.store_id || idx}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            <Store className="h-3 w-3 text-slate-400" />
                            {s.store_name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">3 lojas em rota sequencial</div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-slate-100">
                  <Link to={`/app/circuitos/${circuit.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Ver Detalhes do Circuito</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Administrator Creation Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Criar Novo Circuito Cooperativo"
          description="Configure uma campanha de incentivo de compras cruzadas entre exatamente 3 lojas parceiras."
        >
          <form onSubmit={handleCreateCircuit} noValidate className="space-y-4">
            {validationError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <Input
              id="circuit-name"
              label="Nome do Circuito"
              placeholder="Ex: Rota Moda e Acessórios Primavera"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="circuit-reward" className="block text-sm font-medium text-slate-700">
                Recompensa / Benefício
              </label>
              <textarea
                id="circuit-reward"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                rows={2}
                placeholder="Ex: Ganhe 15% de desconto no 3º estabelecimento após carimbar o passaporte"
                value={formReward}
                onChange={(e) => setFormReward(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="circuit-start"
                type="date"
                label="Data de Início"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                required
              />
              <Input
                id="circuit-end"
                type="date"
                label="Data de Término"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                required
              />
            </div>

            {/* Exactly 3 Stores Selection */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-800">
                Seleção das 3 Lojas Participantes (Obrigatório)
              </label>
              <p className="text-xs text-slate-500">
                Selecione as 3 lojas distintas que farão parte da sequência do circuito.
              </p>

              <div className="space-y-2">
                <div>
                  <label htmlFor="store-1" className="block text-xs font-medium text-slate-600 mb-1">
                    Loja 1 (Ponto de Partida)
                  </label>
                  <select
                    id="store-1"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={store1}
                    onChange={(e) => setStore1(e.target.value)}
                    required
                  >
                    <option value="">Selecione a 1ª loja...</option>
                    {stores?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.segment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="store-2" className="block text-xs font-medium text-slate-600 mb-1">
                    Loja 2 (Ponto Intermediário)
                  </label>
                  <select
                    id="store-2"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={store2}
                    onChange={(e) => setStore2(e.target.value)}
                    required
                  >
                    <option value="">Selecione a 2ª loja...</option>
                    {stores?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.segment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="store-3" className="block text-xs font-medium text-slate-600 mb-1">
                    Loja 3 (Ponto Final / Resgate)
                  </label>
                  <select
                    id="store-3"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={store3}
                    onChange={(e) => setStore3(e.target.value)}
                    required
                  >
                    <option value="">Selecione a 3ª loja...</option>
                    {stores?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.segment})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Criar Circuito
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
