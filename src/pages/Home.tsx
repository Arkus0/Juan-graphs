import { Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

export default function Home() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/ine?q=${encodeURIComponent(search)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>DatosEspaña - Estadísticas del INE y CIS</title>
        <meta name="description" content="Visualiza datos del INE y CIS de forma sencilla. IPC, paro, encuestas y más en tu dispositivo." />
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">DatosEspaña</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center">Datos del INE y CIS simplificados</p>

      <form onSubmit={handleSearch} className="w-full max-w-md relative mb-8">
        <input
          type="text"
          placeholder="Buscar datos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
      </form>

      <div className="flex gap-4 mb-12">
        <Link to="/ine" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Explorar INE
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">IPC General</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">--%</p>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Tasa de Paro</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">--%</p>
         </div>
      </div>
    </div>
  )
}
