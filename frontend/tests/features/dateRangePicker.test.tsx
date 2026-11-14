import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateRangePicker } from '@/features/dashboard/DateRangePicker';

describe('DateRangePicker (Period Filtering)', () => {
  it('calls onApply with selected valid dates', () => {
    const handleApply = vi.fn();
    render(
      <DateRangePicker
        initialStartDate="2026-10-15"
        initialEndDate="2026-11-14"
        onApply={handleApply}
      />
    );

    const applyBtn = screen.getByRole('button', { name: /aplicar período/i });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith('2026-10-15', '2026-11-14');
  });

  it('rejects inverted date intervals (start > end) and shows validation error', () => {
    const handleApply = vi.fn();
    render(
      <DateRangePicker
        initialStartDate="2026-11-20"
        initialEndDate="2026-11-10"
        onApply={handleApply}
      />
    );

    const applyBtn = screen.getByRole('button', { name: /aplicar período/i });
    fireEvent.click(applyBtn);

    expect(handleApply).not.toHaveBeenCalled();
    expect(screen.getByText(/A data de início deve ser anterior ou igual à data de fim/i)).toBeInTheDocument();
  });

  it('applies preset interval on shortcut click', () => {
    const handleApply = vi.fn();
    render(
      <DateRangePicker
        initialStartDate="2026-10-15"
        initialEndDate="2026-11-14"
        onApply={handleApply}
      />
    );

    const preset7Btn = screen.getByRole('button', { name: /últimos 7 dias/i });
    fireEvent.click(preset7Btn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    const [start, end] = handleApply.mock.calls[0];
    expect(start).toBeDefined();
    expect(end).toBeDefined();
    expect(start <= end).toBe(true);
  });
});
