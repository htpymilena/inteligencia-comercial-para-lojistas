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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ isOpen = false, onClose, onLogout }: SidebarProps) {
  const { storeId } = useParams<{ storeId?: string }>();
  const activeStoreId = storeId || 'demo-store';

  const navItems = [
    {
      to: `/app/lojas/${activeStoreId}/painel`,
      label: 'Painel Principal',
      icon: LayoutDashboard,
    },
    {
      to: `/app/lojas/${activeStoreId}/monitoramento`,
      label: 'Monitoramento',
      icon: Video,
    },
    {
      to: `/app/lojas/${activeStoreId}/mapa`,
      label: 'Mapa de Calor',
      icon: Flame,
    },
    {
      to: `/app/lojas/${activeStoreId}/recomendacoes`,
      label: 'Recomendações',
      icon: Lightbulb,
    },
    {
      to: `/app/lojas/${activeStoreId}/experimentos`,
      label: 'Experimentos',
      icon: FlaskConical,
    },
    {
      to: `/app/lojas/${activeStoreId}/relatorios`,
      label: 'Relatórios',
      icon: BarChart3,
    },
    {
      to: '/app/circuitos',
      label: 'Circuitos 3 Lojas',
      icon: GitFork,
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

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegação Principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-surface-border p-3 space-y-1">
          <NavLink
            to="/app/lojas"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Store className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span>Trocar Loja</span>
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
