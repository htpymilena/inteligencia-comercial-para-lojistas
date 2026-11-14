import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CircuitsListPage } from '@/features/circuits/CircuitsListPage';
import { CircuitDetailPage } from '@/features/circuits/CircuitDetailPage';
import { AuthContext, AuthContextType } from '@/features/auth/AuthContext';
import { api, CircuitItem, StoreItem, UserProfile } from '@/lib/api';

describe('Circuits (M07 - TELA010 & TELA011)', () => {
  let queryClient: QueryClient;

  const mockAdminUser: UserProfile = {
    id: 'user-admin',
    email: 'admin@demo.invalid',
    full_name: 'Admin Demo',
    role: 'ADMIN',
    created_at: '2026-01-01',
  };

  const mockLojistaUser: UserProfile = {
    id: 'user-lojista',
    email: 'lojista@demo.invalid',
    full_name: 'Lojista Demo',
    role: 'LOJISTA',
    created_at: '2026-01-01',
  };

  const mockStore1: StoreItem = {
    id: 'store-1',
    name: 'Loja Alpha',
    segment: 'Moda Feminina',
    floor: 'Piso 1',
    is_demo: true,
  };

  const mockStore2: StoreItem = {
    id: 'store-2',
    name: 'Loja Beta',
    segment: 'Acessórios',
    floor: 'Piso 1',
    is_demo: true,
  };

  const mockStore3: StoreItem = {
    id: 'store-3',
    name: 'Loja Gamma',
    segment: 'Cafeteria & Bistrô',
    floor: 'Piso 2',
    is_demo: true,
  };

  const mockCircuits: CircuitItem[] = [
    {
      id: 'circ-1',
      name: 'Circuito Primavera 2026',
      reward_description: 'Ganhe 15% de desconto no Café Gamma ao visitar Alpha e Beta',
      status: 'ACTIVE',
      start_date: '2026-11-01',
      end_date: '2026-11-30',
      completed_count: 58,
      stores: [
        { store_id: 'store-1', store_name: 'Loja Alpha', segment: 'Moda', order: 1 },
        { store_id: 'store-2', store_name: 'Loja Beta', segment: 'Acessórios', order: 2 },
        { store_id: 'store-3', store_name: 'Loja Gamma', segment: 'Cafeteria', order: 3 },
      ],
      is_simulated: true,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  function createMockAuth(user: UserProfile): AuthContextType {
    return {
      token: 'jwt-token',
      user,
      selectedStore: mockStore1,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setSelectedStore: vi.fn(),
    };
  }

  it('renders circuits list and displays "Novo Circuito" only for ADMIN', async () => {
    vi.spyOn(api, 'listarCircuitos').mockResolvedValue(mockCircuits);

    // Render as ADMIN
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/app/circuitos']}>
            <Routes>
              <Route path="/app/circuitos" element={<CircuitsListPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Circuito Primavera 2026')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /novo circuito/i })).toBeInTheDocument();
    });

    unmount();

    // Render as LOJISTA
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={createMockAuth(mockLojistaUser)}>
          <MemoryRouter initialEntries={['/app/circuitos']}>
            <Routes>
              <Route path="/app/circuitos" element={<CircuitsListPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Circuito Primavera 2026')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /novo circuito/i })).not.toBeInTheDocument();
    });
  });

  it('validates circuit creation requiring exactly 3 distinct stores', async () => {
    vi.spyOn(api, 'listarCircuitos').mockResolvedValue(mockCircuits);
    vi.spyOn(api, 'listarLojas').mockResolvedValue([mockStore1, mockStore2, mockStore3]);
    const criarSpy = vi.spyOn(api, 'criarCircuito').mockResolvedValue({
      id: 'circ-new',
      name: 'Novo Circuito',
      reward_description: 'Brinde exclusivo',
      status: 'ACTIVE',
      start_date: '2026-12-01',
      end_date: '2026-12-31',
      stores: [],
      is_simulated: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/app/circuitos']}>
            <Routes>
              <Route path="/app/circuitos" element={<CircuitsListPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /novo circuito/i })).toBeInTheDocument();
    });

    // Open creation modal
    fireEvent.click(screen.getByRole('button', { name: /novo circuito/i }));
    expect(screen.getByText('Criar Novo Circuito Cooperativo')).toBeInTheDocument();

    // Wait for stores dropdown options to populate
    await waitFor(() => {
      expect(screen.getAllByText(/loja alpha \(moda feminina\)/i).length).toBeGreaterThanOrEqual(1);
    });

    // Fill basic fields
    fireEvent.change(screen.getByLabelText(/nome do circuito/i), {
      target: { value: 'Circuito Teste 3 Lojas' },
    });
    fireEvent.change(screen.getByLabelText(/recompensa \/ benefício/i), {
      target: { value: 'Desconto de 20%' },
    });

    // Submit without selecting 3 stores
    fireEvent.click(screen.getByRole('button', { name: /^criar circuito$/i }));
    expect(screen.getByText(/o circuito cooperativo requer a seleção de exatamente 3 lojas/i)).toBeInTheDocument();
    expect(criarSpy).not.toHaveBeenCalled();

    // Select duplicate stores (Store 1 and Store 1 and Store 2)
    fireEvent.change(screen.getByLabelText(/loja 1/i), { target: { value: 'store-1' } });
    fireEvent.change(screen.getByLabelText(/loja 2/i), { target: { value: 'store-1' } });
    fireEvent.change(screen.getByLabelText(/loja 3/i), { target: { value: 'store-2' } });

    fireEvent.click(screen.getByRole('button', { name: /^criar circuito$/i }));
    expect(screen.getByText(/as 3 lojas participantes devem ser distintas entre si/i)).toBeInTheDocument();
    expect(criarSpy).not.toHaveBeenCalled();

    // Select 3 distinct stores
    fireEvent.change(screen.getByLabelText(/loja 2/i), { target: { value: 'store-2' } });
    fireEvent.change(screen.getByLabelText(/loja 3/i), { target: { value: 'store-3' } });

    fireEvent.click(screen.getByRole('button', { name: /^criar circuito$/i }));

    await waitFor(() => {
      expect(criarSpy).toHaveBeenCalledTimes(1);
      expect(criarSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Circuito Teste 3 Lojas',
          reward_description: 'Desconto de 20%',
          store_ids: ['store-1', 'store-2', 'store-3'],
        })
      );
    });
  });

  it('renders CircuitDetailPage with 3-store route, synthetic stats, and admin lifecycle controls', async () => {
    vi.spyOn(api, 'obterCircuito').mockResolvedValue(mockCircuits[0]);
    vi.spyOn(api, 'obterCircuitoStats').mockResolvedValue({
      circuit_id: 'circ-1',
      completed_count: 58,
    });
    const statusSpy = vi.spyOn(api, 'alterarStatusCircuito').mockResolvedValue({
      ...mockCircuits[0],
      status: 'FINISHED',
    });

    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/app/circuitos/circ-1']}>
            <Routes>
              <Route path="/app/circuitos/:circuitId" element={<CircuitDetailPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Circuito Primavera 2026')).toBeInTheDocument();
      // Verify 3 stores in route
      expect(screen.getByText('Loja Alpha')).toBeInTheDocument();
      expect(screen.getByText('Loja Beta')).toBeInTheDocument();
      expect(screen.getByText('Loja Gamma')).toBeInTheDocument();

      // Verify synthetic completed stats
      expect(screen.getByText('58')).toBeInTheDocument();
      expect(screen.getByText(/resgates registrados/i)).toBeInTheDocument();

      // Verify simulation disclaimer
      expect(screen.getByText(/módulo de demonstração sintética \(demo\)/i)).toBeInTheDocument();

      // Verify admin lifecycle controls
      expect(screen.getByRole('button', { name: /concluir circuito/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar circuito/i })).toBeInTheDocument();
    });

    // Click Concluir Circuito
    fireEvent.click(screen.getByRole('button', { name: /concluir circuito/i }));
    await waitFor(() => {
      expect(statusSpy).toHaveBeenCalledWith('circ-1', 'FINISHED');
    });
  });
});
