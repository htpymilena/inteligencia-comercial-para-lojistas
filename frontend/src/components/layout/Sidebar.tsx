import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Flame,
  Lightbulb,
  FlaskConical,
  BarChart3,
  GitFork,
  Store,
  LogOut,
  X,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ isOpen = false, onClose, onLogout }: SidebarProps) {
  const { storeId } = useParams<{ storeId?: string }>();

  let selectedStore = null;
  try {
    const auth = useAuth();
    selectedStore = auth.selectedStore;
  } catch {
    // Graceful fallback when rendered outside AuthProvider in isolated tests
  }

  const validStoreId = storeId && storeId !== 'demo-store' ? storeId : null;
  const activeStoreId = validStoreId || selectedStore?.id || null;

  const storeNavItems = [
    {
      to: activeStoreId ? `/app/lojas/${activeStoreId}/painel` : '/app/lojas',
      label: 'Painel Principal',
      icon: LayoutDashboard,
    },
    {
      to: activeStoreId ? `/app/lojas/${activeStoreId}/monitoramento` : '/app/lojas',
      label: 'Monitoramento',
      icon: Video,
    },
    {
      to: activeStoreId ? `/app/lojas/${activeStoreId}/mapa` : '/app/lojas',
      label: 'Mapa de Calor',
      icon: Flame,
    },
    {
      to: activeStoreId ? `/app/lojas/${activeStoreId}/recomendacoes` : '/app/lojas',
      label: 'Recomendações',
      icon: Lightbulb,
    },
    {
      to: activeStoreId ? `/app/lojas/${activeStoreId}/experimentos` : '/app/lojas',
      label: 'Experimentos',
      icon: FlaskConical,
    },
    {
      to: activeStoreId ? `/app/lojas/${activeStoreId}/relatorios` : '/app/lojas',
      label: 'Relatórios',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-surface-border bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-surface-border px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-base shadow-sm">
              N
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">NEXO 2031</span>
              <span className="block text-[10px] text-slate-500 font-medium -mt-1">COMERCIAL</span>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden focus:outline-none"
              aria-label="Fechar menu de navegação"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Active Store Indicator Card in Sidebar */}
        <div className="px-3 pt-3">
          {activeStoreId ? (
            <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">Loja Selecionada</span>
                <NavLink
                  to="/app/lojas"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 underline"
                  title="Trocar de loja"
                >
                  <ArrowRightLeft className="h-2.5 w-2.5" />
                  Trocar
                </NavLink>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-900 truncate">
                {selectedStore?.name || 'Loja Ativa'}
              </p>
              {selectedStore?.segment && (
                <p className="text-[10px] text-slate-500 truncate">{selectedStore.segment}</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-2.5">
              <div className="flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Loja Pendente</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-800 leading-snug">
                Selecione uma loja primeiro para liberar os dados das abas.
              </p>
              <NavLink
                to="/app/lojas"
                onClick={onClose}
                className="mt-2 block w-full rounded bg-brand-600 px-2 py-1 text-center text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
              >
                Selecionar Loja Agora
              </NavLink>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Navegação Principal">
          <div className="pb-1 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Gestão da Loja
          </div>

          {storeNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive && activeStoreId
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )
              }
              title={!activeStoreId ? 'Selecione uma loja primeiro' : item.label}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </div>
              {!activeStoreId && (
                <span className="text-[10px] font-normal text-amber-600 bg-amber-100/70 px-1.5 py-0.5 rounded">
                  escolher
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-3 pb-1 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Cooperação Comercial
          </div>

          <NavLink
            to="/app/circuitos"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <GitFork className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Circuitos 3 Lojas</span>
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-surface-border p-3 space-y-1">
          <NavLink
            to="/app/lojas"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Store className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span>Ver Todas as Lojas</span>
          </NavLink>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
