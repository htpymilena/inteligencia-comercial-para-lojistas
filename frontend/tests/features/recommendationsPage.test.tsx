import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecommendationsPage } from '@/features/recommendations/RecommendationsPage';
import { api, Recommendation, ApiClientError } from '@/lib/api';

describe('RecommendationsPage (TELA006 Recommendations)', () => {
  let queryClient: QueryClient;

  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec-1',
      store_id: 'store-1',
      title: 'Reposicionar vitrine de entrada',
      hypothesis: 'Aumentar a conversão dos visitantes ao entrar na loja',
      priority: 'HIGH',
      evidence_summary: 'Taxa de permanência na entrada 40% acima da média',
      status: 'PROPOSED',
      generation_method: 'RULE_BASED_DEMO',
      created_at: '2026-11-14T00:00:00Z',
    },
    {
      id: 'rec-2',
      store_id: 'store-1',
      title: 'Ilha de queima de estoque próxima aos caixas',
      hypothesis: 'Estimular compras por impulso antes do pagamento',
      priority: 'MEDIUM',
      evidence_summary: 'Fila de caixa com espera média de 3 minutos',
      status: 'ACCEPTED',
      generation_method: 'RULE_BASED_DEMO',
      created_at: '2026-11-14T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  function renderPage() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/recomendacoes']}>
          <Routes>
            <Route path="/app/lojas/:storeId/recomendacoes" element={<RecommendationsPage />} />
            <Route path="/app/lojas/:storeId/experimentos" element={<div>Página de Experimentos</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders recommendation cards with priority badges, hypothesis and evidence', async () => {
    vi.spyOn(api, 'listarRecomendacoes').mockResolvedValue(mockRecommendations);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Reposicionar vitrine de entrada')).toBeInTheDocument();
      expect(screen.getByText('Alta Prioridade')).toBeInTheDocument();
      expect(screen.getByText(/Taxa de permanência na entrada 40% acima da média/i)).toBeInTheDocument();
      expect(screen.getByText('Ilha de queima de estoque próxima aos caixas')).toBeInTheDocument();
      expect(screen.getByText('Média Prioridade')).toBeInTheDocument();
    });
  });

  it('filters recommendations when changing status tabs', async () => {
    const fetchSpy = vi.spyOn(api, 'listarRecomendacoes').mockResolvedValue(mockRecommendations);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Reposicionar vitrine de entrada')).toBeInTheDocument();
    });

    const acceptedTab = screen.getByRole('button', { name: /^aceitas$/i });
    fireEvent.click(acceptedTab);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('store-1', 'ACCEPTED');
    });
  });

  it('executes accept action and transitions state', async () => {
    vi.spyOn(api, 'listarRecomendacoes').mockResolvedValue(mockRecommendations);
    const updateSpy = vi.spyOn(api, 'atualizarRecomendacao').mockResolvedValue({
      ...mockRecommendations[0],
      status: 'ACCEPTED',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Reposicionar vitrine de entrada')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByRole('button', { name: /aceitar recomendação/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('store-1', 'rec-1', 'ACCEPTED');
    });
  });

  it('handles 409 conflict error with alert notification and refetch', async () => {
    vi.spyOn(api, 'listarRecomendacoes').mockResolvedValue(mockRecommendations);
    vi.spyOn(api, 'atualizarRecomendacao').mockRejectedValue(
      new ApiClientError(409, {
        error: { code: 'CONFLICT', message: 'Recomendação já alterada por outro usuário' },
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Reposicionar vitrine de entrada')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByRole('button', { name: /aceitar recomendação/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(screen.getByText(/Conflito de estado: esta recomendação foi modificada em outra sessão/i)).toBeInTheDocument();
    });
  });
});
