import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChartViewer from './ChartViewer';
import { useStore } from '../store/useStore';

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>
}));

// Mock useStore
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}));

describe('ChartViewer', () => {
  it('renders empty message when no series', () => {
    (useStore as any).mockReturnValue({ theme: 'light' });
    render(<ChartViewer series={[]} />);
    expect(screen.getByText('No hay datos para mostrar')).toBeInTheDocument();
  });

  it('renders chart when series provided', () => {
    (useStore as any).mockReturnValue({ theme: 'light' });
    const mockSeries = [
      {
        Id: 1,
        Nombre: 'Serie 1',
        Data: [
            { Fecha: 1704067200000, FK_Periodo: 1, FK_Estado: 1, Valor: 10 }, // 2024-01-01
            { Fecha: 1706745600000, FK_Periodo: 2, FK_Estado: 1, Valor: 15 }  // 2024-02-01
        ]
      }
    ];
    render(<ChartViewer series={mockSeries} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
