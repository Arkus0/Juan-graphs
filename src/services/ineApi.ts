import axios from 'axios';
import type { IOperacion, ITabla, ISerie } from '../types/ine';

const BASE_URL = 'https://servicios.ine.es/wstempus/js/ES';

export const ineApi = axios.create({
  baseURL: BASE_URL,
});

ineApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('INE API Error:', error);
    return Promise.reject(error);
  }
);

export const getOperacionesDisponibles = async (): Promise<IOperacion[]> => {
  const response = await ineApi.get<IOperacion[]>('/OPERACIONES_DISPONIBLES');
  return response.data;
};

export const getTablasOperacion = async (operacionId: number): Promise<ITabla[]> => {
  const response = await ineApi.get<ITabla[]>(`/TABLAS_OPERACION/${operacionId}`);
  return response.data;
};

export const getDatosTabla = async (tablaId: number, nult: number = 24, dateStart?: string, dateEnd?: string): Promise<ISerie[]> => {
  let url = `/DATOS_TABLA/${tablaId}?nult=${nult}`;
  if (dateStart && dateEnd) {
    // If date filter is present, use date instead of nult
    // Format required by INE: date=YYYYMMDD:YYYYMMDD
    // Assuming inputs are YYYY-MM-DD
    const start = dateStart.replace(/-/g, '');
    const end = dateEnd.replace(/-/g, '');
    url = `/DATOS_TABLA/${tablaId}?date=${start}:${end}`;
  }

  const response = await ineApi.get<ISerie[]>(url);
  return response.data;
};
