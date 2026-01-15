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

export const getDatosTabla = async (tablaId: number, nult: number = 24): Promise<ISerie[]> => {
  // Fetch last 24 periods by default
  const response = await ineApi.get<ISerie[]>(`/DATOS_TABLA/${tablaId}?nult=${nult}`);
  return response.data;
};
