/** Representa una mesa dentro de un área */
export interface Table {
  id: string; // o number, según tu backend
  name: string; // Nombre o número de la mesa (ej. "Mesa 5", "Barra 1")
  areaId: string; // ID del área a la que pertenece
  capacity?: number | null; // Capacidad de la mesa (opcional, puede ser null)
  isActive: boolean;
  // Otros campos relevantes (ej. status: 'available' | 'occupied')
}

/** Representa un área del local (ej. Salón Principal, Terraza) */
export interface Area {
  id: string; // o number
  name: string;
  isActive: boolean;
  // Podría incluir una lista de mesas si la API las devuelve juntas,
  // pero es más flexible cargarlas por separado.
  // tables?: Table[];
}

// Podrías añadir DTOs para Crear/Actualizar si es necesario
// export interface CreateAreaDto { ... }
// export interface UpdateAreaDto { ... }
// export interface CreateTableDto { ... }
// export interface UpdateTableDto { ... }