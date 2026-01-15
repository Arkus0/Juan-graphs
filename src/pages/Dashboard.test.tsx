import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';
import { useStore } from '../store/useStore';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../store/useStore');
// Mock useQuery
vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn().mockReturnValue({ isLoading: false, data: [] })
    };
});

// Mock ChartViewer
vi.mock('../components/ChartViewer', () => ({
  default: () => <div>Chart</div>
}));

describe('Dashboard', () => {
  it('renders empty state', () => {
    (useStore as any).mockReturnValue({ favorites: [] });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Aún no tienes favoritos')).toBeInTheDocument();
  });

  it('renders favorites', () => {
    (useStore as any).mockReturnValue({
      favorites: [
        { id: '1', operacionId: 1, tablaId: 1, nombreTabla: 'Tabla Fav' }
      ]
    });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Tabla Fav')).toBeInTheDocument();
  });
});
