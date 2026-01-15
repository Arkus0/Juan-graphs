import { Line } from 'react-chartjs-2';
import type { ISerie } from '../types/ine';
import '../utils/chartSetup';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '../store/useStore';

interface ChartViewerProps {
  series: ISerie[];
  title?: string;
}

export default function ChartViewer({ series, title }: ChartViewerProps) {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  if (!series || series.length === 0) return <div className="text-gray-500 text-center py-4">No hay datos para mostrar</div>;

  // Use the longest series for labels
  const longestSeries = series.reduce((prev, current) => (prev.Data.length > current.Data.length) ? prev : current);
  const sortedBaseData = [...longestSeries.Data].sort((a, b) => a.Fecha - b.Fecha);

  const labels = sortedBaseData.map(d => format(new Date(d.Fecha), 'MMM yy', { locale: es }));

  const datasets = series.map((serie, index) => {
    // Map values to the labels (by date).
    const dataMap = new Map(serie.Data.map(d => [d.Fecha, d.Valor]));

    const data = sortedBaseData.map(d => dataMap.get(d.Fecha) || null);

    const hue = (index * 137.5) % 360;
    return {
      label: serie.Nombre,
      data: data,
      borderColor: `hsl(${hue}, 70%, 50%)`,
      backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
      fill: false,
      tension: 0.3,
      pointRadius: 2,
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            boxWidth: 10,
            usePointStyle: true,
            color: textColor
        },
      },
      title: {
        display: !!title,
        text: title,
        color: textColor
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
        y: {
            beginAtZero: false,
            grid: { color: gridColor },
            ticks: { color: textColor }
        },
        x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
        }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="w-full h-[400px]">
        <Line options={options} data={{ labels, datasets }} />
    </div>
  );
}
