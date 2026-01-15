import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOperaciones } from '../hooks/useIne';
import { Search, Loader2, FileText, Filter, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { Helmet } from 'react-helmet-async';
import { categorizeOperation, type Category } from '../utils/categoryUtils';

export default function InePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: operaciones, isLoading, error } = useOperaciones();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearch(query);
    }
  }, [searchParams]);

  const categories: Category[] = ['Demografía', 'Economía', 'Mercado Laboral', 'Turismo', 'Industria y Servicios', 'Sociedad', 'Otros'];

  // Memoize Fuse instance to avoid recreating it on every render
  const fuse = useMemo(() => {
    if (!operaciones) return null;
    return new Fuse(operaciones, {
      keys: ['Nombre', 'Codigo'],
      threshold: 0.2, // More precise search (was 0.3)
      ignoreLocation: true, // Better matching across the entire string
      minMatchCharLength: 2, // At least 2 characters must match
    });
  }, [operaciones]);

  const filteredOperaciones = useMemo(() => {
    if (!operaciones) return [];

    let result = operaciones;

    // Filter by search - using memoized fuse instance
    if (search && fuse) {
      result = fuse.search(search).map(r => r.item);
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter(op => selectedCategories.includes(categorizeOperation(op)));
    }

    return result;
  }, [operaciones, search, selectedCategories, fuse]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error al cargar operaciones.
      </div>
    );
  }

  // Hide the search input if a search query is already active from the URL (Home page)
  const isSearchActive = !!searchParams.get('q');

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Helmet>
        <title>Operaciones INE - DatosEspaña</title>
        <meta name="description" content="Busca y explora operaciones estadísticas del Instituto Nacional de Estadística." />
      </Helmet>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filtros
              </h2>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categorías</p>
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${selectedCategories.includes(cat) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operaciones Estadísticas</h1>
            <button
              className="md:hidden p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {isFilterOpen ? <X className="w-5 h-5 text-gray-600" /> : <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>
          </div>

          {!isSearchActive && (
            <div className="relative mb-8">
                <input
                type="text"
                placeholder="Buscar operación (ej. IPC, EPA...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          )}

          {isSearchActive && (
              <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                      Resultados para: <span className="font-semibold text-gray-900 dark:text-white">"{search}"</span>
                  </p>
                  <button
                      onClick={() => {
                          setSearch('');
                          navigate('/ine');
                      }}
                      className="text-sm text-blue-600 hover:underline"
                  >
                      Limpiar búsqueda
                  </button>
              </div>
          )}

          <div className="grid gap-4">
            {filteredOperaciones.map((op) => (
              <div
                key={op.Id}
                onClick={() => navigate(`/ine/operacion/${op.Id}`)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">{op.Nombre}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-medium">
                        {op.Codigo}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {categorizeOperation(op)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredOperaciones.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron operaciones.</p>
                <p className="text-sm text-gray-400 mt-1">Prueba a ajustar los filtros o la búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
