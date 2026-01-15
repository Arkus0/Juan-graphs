import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStore } from './store/useStore'
import { HelmetProvider } from 'react-helmet-async'

vi.mock('./store/useStore');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('App', () => {
  it('renders home page with title', () => {
    (useStore as any).mockReturnValue({ theme: 'light', toggleTheme: vi.fn() });

    render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    )
    expect(screen.getAllByText('DatosEspaña')[0]).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar datos...')).toBeInTheDocument()
  })
})
