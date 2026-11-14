import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { api, StoreItem, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Skeleton } from '@/components/ui';
import { Store, ArrowRight, LogOut, RefreshCw, AlertCircle } from 'lucide-react';

export function StoreSelectionPage() {
  const navigate = useNavigate();
  const { user, logout, setSelectedStore } = useAuth();

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStores() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listarLojas();
      setStores(data);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Não foi possível carregar a lista de lojas autorizadas.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  function handleSelectStore(store: StoreItem) {
    setSelectedStore(store);
    navigate(`/app/lojas/${store.id}/painel`);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top bar with welcome message and logout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
                N
              </span>
              <h1 className="text-xl font-bold text-slate-900">NEXO 2031</h1>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Olá, <span className="font-semibold text-slate-900">{user?.full_name || user?.email}</span> (
              {user?.role === 'ADMIN' ? 'Administrador' : 'Lojista'})
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 self-start sm:self-auto">
            <LogOut className="h-4 w-4 mr-2 text-slate-500" />
            Sair
          </Button>
        </div>

        {/* Section Title */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Selecione uma loja para gerenciar</h2>
          <p className="text-sm text-slate-500">
            Abaixo estão as lojas associadas à sua conta. Os dados apresentados são para fins de demonstração.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">Falha ao carregar lojas</p>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={loadStores}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && stores.length === 0 && (
          <Card className="p-8 text-center">
            <Store className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">Nenhuma loja vinculada</h3>
            <p className="mt-1 text-sm text-slate-500">
              Sua conta ainda não possui permissão de acesso a nenhuma loja cadastrada.
            </p>
          </Card>
        )}

        {/* Store Cards Grid */}
        {!isLoading && !error && stores.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all border-slate-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-slate-900">{store.name}</CardTitle>
                    {store.is_demo && <Badge variant="demo">DEMO</Badge>}
                  </div>
                  <CardDescription className="text-xs">
                    Segmento: <span className="font-medium text-slate-700">{store.segment}</span>
                    {store.floor && <span> • Piso: {store.floor}</span>}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-2">
                  <Button
                    onClick={() => handleSelectStore(store)}
                    className="w-full justify-between group"
                    variant="primary"
                  >
                    <span>Abrir painel</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
