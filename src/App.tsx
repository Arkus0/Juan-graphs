import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useStore } from './store/useStore'
import { Moon, Sun, WifiOff, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const InePage = lazy(() => import('./pages/InePage'))
const OperacionDetalle = lazy(() => import('./pages/OperacionDetalle'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-white p-2 text-center text-sm flex justify-center items-center gap-2">
      <WifiOff className="w-4 h-4" />
      Estás offline. Mostrando datos cacheados.
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">DatosEspaña</Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4">
              <Link to="/ine" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Operaciones</Link>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Dashboard</Link>
            </nav>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>
      </header>
      <OfflineBanner />
      <main className="flex-grow text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ine" element={<InePage />} />
              <Route path="/ine/operacion/:id" element={<OperacionDetalle />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </BrowserRouter>
  )
}

export default App
