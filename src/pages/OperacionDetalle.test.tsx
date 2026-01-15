import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OperacionDetalle from './OperacionDetalle';
import { useTablasOperacion, useDatosTabla } from '../hooks/useIne';
import { useStore } from '../store/useStore';

// Mock hooks
vi.mock('../hooks/useIne');
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '123' }),
}));
vi.mock('../store/useStore');

// Mock ChartViewer
vi.mock('../components/ChartViewer', () => ({
  default: () => <div data-testid="chart-viewer">Chart Viewer</div>
}));

describe('OperacionDetalle', () => {
  it('renders tables list', () => {
    (useTablasOperacion as any).mockReturnValue({
      isLoading: false,
      data: [
        { Id: 1, Nombre: 'Tabla 1', Codigo: 'T1' },
        { Id: 2, Nombre: 'Tabla 2', Codigo: 'T2' }
      ]
    });
    (useDatosTabla as any).mockReturnValue({
      isLoading: false,
      data: null
    });
    (useStore as any).mockReturnValue({
      isFavorite: () => false,
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
    });

    render(<OperacionDetalle />);
    expect(screen.getByText('Tabla 1')).toBeInTheDocument();
  });

  it('selects table and shows chart', () => {
    (useTablasOperacion as any).mockReturnValue({
      isLoading: false,
      data: [
        { Id: 1, Nombre: 'Tabla 1', Codigo: 'T1' }
      ]
    });
    (useDatosTabla as any).mockReturnValue({
      isLoading: false,
      data: [{ Id: 10, Nombre: 'Serie 1', Data: [] }]
    });
    (useStore as any).mockReturnValue({
      isFavorite: () => false,
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
    });

    render(<OperacionDetalle />);

    const tableItem = screen.getByText('Tabla 1');
    fireEvent.click(tableItem);

    expect(screen.getByTestId('chart-viewer')).toBeInTheDocument();
  });
});
