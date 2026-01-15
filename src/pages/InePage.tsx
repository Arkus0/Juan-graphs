import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOperaciones } from '../hooks/useIne';
import { Search, Loader2, FileText } from 'lucide-react';
import Fuse from 'fuse.js';

export default function InePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: operaciones, isLoading, error } = useOperaciones();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearch(query);
    }
  }, [searchParams]);

  const filteredOperaciones = useMemo(() => {
    if (!operaciones) return [];
    if (!search) return operaciones;

    const fuse = new Fuse(operaciones, {
      keys: ['Nombre', 'Codigo'],
      threshold: 0.3,
    });

    return fuse.search(search).map(result => result.item);
  }, [operaciones, search]);

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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Operaciones Estadísticas</h1>

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

      <div className="grid gap-4">
        {filteredOperaciones.map((op) => (
          <div
            key={op.Id}
            onClick={() => navigate(`/ine/operacion/${op.Id}`)}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{op.Nombre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Código: {op.Codigo}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredOperaciones.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No se encontraron operaciones.</p>
        )}
      </div>
    </div>
  );
}
