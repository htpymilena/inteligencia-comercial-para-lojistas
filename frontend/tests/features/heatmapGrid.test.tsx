import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeatmapGrid } from '@/features/heatmap/HeatmapGrid';
import { HeatmapCell } from '@/lib/api';

describe('HeatmapGrid (TELA005 10x8 Grid)', () => {
  const mockCells: HeatmapCell[] = [
    { x: 0, y: 0, intensity: 0.1, zone_name: 'Entrada Principal' },
    { x: 5, y: 4, intensity: 0.85, zone_name: 'Vitrine Frontal' },
  ];

  it('renders 10x8 grid totaling 80 cells', () => {
    render(<HeatmapGrid cells={mockCells} gridWidth={10} gridHeight={8} />);

    const grid = screen.getByRole('grid', { name: /mapa de calor esquemático da loja/i });
    expect(grid).toBeInTheDocument();

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(80);
  });

  it('displays cell information when hovered or focused', () => {
    render(<HeatmapGrid cells={mockCells} gridWidth={10} gridHeight={8} />);

    // Cell at index corresponding to (5, 4): row 4 * 10 + 5 = index 45
    const highIntensityCell = screen.getByLabelText(/Célula 5,4 - Zona Vitrine Frontal: Intensidade Alta/i);
    expect(highIntensityCell).toBeInTheDocument();

    fireEvent.focus(highIntensityCell);

    expect(screen.getByText('Vitrine Frontal')).toBeInTheDocument();
    expect(screen.getAllByText('Alta').length).toBeGreaterThanOrEqual(1);
  });

  it('renders accessible density legend', () => {
    render(<HeatmapGrid cells={mockCells} />);

    expect(screen.getByText('Densidade:')).toBeInTheDocument();
    expect(screen.getByText('Baixa')).toBeInTheDocument();
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });
});
