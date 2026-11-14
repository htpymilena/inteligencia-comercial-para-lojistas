import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReportsPage, calculateEqualBaseline, generateReportCsv } from '@/features/reports/ReportsPage';
import { api, ComparativeReportResponse } from '@/lib/api';

describe('ReportsPage (TELA009 Comparative Reports & CSV Export)', () => {
  let queryClient: QueryClient;

  const mockReport: ComparativeReportResponse = {
    store_id: 'store-1',
    period_start: '2026-11-10',
    period_end: '2026-11-12',
    comparison_start: '2026-11-07',
    comparison_end: '2026-11-09',
    is_simulated: true,
    metrics: [
      {
        metric_name: 'Visitantes',
        current_value: '300',
        previous_value: '250',
        absolute_change: '+50',
        percentage_change: 20.0,
      },
      {
        metric_name: 'Taxa de Conversão',
        current_value: '6.67%',
        previous_value: '5.00%',
        absolute_change: '+1.67%',
        percentage_change: null,
        percentage_points_change: 1.67,
      },
      {
        metric_name: 'Faturamento',
        current_value: 'R$ 3.500,00',
        previous_value: '0',
        absolute_change: '+R$ 3.500,00',
        percentage_change: null, // Base zero test case
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  function renderPage() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/lojas/store-1/relatorios']}>
          <Routes>
            <Route path="/app/lojas/:storeId/relatorios" element={<ReportsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('calculates equal baseline comparison interval correctly (TEST-METRIC-03)', () => {
    const baseline = calculateEqualBaseline('2026-11-10', '2026-11-12');
    expect(baseline.start).toBe('2026-11-07');
    expect(baseline.end).toBe('2026-11-09');
  });

  it('renders comparison cards with percentage and percentage-point variations', async () => {
    vi.spyOn(api, 'obterRelatorioComparativo').mockResolvedValue(mockReport);
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Visitantes').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('300').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('+20.00%').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Taxa de Conversão').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('+1.67 p.p.').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('outputs em dash (—) when baseline is zero and percentage change cannot be computed (TEST-METRIC-02)', async () => {
    vi.spyOn(api, 'obterRelatorioComparativo').mockResolvedValue(mockReport);
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Faturamento').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('generates CSV string and triggers client-side download', async () => {
    vi.spyOn(api, 'obterRelatorioComparativo').mockResolvedValue(mockReport);

    const csv = generateReportCsv(mockReport);
    expect(csv).toContain('Métrica;Período Atual;Período Anterior');
    expect(csv).toContain('"Visitantes";"300";"250"');
    expect(csv).toContain('"Taxa de Conversão";"6.67%";"5.00%"');

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument();
    });

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
