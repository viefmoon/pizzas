import { useQuery } from '@tanstack/react-query';
import areaTableService from '../services/areaTableService';
import type { Area, Table } from '../types/areasTables.types';
import { ApiError } from '@/app/lib/errors';

// Claves de Query para áreas y mesas
const areaQueryKeys = {
  all: ['areas'] as const,
  tablesByArea: (areaId: string | null | undefined) => [...areaQueryKeys.all, areaId, 'tables'] as const,
};

/**
 * Hook para obtener la lista de todas las áreas activas.
 */
export function useGetAreas() {
  return useQuery<Area[], ApiError>({
    queryKey: areaQueryKeys.all,
    queryFn: areaTableService.getAreas,
    // Opciones adicionales si son necesarias (ej. staleTime)
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener la lista de mesas activas para un área específica.
 * La query se habilita solo si se proporciona un areaId válido.
 * @param areaId - El ID del área seleccionada. La query se deshabilita si es null o undefined.
 */
export function useGetTablesByArea(areaId: string | null | undefined) {
  return useQuery<Table[], ApiError>({
    queryKey: areaQueryKeys.tablesByArea(areaId),
    queryFn: () => {
      // Asegurarse de no llamar al servicio si areaId no es válido
      if (!areaId) {
        return Promise.resolve([]); // Devuelve array vacío si no hay areaId
      }
      return areaTableService.getTablesByArea(areaId);
    },
    // Habilitar la query solo si areaId tiene un valor
    enabled: !!areaId,
    // Opciones adicionales (ej. mantener datos previos mientras carga)
    // keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutos (las mesas pueden cambiar más a menudo)
  });
}