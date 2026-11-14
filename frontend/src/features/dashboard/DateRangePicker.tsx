import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Calendar, AlertCircle } from 'lucide-react';

export interface DateRangePickerProps {
  initialStartDate: string;
  initialEndDate: string;
  onApply: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export function DateRangePicker({
  initialStartDate,
  initialEndDate,
  onApply,
  isLoading = false,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [error, setError] = useState<string | null>(null);

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Selecione as datas de início e fim.');
      return;
    }

    if (startDate > endDate) {
      setError('A data de início deve ser anterior ou igual à data de fim.');
      return;
    }

    onApply(startDate, endDate);
  }

  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    setError(null);
    onApply(startStr, endStr);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-sm space-y-3">
      <form onSubmit={handleApply} className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <Input
            label="Data de início"
            type="date"
            id="period-start"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="flex-1">
          <Input
            label="Data de fim"
            type="date"
            id="period-end"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="shrink-0">
          <Calendar className="h-4 w-4 mr-2" />
          Aplicar período
        </Button>
      </form>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2"
        >
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset shortcuts */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
        <span>Atalhos:</span>
        <button
          type="button"
          onClick={() => applyPreset(7)}
          className="rounded px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Últimos 7 dias
        </button>
        <button
          type="button"
          onClick={() => applyPreset(30)}
          className="rounded px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Últimos 30 dias
        </button>
        <button
          type="button"
          onClick={() => applyPreset(60)}
          className="rounded px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Últimos 60 dias
        </button>
      </div>
    </div>
  );
}
