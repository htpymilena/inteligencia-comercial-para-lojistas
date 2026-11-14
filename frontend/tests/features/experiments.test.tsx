import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExperimentsListPage } from '@/features/experiments/ExperimentsListPage';
import { ExperimentDetailPage } from '@/features/experiments/ExperimentDetailPage';
import { api, Experiment, ExperimentResult } from '@/lib/api';

describe('Experiments (TELA007 & TELA008)', () => {
  let queryClient: QueryClient;

  const mockExperiments: Experiment[] = [
    {
      id: 'exp-1',
      store_id: 'store-1',
      title: 'Teste de vitrine promocional',
      target_metric: 'CONVERSION',
      status: 'DRAFT',
      planned_start_date: '2026-11-15',
      planned_end_date: '2026-11-28',
    },
    {
      id: 'exp-2',
      store_id: 'store-1',
      title: 'Campanha de interação no caixa',
      target_metric: 'SALES',
      status: 'RUNNING',
      planned_start_date: '2026-11-01',
      planned_end_date: '2026-11-14',
      actual_start_date: '2026-11-01',
    },
  ];

  const mockResult: ExperimentResult = {
    experiment_id: 'exp-2',
    target_metric: 'SALES',
    before_value: '120 vendas',
    after_value: '145 vendas',
    relative_change_percent: 20.83,
    is_observational: true,
    data_available: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  it('ExperimentsListPage renders experiments list and opens creation modal', async () => {
    vi.spyOn(api, 'listarExperimentos').mockResolvedValue(mockExperiments);
    vi.spyOn(api, 'listarRecomendacoes').mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/experimentos']}>
          <Routes>
            <Route path="/app/lojas/:storeId/experimentos" element={<ExperimentsListPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Teste de vitrine promocional')).toBeInTheDocument();
      expect(screen.getByText('Campanha de interação no caixa')).toBeInTheDocument();
      expect(screen.getByText('Rascunho')).toBeInTheDocument();
      expect(screen.getByText('Em Execução')).toBeInTheDocument();
    });

    const newBtn = screen.getByRole('button', { name: /novo experimento/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Novo Experimento Comercial')).toBeInTheDocument();
  });

  it('ExperimentDetailPage renders lifecycle timeline and handles start action', async () => {
    vi.spyOn(api, 'obterExperimento').mockResolvedValue(mockExperiments[0]);
    vi.spyOn(api, 'obterResultadoExperimento').mockResolvedValue({
      ...mockResult,
      data_available: false,
    });
    const updateSpy = vi.spyOn(api, 'alterarStatusExperimento').mockResolvedValue({
      ...mockExperiments[0],
      status: 'RUNNING',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/experimentos/exp-1']}>
          <Routes>
            <Route path="/app/lojas/:storeId/experimentos/:experimentId" element={<ExperimentDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Teste de vitrine promocional')).toBeInTheDocument();
      expect(screen.getByText('Ciclo de Vida do Experimento')).toBeInTheDocument();
    });

    const startBtn = screen.getByRole('button', { name: /iniciar experimento/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('store-1', 'exp-1', 'RUNNING');
    });
  });

  it('ExperimentDetailPage renders observational results with mandatory non-causal disclaimer', async () => {
    vi.spyOn(api, 'obterExperimento').mockResolvedValue(mockExperiments[1]);
    vi.spyOn(api, 'obterResultadoExperimento').mockResolvedValue(mockResult);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/experimentos/exp-2']}>
          <Routes>
            <Route path="/app/lojas/:storeId/experimentos/:experimentId" element={<ExperimentDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Resultado estritamente observacional/i)).toBeInTheDocument();
      expect(screen.getByText('120 vendas')).toBeInTheDocument();
      expect(screen.getByText('145 vendas')).toBeInTheDocument();
      expect(screen.getByText('+20.83%')).toBeInTheDocument();
    });
  });
});
