import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { StoreSelectionPage } from '@/features/stores/StoreSelectionPage';
import { api, StoreItem, ApiClientError } from '@/lib/api';

describe('StoreSelectionPage (TELA002)', () => {
  const mockStores: StoreItem[] = [
    {
      id: 'store-1',
      name: 'Moda Urbana',
      segment: 'Vestuário',
      floor: 'L1',
      is_demo: true,
    },
    {
      id: 'store-2',
      name: 'Café & Grão',
      segment: 'Alimentação',
      floor: 'L2',
      is_demo: true,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/app/lojas']}>
        <AuthProvider>
          <Routes>
            <Route path="/app/lojas" element={<StoreSelectionPage />} />
            <Route path="/app/lojas/:storeId/painel" element={<div>Dashboard da Loja</div>} />
            <Route path="/login" element={<div>Tela de Login</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it('renders store list with DEMO badges and navigates to store dashboard', async () => {
    vi.spyOn(api, 'listarLojas').mockResolvedValue(mockStores);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Moda Urbana')).toBeInTheDocument();
      expect(screen.getByText('Café & Grão')).toBeInTheDocument();
      expect(screen.getAllByText('DEMO')).toHaveLength(2);
    });

    const openBtns = screen.getAllByRole('button', { name: /abrir painel/i });
    fireEvent.click(openBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Dashboard da Loja')).toBeInTheDocument();
    });
  });

  it('renders empty state when no stores are returned', async () => {
    vi.spyOn(api, 'listarLojas').mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma loja vinculada')).toBeInTheDocument();
    });
  });

  it('renders error state and retries on failure', async () => {
    const listSpy = vi.spyOn(api, 'listarLojas')
      .mockRejectedValueOnce(new ApiClientError(500, { error: { code: 'SERVER_ERROR', message: 'Falha no banco' } }))
      .mockResolvedValueOnce(mockStores);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Falha ao carregar lojas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getByText('Moda Urbana')).toBeInTheDocument();
    });
    expect(listSpy).toHaveBeenCalledTimes(2);
  });
});
