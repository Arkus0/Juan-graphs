import { useParams } from 'react-router-dom';
import { useTablasOperacion, useDatosTabla } from '../hooks/useIne';
import { useState } from 'react';
import ChartViewer from '../components/ChartViewer';
import { Loader2, Table as TableIcon, Star } from 'lucide-react';
import type { ITabla } from '../types/ine';
import { useStore } from '../store/useStore';

export default function OperacionDetalle() {
  const { id } = useParams();
  const operacionId = id ? parseInt(id) : null;
  const { data: tablas, isLoading: loadingTablas } = useTablasOperacion(operacionId);
  const [selectedTabla, setSelectedTabla] = useState<ITabla | null>(null);
  const { addFavorite, removeFavorite, isFavorite } = useStore();

  // Hook for data, enabled only when a table is selected
  const { data: series, isLoading: loadingDatos } = useDatosTabla(selectedTabla?.Id || null);

  if (!operacionId) return <div>ID inválido</div>;
  if (loadingTablas) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const handleToggleFavorite = () => {
    if (!selectedTabla) return;
    const favId = `op-${operacionId}-tab-${selectedTabla.Id}`;
    if (isFavorite(favId)) {
      removeFavorite(favId);
    } else {
      addFavorite({
        id: favId,
        operacionId,
        tablaId: selectedTabla.Id,
        nombreTabla: selectedTabla.Nombre,
      });
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Tablas disponibles</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List of Tables */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 max-h-[80vh] overflow-y-auto">
          {tablas?.map(tabla => (
            <div
              key={tabla.Id}
              onClick={() => setSelectedTabla(tabla)}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTabla?.Id === tabla.Id
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start gap-2">
                <TableIcon className="w-4 h-4 mt-1 text-gray-500 dark:text-gray-400" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-3">{tabla.Nombre}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content (Chart) */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[500px]">
          {!selectedTabla ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Selecciona una tabla para ver los datos
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">{selectedTabla.Nombre}</h2>
                <button
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle favorite"
                >
                  <Star
                    className={`w-6 h-6 ${isFavorite(`op-${operacionId}-tab-${selectedTabla.Id}`) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                  />
                </button>
              </div>
              {loadingDatos ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : (
                <ChartViewer series={series || []} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
