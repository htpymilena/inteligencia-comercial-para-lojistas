import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { ForbiddenPage } from '@/features/auth/ForbiddenPage';
import { StoreSelectionPage } from '@/features/stores/StoreSelectionPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MonitoringPage } from '@/features/monitoring/MonitoringPage';
import { HeatmapPage } from '@/features/heatmap/HeatmapPage';
import { RecommendationsPage } from '@/features/recommendations/RecommendationsPage';
import { ExperimentsListPage } from '@/features/experiments/ExperimentsListPage';
import { ExperimentDetailPage } from '@/features/experiments/ExperimentDetailPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { CircuitsListPage } from '@/features/circuits/CircuitsListPage';
import { CircuitDetailPage } from '@/features/circuits/CircuitDetailPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppLayoutWrapper() {
  const { user, selectedStore, logout } = useAuth();

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.verificarSaude(),
    refetchInterval: 30000,
  });

  return (
    <AppLayout
      storeName={selectedStore?.name}
      storeSegment={selectedStore?.segment}
      userEmail={user?.email}
      userRole={user?.role}
      isBackendHealthy={health?.status === 'ok'}
      onLogout={logout}
    />
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Protected Routes inside AppLayout Shell */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayoutWrapper />
                </ProtectedRoute>
              }
            >
              {/* Store Selection */}
              <Route path="lojas" element={<StoreSelectionPage />} />

              {/* Store Feature Routes */}
              <Route path="lojas/:storeId/painel" element={<DashboardPage />} />
              <Route path="lojas/:storeId/monitoramento" element={<MonitoringPage />} />
              <Route path="lojas/:storeId/mapa" element={<HeatmapPage />} />
              <Route path="lojas/:storeId/recomendacoes" element={<RecommendationsPage />} />
              <Route path="lojas/:storeId/experimentos" element={<ExperimentsListPage />} />
              <Route path="lojas/:storeId/experimentos/:experimentId" element={<ExperimentDetailPage />} />
              <Route path="lojas/:storeId/relatorios" element={<ReportsPage />} />

              {/* Circuits Routes */}
              <Route path="circuitos" element={<CircuitsListPage />} />
              <Route path="circuitos/:circuitId" element={<CircuitDetailPage />} />

              {/* Fallback inside app */}
              <Route index element={<Navigate to="/app/lojas" replace />} />
            </Route>

            {/* Root and Unknown Routes */}
            <Route path="/" element={<Navigate to="/app/lojas" replace />} />
            <Route path="*" element={<Navigate to="/app/lojas" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
