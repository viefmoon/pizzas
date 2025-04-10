import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { modifierGroupService } from "../services/modifierGroupService";
import { ModifierGroup } from "../types/modifierGroup.types";

// Definir tipo para los filtros basado en el servicio
interface FindAllModifierGroupsQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}


const MODIFIER_GROUPS_QUERY_KEY = 'modifierGroups';

/**
 * Hook para obtener la lista de grupos de modificadores.
 */
export const useModifierGroupsQuery = (
  filters: FindAllModifierGroupsQuery = {},
  options?: Omit<
    UseQueryOptions<ModifierGroup[], Error>, // Corregido: El tipo de dato es ModifierGroup[]
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ModifierGroup[], Error>({ // Corregido: El tipo de dato es ModifierGroup[]
    queryKey: [MODIFIER_GROUPS_QUERY_KEY, filters],
    queryFn: () => modifierGroupService.findAll(filters),
    ...options,
  });
};

// Podrías añadir aquí otros hooks relacionados con ModifierGroup si los necesitas (getOne, etc.)