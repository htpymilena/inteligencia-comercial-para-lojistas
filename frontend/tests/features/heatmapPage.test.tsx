import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeatmapPage } from '@/features/heatmap/HeatmapPage';
import { api, HeatmapResponse, ApiClientError } from '@/lib/api';

describe('HeatmapPage (TELA005 Heatmap Filtering & Empty Fallback)', () => {
  let queryClient: QueryClient;

  const mockHeatmapData: HeatmapResponse = {
    store_id: 'store-1',
    date: '2026-11-14',
    grid_width: 10,
    grid_height: 8,
    is_simulated: true,
    cells: [
      { x: 0, y: 0, intensity: 0.2, zone_name: 'Entrada' },
      { x: 1, y: 0, intensity: 0.8, zone_name: 'Vitrine' },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  function renderPage() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/mapa']}>
          <Routes>
            <Route path="/app/lojas/:storeId/mapa" element={<HeatmapPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders populated heatmap grid when data is available', async () => {
    vi.spyOn(api, 'obterMapaCalorDemo').mockResolvedValue(mockHeatmapData);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Planta Esquemática e Densidade de Ocupação')).toBeInTheDocument();
      expect(screen.getByRole('grid', { name: /mapa de calor esquemático da loja/i })).toBeInTheDocument();
    });
  });

  it('renders blank perimeter schematic and empty guidance when date has no cells', async () => {
    vi.spyOn(api, 'obterMapaCalorDemo').mockResolvedValue({
      ...mockHeatmapData,
      cells: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
      expect(screen.getByText(/Sem dados registrados para a data selecionada/i)).toBeInTheDocument();
      // Verifies blank grid is still rendered
      expect(screen.getByRole('grid', { name: /mapa de calor esquemático da loja/i })).toBeInTheDocument();
    });
  });

  it('allows selecting another date and triggers fetch', async () => {
    const fetchSpy = vi.spyOn(api, 'obterMapaCalorDemo').mockResolvedValue(mockHeatmapData);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Planta Esquemática e Densidade de Ocupação')).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(/data de observação/i);
    fireEvent.change(dateInput, { target: { value: '2026-11-10' } });

    const applyBtn = screen.getByRole('button', { name: /aplicar data/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('store-1', '2026-11-10');
    });
  });
});
