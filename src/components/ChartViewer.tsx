import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import type { ISerie } from '../types/ine';
import '../utils/chartSetup';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { Download, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

interface ChartViewerProps {
  series: ISerie[];
  title?: string;
}

export default function ChartViewer({ series, title }: ChartViewerProps) {
  const chartRef = useRef<any>(null);
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

  const handleDownloadImage = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `${title || 'grafica-ine'}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  const handleDownloadCSV = () => {
    if (!series || series.length === 0) return;

    // Prepare data for CSV
    // We want a format like: Fecha, Serie1, Serie2, ...

    // Get all unique dates
    const allDates = new Set<number>();
    series.forEach(s => s.Data.forEach(d => allDates.add(d.Fecha)));
    const sortedDates = Array.from(allDates).sort((a, b) => a - b);

    const csvData = sortedDates.map(date => {
      const row: any = {
        Fecha: format(new Date(date), 'dd/MM/yyyy')
      };
      series.forEach(s => {
        const point = s.Data.find(d => d.Fecha === date);
        row[s.Nombre] = point ? point.Valor : '';
      });
      return row;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${title || 'datos-ine'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end gap-2 mb-2">
        <button
            onClick={handleDownloadCSV}
            className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
            title="Exportar CSV"
        >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
        </button>
        <button
            onClick={handleDownloadImage}
            className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
            title="Descargar Imagen"
        >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PNG</span>
        </button>
      </div>
      <div className="h-[400px]">
        <Line ref={chartRef} options={options} data={{ labels, datasets }} />
      </div>
    </div>
  );
}
