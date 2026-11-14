import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Users, MousePointerClick, ShoppingBag, Percent, DollarSign } from 'lucide-react';

export interface KpiCardsProps {
  totalVisitors: number;
  totalInteractions: number;
  totalSales: number;
  conversionRate: number | null;
  totalRevenue: string; // Decimal string e.g. "12450.00"
  isSimulated?: boolean;
}

export function formatCurrency(valueStr: string): string {
  const num = parseFloat(valueStr);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

export function formatConversionRate(rate: number | null): string {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '—';
  }
  return `${rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function KpiCards({
  totalVisitors,
  totalInteractions,
  totalSales,
  conversionRate,
  totalRevenue,
  isSimulated = true,
}: KpiCardsProps) {
  const kpis = [
    {
      title: 'Visitantes',
      value: formatNumber(totalVisitors),
      description: 'Pessoas identificadas no período',
      icon: Users,
      iconColor: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Interações',
      value: formatNumber(totalInteractions),
      description: 'Abordagens e paradas nas zonas',
      icon: MousePointerClick,
      iconColor: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Vendas Realizadas',
      value: formatNumber(totalSales),
      description: 'Cupons / transações concluídas',
      icon: ShoppingBag,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Taxa de Conversão',
      value: formatConversionRate(conversionRate),
      description: 'Vendas sobre total de visitantes',
      icon: Percent,
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Faturamento Bruto',
      value: formatCurrency(totalRevenue),
      description: 'Receita total gerada no período',
      icon: DollarSign,
      iconColor: 'text-teal-600 bg-teal-50',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-600 uppercase tracking-wider">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.iconColor}`}>
              <kpi.icon className="h-4 w-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{kpi.value}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-slate-500">{kpi.description}</p>
              {isSimulated && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                  DEMO
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
