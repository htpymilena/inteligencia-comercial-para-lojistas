import React, { useState } from 'react';
import { Badge } from '@/components/ui';
import { Menu, Activity, Store, HelpCircle } from 'lucide-react';

export interface HeaderProps {
  storeName?: string;
  storeSegment?: string;
  userEmail?: string;
  userRole?: string;
  isBackendHealthy?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({
  storeName = 'Loja de Demonstração',
  storeSegment = 'Vestuário',
  userEmail,
  userRole = 'LOJISTA',
  isBackendHealthy = true,
  onToggleSidebar,
}: HeaderProps) {
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-brand-600" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900 md:text-base">{storeName}</h1>
            <span className="text-xs text-slate-500">{storeSegment}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Simulation / DEMO Badge with tooltip trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoInfo(!showDemoInfo)}
            className="flex items-center gap-1.5 focus:outline-none"
            aria-label="Informações sobre dados de demonstração"
          >
            <Badge variant="demo" className="cursor-pointer hover:bg-amber-200">
              DEMONSTRAÇÃO
            </Badge>
            <HelpCircle className="h-4 w-4 text-amber-700" />
          </button>

          {showDemoInfo && (
            <div
              className="absolute right-0 top-8 z-50 w-72 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 shadow-lg"
              role="tooltip"
            >
              <p className="font-semibold mb-1">Ambiente de Demonstração (MVP)</p>
              <p>
                Os dados de fluxo, mapas de calor, câmeras e indicadores são gerados sinteticamente
                para fins ilustrativos, sem captura de imagem pessoal ou rastreamento individual.
              </p>
            </div>
          )}
        </div>

        {/* Backend Connectivity Status Indicator */}
        <div
          className="flex items-center gap-1.5 text-xs text-slate-600"
          title={isBackendHealthy ? 'API Conectada' : 'API Desconectada'}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            {isBackendHealthy ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* User Info */}
        {userEmail && (
          <div className="hidden border-l border-slate-200 pl-3 md:flex md:flex-col md:items-end">
            <span className="text-xs font-medium text-slate-800">{userEmail}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{userRole}</span>
          </div>
        )}
      </div>
    </header>
  );
}
