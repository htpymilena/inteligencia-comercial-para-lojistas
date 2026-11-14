import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DailyMetric } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { formatCurrency, formatConversionRate, formatNumber } from './KpiCards';
import { Table, Eye, EyeOff } from 'lucide-react';

export interface MetricsTrendChartProps {
  data: DailyMetric[];
  isSimulated?: boolean;
}

export function MetricsTrendChart({ data, isSimulated = true }: MetricsTrendChartProps) {
  const [showTable, setShowTable] = useState(false);

  const formattedData = data.map((d) => {
    // Format YYYY-MM-DD to DD/MM
    const parts = d.date.split('-');
    const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date;
    return {
      ...d,
      displayDate: label,
    };
  });

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Evolução Diária de Fluxo e Vendas</CardTitle>
            {isSimulated && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                DEMO
              </span>
            )}
          </div>
          <CardDescription>
            Série temporal de visitantes (linhas) e vendas concluídas (barras) no intervalo selecionado.
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowTable(!showTable)}
          aria-expanded={showTable}
          aria-controls="metrics-summary-table"
        >
          <Table className="h-4 w-4 mr-1.5" />
          {showTable ? 'Ver Gráfico' : 'Tabela Acessível'}
        </Button>
      </CardHeader>

      <CardContent>
        {!showTable ? (
          <div className="h-72 w-full pt-4" aria-label="Gráfico de fluxo e vendas diárias">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  fontSize={11}
                  stroke="#64748b"
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="#64748b"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="#64748b"
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === 'visitors' ? 'Visitantes' : 'Vendas',
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'visitors' ? 'Visitantes (linha)' : 'Vendas (barra)')}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="sales"
                  name="sales"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="visitors"
                  name="visitors"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0284c7' }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div id="metrics-summary-table" className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <caption className="sr-only">Tabela detalhada de métricas diárias de visitantes e vendas</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <th scope="col" className="py-2.5 px-3">Data</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Visitantes</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Interações</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Vendas</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Conversão</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.date} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">{row.date}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(row.visitors)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(row.interactions)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(row.sales)}</td>
                    <td className="py-2 px-3 text-right">{formatConversionRate(row.conversion_rate)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
