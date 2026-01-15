import { useQuery } from '@tanstack/react-query';
import { getOperacionesDisponibles, getTablasOperacion, getDatosTabla } from '../services/ineApi';

export const useOperaciones = () => {
  return useQuery({
    queryKey: ['operaciones'],
    queryFn: getOperacionesDisponibles,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useTablasOperacion = (operacionId: number | null) => {
  return useQuery({
    queryKey: ['tablas', operacionId],
    queryFn: () => getTablasOperacion(operacionId!),
    enabled: !!operacionId,
  });
};

export const useDatosTabla = (tablaId: number | null, nult: number = 24) => {
  return useQuery({
    queryKey: ['datos', tablaId, nult],
    queryFn: () => getDatosTabla(tablaId!, nult),
    enabled: !!tablaId,
  });
};
