import { useRef, useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import type { ISerie } from '../types/ine';
import '../utils/chartSetup';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { Download, FileSpreadsheet, Eye, EyeOff, BarChart2, TrendingUp } from 'lucide-react';
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
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedSeries, setSelectedSeries] = useState<Record<number, boolean>>({});

  // Initialize selectedSeries: select all by default, or just the first 5 to avoid clutter
  // Reset selection when series data changes (different table)
  useEffect(() => {
    const initialSelection: Record<number, boolean> = {};
    if (series) {
      series.forEach((s, i) => {
          // Select only first 5 series initially if there are too many (>10)
          initialSelection[s.Id] = series.length > 10 ? i < 5 : true;
      });
    }
    setSelectedSeries(initialSelection);
  }, [series]);

  if (!series || series.length === 0) return <div className="text-gray-500 text-center py-4">No hay datos para mostrar</div>;

  const toggleSerie = (id: number) => {
    setSelectedSeries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleSeries = series.filter(s => selectedSeries[s.Id]);

  // Use the longest series for labels
  const longestSeries = series.reduce((prev, current) => (prev.Data.length > current.Data.length) ? prev : current);
  const sortedBaseData = [...longestSeries.Data].sort((a, b) => a.Fecha - b.Fecha);

  const labels = sortedBaseData.map(d => format(new Date(d.Fecha), 'MMM yy', { locale: es }));

  // Check scale differences
  // const maxVals = visibleSeries.map(s => Math.max(...s.Data.map(d => d.Valor)));
  // const overallMax = Math.max(...maxVals);
  // const overallMin = Math.min(...visibleSeries.map(s => Math.min(...s.Data.map(d => d.Valor))));

  // Basic multi-axis logic: if any series has max value < 10% of overall max, give it a separate axis
  // For simplicity in this iteration, we will use normalized view or just notify user.
  // Implementing true dual-axis dynamically is complex in UI, so we'll stick to a smart single axis for now
  // but we could add a "Normalize" toggle in future.

  const datasets = visibleSeries.map((serie, index) => {
    // Map values to the labels (by date).
    const dataMap = new Map(serie.Data.map(d => [d.Fecha, d.Valor]));
    const data = sortedBaseData.map(d => dataMap.get(d.Fecha) || null);

    const hue = (index * 137.5) % 360;
    const color = `hsla(${hue}, 70%, 50%, 1)`;
    const bg = `hsla(${hue}, 70%, 50%, 0.1)`;

    return {
      label: serie.Nombre,
      data: data,
      borderColor: color,
      backgroundColor: chartType === 'bar' ? color : bg,
      fill: chartType === 'line', // Fill area under line? maybe just false for cleaner look
      tension: 0.3,
      pointRadius: 2,
      borderWidth: 2,
    };
  });

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We use custom legend/controls
      },
      title: {
        display: !!title,
        text: title,
        color: textColor
      },
      tooltip: {
        mode: 'index',
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
      mode: 'nearest',
      axis: 'x',
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
      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* Sidebar Controls */}
        <div className="md:w-64 flex-shrink-0 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Series Visibles</h3>
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                const newSel: any = {};
                                series.forEach(s => newSel[s.Id] = true);
                                setSelectedSeries(newSel);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Todas
                        </button>
                        <span className="text-gray-300">|</span>
                         <button
                            onClick={() => setSelectedSeries({})}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Ninguna
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    {series.map(s => (
                        <div key={s.Id} className="flex items-start gap-2 text-sm group">
                             <button
                                onClick={() => toggleSerie(s.Id)}
                                className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSeries[s.Id] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                             >
                                {selectedSeries[s.Id] && <Eye className="w-3 h-3" />}
                             </button>
                             <span
                                onClick={() => toggleSerie(s.Id)}
                                className={`cursor-pointer leading-tight ${selectedSeries[s.Id] ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                {s.Nombre}
                             </span>
                        </div>
                    ))}
                </div>
            </div>

             <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setChartType('line')}
                        className={`p-2 rounded-lg transition-colors ${chartType === 'line' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                        title="Líneas"
                    >
                        <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`p-2 rounded-lg transition-colors ${chartType === 'bar' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                        title="Barras"
                    >
                        <BarChart2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                 <div className="flex gap-1">
                    <button
                        onClick={handleDownloadCSV}
                        className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Exportar CSV"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownloadImage}
                        className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Descargar Imagen"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-h-[400px]">
             {visibleSeries.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <EyeOff className="w-8 h-8 mb-2" />
                    <p>No hay series visibles</p>
                    <button onClick={() => {
                         const newSel: any = {};
                         series.forEach(s => newSel[s.Id] = true);
                         setSelectedSeries(newSel);
                    }} className="mt-2 text-sm text-blue-600 hover:underline">Mostrar todas</button>
                 </div>
             ) : (
                chartType === 'line'
                ? <Line ref={chartRef} options={options} data={{ labels, datasets }} />
                : <Bar ref={chartRef} options={options} data={{ labels, datasets }} />
             )}
        </div>
      </div>
    </div>
  );
}
