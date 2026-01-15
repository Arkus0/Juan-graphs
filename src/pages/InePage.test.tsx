import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InePage from './InePage';
import { useOperaciones } from '../hooks/useIne';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock the hook
vi.mock('../hooks/useIne');

describe('InePage', () => {
  it('renders list of operations', () => {
    (useOperaciones as any).mockReturnValue({
      isLoading: false,
      data: [
        { Id: 1, Nombre: 'IPC', Codigo: '100' },
        { Id: 2, Nombre: 'EPA', Codigo: '200' }
      ],
      error: null
    });
    render(
      <HelmetProvider>
        <MemoryRouter>
            <InePage />
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByText('IPC')).toBeInTheDocument();
    expect(screen.getByText('EPA')).toBeInTheDocument();
  });

  it('filters operations', () => {
    (useOperaciones as any).mockReturnValue({
      isLoading: false,
      data: [
        { Id: 1, Nombre: 'IPC', Codigo: '100' },
        { Id: 2, Nombre: 'EPA', Codigo: '200' }
      ],
      error: null
    });
    render(
      <HelmetProvider>
        <MemoryRouter>
            <InePage />
        </MemoryRouter>
      </HelmetProvider>
    );
    const input = screen.getByPlaceholderText('Buscar operación (ej. IPC, EPA...)');
    fireEvent.change(input, { target: { value: 'IPC' } });

    expect(screen.getByText('IPC')).toBeInTheDocument();
  });
});
