import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, CameraSnapshot, ApiClientError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Skeleton } from '@/components/ui';
import { Video, RefreshCw, Users, ArrowDownRight, ArrowUpRight, ShieldCheck, AlertCircle, EyeOff } from 'lucide-react';

export function MonitoringPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const {
    data: cameras,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<CameraSnapshot[], ApiClientError>({
    queryKey: ['demo-cameras', storeId],
    queryFn: () => api.listarCamerasDemo(storeId!),
    enabled: Boolean(storeId),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monitoramento Demonstrativo</h1>
            <Badge variant="demo">SIMULAÇÃO SINTÉTICA</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Painel ilustrativo de contagem de fluxo em pontos de interesse da loja.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          isLoading={isFetching}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* Privacy and Methodology Disclaimer */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">Privacidade por Design e Diretrizes Éticas (MVP)</p>
          <p className="text-blue-800 leading-relaxed">
            As imagens e contagens exibidas abaixo são representações esquemáticas geradas sinteticamente. O sistema NEXO 2031
            não opera câmeras físicas reais, não processa biometria facial, não armazena fotos ou vídeos de visitantes e não realiza
            rastreamento de identidade pessoal.
          </p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" data-testid="monitoring-loading">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="space-y-4 p-6">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          data-testid="monitoring-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro ao carregar câmeras demonstrativas</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {error?.message || 'Falha ao buscar dados de monitoramento.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Camera Cards */}
      {!isLoading && !isError && cameras && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cameras.map((camera) => (
            <Card key={camera.camera_id} className="overflow-hidden border-slate-200 flex flex-col justify-between">
              <div>
                {/* Visual Placeholder Illustration (No Webcam/Video stream!) */}
                <div className="relative h-44 w-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-4 border-b border-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/90 text-slate-300 mb-2">
                    <Video className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-300 text-center">
                    Simulação Esquemática — {camera.name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Transmissão de vídeo real não utilizada
                  </span>

                  {/* Badges on overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SINTÉTICO ATIVO
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge variant="demo" className="text-[10px] py-0 px-1.5">
                      DEMO
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base text-slate-900">{camera.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Zona monitorada: <span className="font-semibold text-slate-700">{camera.zone}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <span className="block text-[10px] text-slate-500 font-medium uppercase">Presentes</span>
                      <span className="text-base font-bold text-slate-900">{camera.current_count}</span>
                    </div>

                    <div className="rounded-lg bg-emerald-50/70 p-2.5 border border-emerald-100">
                      <span className="block text-[10px] text-emerald-700 font-medium uppercase">Entradas</span>
                      <span className="text-base font-bold text-emerald-800 flex items-center justify-center gap-0.5">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        {camera.entries_count}
                      </span>
                    </div>

                    <div className="rounded-lg bg-amber-50/70 p-2.5 border border-amber-100">
                      <span className="block text-[10px] text-amber-700 font-medium uppercase">Saídas</span>
                      <span className="text-base font-bold text-amber-800 flex items-center justify-center gap-0.5">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {camera.exits_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 justify-between">
                <span>Origem: Dados Sintéticos</span>
                <span>{new Date(camera.timestamp).toLocaleTimeString('pt-BR')}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
