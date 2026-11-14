import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsTrendChart } from '@/features/dashboard/MetricsTrendChart';
import { DailyMetric } from '@/lib/api';

describe('MetricsTrendChart (Daily Trends & Accessible Table)', () => {
  const mockDailyData: DailyMetric[] = [
    {
      date: '2026-11-01',
      visitors: 120,
      interactions: 45,
      sales: 12,
      conversion_rate: 10.0,
      revenue: '1500.00',
    },
    {
      date: '2026-11-02',
      visitors: 150,
      interactions: 60,
      sales: 15,
      conversion_rate: 10.0,
      revenue: '2100.00',
    },
  ];

  it('renders chart card with title and DEMO badge', () => {
    render(<MetricsTrendChart data={mockDailyData} isSimulated={true} />);

    expect(screen.getByText('Evolução Diária de Fluxo e Vendas')).toBeInTheDocument();
    expect(screen.getByText('DEMO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tabela acessível/i })).toBeInTheDocument();
  });

  it('toggles accessible tabular representation on button click', () => {
    render(<MetricsTrendChart data={mockDailyData} />);

    const toggleBtn = screen.getByRole('button', { name: /tabela acessível/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('2026-11-01')).toBeInTheDocument();
    expect(screen.getByText('2026-11-02')).toBeInTheDocument();
    expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/2\.100,00/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ver gráfico/i }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
