import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MonitoringPage } from '@/features/monitoring/MonitoringPage';
import { api, CameraSnapshot } from '@/lib/api';

describe('MonitoringPage (TELA004 Demo Cameras)', () => {
  let queryClient: QueryClient;

  const mockCameras: CameraSnapshot[] = [
    {
      camera_id: 'cam-01',
      name: 'Câmera 01 — Entrada Principal',
      zone: 'Entrada',
      current_count: 8,
      entries_count: 124,
      exits_count: 116,
      is_simulated: true,
      timestamp: '2026-11-14T10:30:00Z',
    },
    {
      camera_id: 'cam-02',
      name: 'Câmera 02 — Vitrine Central',
      zone: 'Vitrine',
      current_count: 4,
      entries_count: 89,
      exits_count: 85,
      is_simulated: true,
      timestamp: '2026-11-14T10:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  function renderPage() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/monitoramento']}>
          <Routes>
            <Route path="/app/lojas/:storeId/monitoramento" element={<MonitoringPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders privacy disclaimer and simulation notice', async () => {
    vi.spyOn(api, 'listarCamerasDemo').mockResolvedValue(mockCameras);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Privacidade por Design e Diretrizes Éticas/i)).toBeInTheDocument();
      expect(screen.getByText(/O sistema NEXO 2031 não opera câmeras físicas reais/i)).toBeInTheDocument();
    });
  });

  it('renders synthetic cameras with counts and no video/webcam tags', async () => {
    vi.spyOn(api, 'listarCamerasDemo').mockResolvedValue(mockCameras);
    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('Câmera 01 — Entrada Principal')).toBeInTheDocument();
      expect(screen.getByText('Câmera 02 — Vitrine Central')).toBeInTheDocument();
      expect(screen.getByText('124')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getAllByText('DEMO')).toHaveLength(2);
    });

    // VERIFY NO REAL VIDEO OR WEBCAM ACCESS TAGS!
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('audio')).toBeNull();
  });

  it('triggers refresh when clicking Atualizar Dados', async () => {
    const fetchSpy = vi.spyOn(api, 'listarCamerasDemo').mockResolvedValue(mockCameras);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Câmera 01 — Entrada Principal')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /atualizar dados/i });
    fireEvent.click(refreshBtn);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
