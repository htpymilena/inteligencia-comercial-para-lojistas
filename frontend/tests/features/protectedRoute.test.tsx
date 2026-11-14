import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { ForbiddenPage } from '@/features/auth/ForbiddenPage';
import { AuthContextType } from '@/features/auth/AuthContext';

// Mock useAuth
const mockAuth: AuthContextType = {
  token: 'valid-token',
  user: {
    id: 'u-1',
    email: 'lojista@nexo2031.demo',
    full_name: 'Lojista',
    role: 'LOJISTA',
    created_at: '2026-11-14T00:00:00Z',
  },
  selectedStore: {
    id: 'store-1',
    name: 'Loja 1',
    segment: 'Vestuário',
    floor: 'L1',
    is_demo: true,
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  setSelectedStore: vi.fn(),
};

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('ProtectedRoute & ForbiddenPage', () => {
  it('renders child component when authorized', () => {
    render(
      <MemoryRouter initialEntries={['/app/lojas/store-1/painel']}>
        <Routes>
          <Route
            path="/app/lojas/:storeId/painel"
            element={
              <ProtectedRoute allowedStoreIds={['store-1']}>
                <div>Painel Autorizado</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Painel Autorizado')).toBeInTheDocument();
  });

  it('renders 403 ForbiddenPage when storeId is unauthorized for LOJISTA', () => {
    render(
      <MemoryRouter initialEntries={['/app/lojas/store-999/painel']}>
        <Routes>
          <Route
            path="/app/lojas/:storeId/painel"
            element={
              <ProtectedRoute allowedStoreIds={['store-1']}>
                <div>Painel Autorizado</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/403 — Acesso Negado/i)).toBeInTheDocument();
    expect(screen.queryByText('Painel Autorizado')).not.toBeInTheDocument();
  });

  it('ForbiddenPage provides back button to store selection', () => {
    render(
      <MemoryRouter initialEntries={['/403']}>
        <Routes>
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/app/lojas" element={<div>Lista de Lojas</div>} />
        </Routes>
      </MemoryRouter>
    );

    const backBtn = screen.getByRole('button', { name: /voltar para seleção de lojas/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(screen.getByText('Lista de Lojas')).toBeInTheDocument();
  });
});
