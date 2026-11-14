import React, { useState } from 'react';
import { HeatmapCell } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { Flame, Info } from 'lucide-react';

export interface HeatmapGridProps {
  cells: HeatmapCell[];
  gridWidth?: number;
  gridHeight?: number;
  isSimulated?: boolean;
}

export function getIntensityCategory(intensity: number): { label: string; bgClass: string; textClass: string } {
  if (intensity < 0.2) {
    return { label: 'Muito Baixa', bgClass: 'bg-slate-100 hover:bg-slate-200', textClass: 'text-slate-500' };
  }
  if (intensity < 0.5) {
    return { label: 'Baixa', bgClass: 'bg-blue-200 hover:bg-blue-300', textClass: 'text-blue-900' };
  }
  if (intensity < 0.75) {
    return { label: 'Média', bgClass: 'bg-amber-300 hover:bg-amber-400', textClass: 'text-amber-950 font-medium' };
  }
  return { label: 'Alta', bgClass: 'bg-rose-500 hover:bg-rose-600', textClass: 'text-white font-bold' };
}

export function HeatmapGrid({
  cells,
  gridWidth = 10,
  gridHeight = 8,
  isSimulated = true,
}: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Build coordinate lookup map
  const cellMap = new Map<string, HeatmapCell>();
  cells.forEach((cell) => {
    cellMap.set(`${cell.x},${cell.y}`, cell);
  });

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <CardTitle>Planta Esquemática e Densidade de Ocupação</CardTitle>
            {isSimulated && <Badge variant="demo">DEMO</Badge>}
          </div>
          <CardDescription>
            Grid 10×8 representando zonas de permanência e circulação de clientes.
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">
          <span className="font-semibold text-slate-700">Densidade:</span>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-slate-200" aria-hidden="true" />
            <span>Nula</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-blue-200" aria-hidden="true" />
            <span>Baixa</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-300" aria-hidden="true" />
            <span>Média</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-rose-500" aria-hidden="true" />
            <span>Alta</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* The 10x8 Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 min-w-[540px] max-w-3xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
            }}
            role="grid"
            aria-label="Mapa de calor esquemático da loja"
          >
            {Array.from({ length: gridHeight }).map((_, y) =>
              Array.from({ length: gridWidth }).map((_, x) => {
                const cell = cellMap.get(`${x},${y}`) || {
                  x,
                  y,
                  intensity: 0,
                  zone_name: 'Circulação Geral',
                };
                const { label, bgClass, textClass } = getIntensityCategory(cell.intensity);

                return (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onFocus={() => setHoveredCell(cell)}
                    onBlur={() => setHoveredCell(null)}
                    className={`h-11 rounded-md flex flex-col items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white ${bgClass} ${textClass}`}
                    aria-label={`Célula ${x},${y} - Zona ${cell.zone_name}: Intensidade ${label} (${(cell.intensity * 100).toFixed(0)}%)`}
                  >
                    <span className="text-[10px] uppercase tracking-tighter truncate max-w-full px-1">
                      {cell.zone_name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] opacity-80">
                      {(cell.intensity * 100).toFixed(0)}%
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Hover / Focused Cell Info Box */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs min-h-[46px]">
          {hoveredCell ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-800">
                Zona: <span className="text-brand-700">{hoveredCell.zone_name}</span>
              </span>
              <span className="text-slate-600">
                Coordenadas: ({hoveredCell.x}, {hoveredCell.y})
              </span>
              <span className="text-slate-600">
                Densidade: <span className="font-bold">{getIntensityCategory(hoveredCell.intensity).label}</span> (
                {(hoveredCell.intensity * 100).toFixed(0)}%)
              </span>
            </div>
          ) : (
            <span className="text-slate-400 flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              Passe o cursor ou navegue pelas células do grid para inspecionar os detalhes da zona.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
