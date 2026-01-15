import type { IOperacion } from '../types/ine';

export type Category = 'Demografía' | 'Economía' | 'Sociedad' | 'Mercado Laboral' | 'Industria y Servicios' | 'Turismo' | 'Otros';

const KEYWORD_MAP: Record<Category, string[]> = {
  'Demografía': [
    'Población', 'Nacimientos', 'Defunciones', 'Mortalidad', 'Migraciones',
    'Demográfi', 'Padron', 'Censos', 'Matrimonios', 'Nombres', 'Apellidos',
    'Hogares', 'Mujeres y Hombres'
  ],
  'Economía': [
    'IPC', 'Precios', 'Contabilidad', 'PIB', 'Financieras', 'Mercantiles',
    'Sociedades', 'Hipotecas', 'Deuda', 'Renta', 'Competitividad', 'Comercio',
    'Impagados', 'Concursal', 'Exportación', 'Importación', 'Cadenas de Valor'
  ],
  'Mercado Laboral': [
    'EPA', 'Activa', 'Ocupación', 'Paro', 'Empleo', 'Salarial', 'Salarios',
    'Coste Laboral', 'Trabajo', 'Laboral'
  ],
  'Turismo': [
    'Turismo', 'Turístico', 'Hotel', 'Alojamientos', 'Viajeros', 'Camping',
    'Apartamentos', 'Rural'
  ],
  'Industria y Servicios': [
    'Industria', 'Industrial', 'Energía', 'Manufacturas', 'Servicios',
    'Transporte', 'Tecnologías', 'Innovación', 'TIC'
  ],
  'Sociedad': [
    'Salud', 'Vida', 'Social', 'Justicia', 'Condenados', 'Violencia',
    'Cultura', 'Deporte', 'Ocio', 'Nulidades', 'Divorcios'
  ],
  'Otros': []
};

// Override specific ambiguous IDs or Codes if necessary
const EXPLICIT_MAP: Record<string, Category> = {
  'IPC': 'Economía',
  'EPA': 'Mercado Laboral',
  'CNTR2000': 'Economía',
};

export const categorizeOperation = (op: IOperacion): Category => {
  // Check explicit map first (by Code)
  if (EXPLICIT_MAP[op.Codigo]) {
    return EXPLICIT_MAP[op.Codigo];
  }

  const nameUpper = op.Nombre.toUpperCase();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (category === 'Otros') continue;

    for (const keyword of keywords) {
      if (nameUpper.includes(keyword.toUpperCase())) {
        return category as Category;
      }
    }
  }

  return 'Otros';
};
