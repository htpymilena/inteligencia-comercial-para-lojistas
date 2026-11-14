import React, { useState, useEffect } from 'react';
import { api, HealthResponse, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkHealth() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.verificarSaude();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Não foi possível conectar ao servidor de API.');
      }
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand-600" />
              <CardTitle>Status de Conectividade da API</CardTitle>
            </div>
            {health?.status === 'ok' ? (
              <Badge variant="success">OPERACIONAL</Badge>
            ) : error ? (
              <Badge variant="danger">DESCONECTADO</Badge>
            ) : (
              <Badge variant="default">VERIFICANDO</Badge>
            )}
          </div>
          <CardDescription>
            Diagnóstico de comunicação entre o aplicativo front-end e o backend FastAPI (/health).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {health ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Backend respondendo com sucesso</span>
              </div>
              <p className="text-xs text-emerald-700">Timestamp: {health.timestamp || new Date().toISOString()}</p>
              {health.version && (
                <p className="text-xs text-emerald-700">Versão da API: {health.version}</p>
              )}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-medium">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <span>Falha na comunicação com a API</span>
              </div>
              <p className="text-xs text-rose-700">{error}</p>
              <p className="text-xs text-slate-500">
                Verifique se o backend está em execução no endereço configurado ou se o contêiner Docker está ativo.
              </p>
            </div>
          ) : null}

          <div className="pt-2">
            <Button
              onClick={checkHealth}
              isLoading={isLoading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Conexão Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
