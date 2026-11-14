import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KpiCards, formatConversionRate, formatCurrency } from '@/features/dashboard/KpiCards';

describe('KpiCards (TELA003 KPIs)', () => {
  it('renders all retail indicators correctly with values', () => {
    render(
      <KpiCards
        totalVisitors={1240}
        totalInteractions={580}
        totalSales={82}
        conversionRate={6.61}
        totalRevenue="15890.50"
        isSimulated={true}
      />
    );

    expect(screen.getByText('Visitantes')).toBeInTheDocument();
    expect(screen.getByText('1.240')).toBeInTheDocument();
    expect(screen.getByText('580')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('6,61%')).toBeInTheDocument();
    expect(screen.getByText(/15\.890,50/)).toBeInTheDocument();
    expect(screen.getAllByText('DEMO')).toHaveLength(5);
  });

  it('outputs an em dash (—) when conversionRate is null (TEST-METRIC-02 base zero)', () => {
    expect(formatConversionRate(null)).toBe('—');
    expect(formatConversionRate(NaN)).toBe('—');

    render(
      <KpiCards
        totalVisitors={0}
        totalInteractions={0}
        totalSales={0}
        conversionRate={null}
        totalRevenue="0.00"
        isSimulated={true}
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('NaN%')).not.toBeInTheDocument();
    expect(screen.queryByText('Infinity%')).not.toBeInTheDocument();
  });

  it('formats monetary revenue values using pt-BR decimal rules', () => {
    expect(formatCurrency('1250.00')).toContain('1.250,00');
    expect(formatCurrency('0.30')).toContain('0,30');
  });
});
