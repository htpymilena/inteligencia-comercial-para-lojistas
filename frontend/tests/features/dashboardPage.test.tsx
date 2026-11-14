import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { api, DashboardResponse, ApiClientError } from '@/lib/api';

describe('DashboardPage (TELA003)', () => {
  let queryClient: QueryClient;

  const mockDashboardData: DashboardResponse = {
    store_id: 'store-1',
    period_start: '2026-10-15',
    period_end: '2026-11-14',
    total_visitors: 4500,
    total_interactions: 1800,
    total_sales: 320,
    conversion_rate: 7.11,
    total_revenue: '48900.00',
    is_simulated: true,
    daily_metrics: [
      {
        date: '2026-11-01',
        visitors: 150,
        interactions: 60,
        sales: 12,
        conversion_rate: 8.0,
        revenue: '1800.00',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  function renderPage() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/painel']}>
          <Routes>
            <Route path="/app/lojas/:storeId/painel" element={<DashboardPage />} />
            <Route path="/app/lojas/:storeId/recomendacoes" element={<div>Página de Recomendações</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders loading skeletons while fetching data', () => {
    vi.spyOn(api, 'obterDashboard').mockImplementation(() => new Promise(() => {}));
    renderPage();

    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('renders indicators and opportunity banner upon successful load', async () => {
    vi.spyOn(api, 'obterDashboard').mockResolvedValue(mockDashboardData);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('4.500')).toBeInTheDocument();
      expect(screen.getByText('320')).toBeInTheDocument();
      expect(screen.getByText('7,11%')).toBeInTheDocument();
      expect(screen.getByText('Oportunidades Comerciais Identificadas')).toBeInTheDocument();
    });

    const recBtn = screen.getByRole('button', { name: /ver recomendações/i });
    fireEvent.click(recBtn);

    await waitFor(() => {
      expect(screen.getByText('Página de Recomendações')).toBeInTheDocument();
    });
  });

  it('renders empty state when daily_metrics is empty', async () => {
    vi.spyOn(api, 'obterDashboard').mockResolvedValue({
      ...mockDashboardData,
      daily_metrics: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-empty')).toBeInTheDocument();
      expect(screen.getByText('Nenhum dado registrado neste período')).toBeInTheDocument();
    });
  });

  it('renders error card and allows retrying on query failure', async () => {
    const dashSpy = vi.spyOn(api, 'obterDashboard')
      .mockRejectedValueOnce(new ApiClientError(500, { error: { code: 'INTERNAL_ERROR', message: 'Falha no banco' } }))
      .mockResolvedValueOnce(mockDashboardData);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText(/Falha no banco/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /recarregar/i }));

    await waitFor(() => {
      expect(screen.getByText('4.500')).toBeInTheDocument();
    });
    expect(dashSpy).toHaveBeenCalledTimes(2);
  });
});
