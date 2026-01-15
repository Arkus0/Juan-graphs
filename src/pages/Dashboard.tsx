import { useStore, type FavoriteItem } from '../store/useStore';
import { Link } from 'react-router-dom';
import { BarChart2, ArrowRight } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { getDatosTabla } from '../services/ineApi';
import ChartViewer from '../components/ChartViewer';
import { Helmet } from 'react-helmet-async';
import { memo } from 'react';
import type { ISerie } from '../types/ine';

// Skeleton loader component
const ChartSkeleton = () => (
  <div className="h-40 animate-pulse">
    <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
);

// Component to render a single favorite card with data - memoized
const FavoriteCard = memo(({
  item,
  series,
  isLoading
}: {
  item: FavoriteItem;
  series?: ISerie[] | null;
  isLoading: boolean;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 h-12" title={item.nombreTabla}>
              {item.nombreTabla}
            </h3>
            <Link
              to={`/ine/operacion/${item.operacionId}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label={`Ver operación ${item.nombreTabla}`}
            >
                <ArrowRight className="w-5 h-5" />
            </Link>
        </div>

        <div className="h-40">
            {isLoading ? (
                <ChartSkeleton />
            ) : (
                <ChartViewer series={series || []} />
            )}
        </div>
    </div>
  );
});

export default function Dashboard() {
  const { favorites } = useStore();

  // Optimized: Use useQueries to batch all queries instead of N+1 pattern
  const queries = useQueries({
    queries: favorites.map(fav => ({
      queryKey: ['datos', fav.tablaId],
      queryFn: () => getDatosTabla(fav.tablaId, 6), // Last 6 periods for small chart
      staleTime: 1000 * 60 * 60,
      enabled: !!fav.tablaId,
    })),
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Helmet>
        <title>Mi Dashboard - DatosEspaña</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
        <BarChart2 className="w-8 h-8 text-blue-600" />
        Dashboard Personal
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Aún no tienes favoritos</p>
          <Link to="/ine" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Explorar operaciones
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav, index) => (
            <FavoriteCard
              key={fav.id}
              item={fav}
              series={queries[index]?.data}
              isLoading={queries[index]?.isLoading || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
