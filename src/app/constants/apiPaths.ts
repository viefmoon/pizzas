// src/app/constants/apiPaths.ts

/**
 * Objeto que centraliza todas las rutas base de la API v1.
 * Se utiliza 'as const' para asegurar que los valores sean tratados como literales
 * y sean inmutables, mejorando la seguridad de tipos.
 */
export const API_PATHS = {
  // Menu Module
  SUBCATEGORIES: "/api/v1/subcategories",
  PRODUCTS: "/api/v1/products",
  CATEGORIES: "/api/v1/categories",
  FILES_UPLOAD: "/api/v1/files/upload",

  // Preparation Screens Module
  PREPARATION_SCREENS: "/api/v1/preparation-screens",

  // Auth Module
  AUTH_EMAIL_LOGIN: "/api/v1/auth/email/login",
  AUTH_EMAIL_REGISTER: "/api/v1/auth/email/register",

  // Areas & Tables Module
  AREAS: "/api/v1/areas",
  TABLES: "/api/v1/tables",

  // Modifiers Module
  MODIFIERS: "/api/v1/product-modifiers",
  MODIFIER_GROUPS: "/api/v1/modifier-groups",

  // Rutas específicas (ejemplos, descomentar si se usan frecuentemente)
  // PRODUCT_BY_ID: (id: string) => `${API_PATHS.PRODUCTS}/${id}`,
  // CATEGORY_BY_ID: (id: string) => `${API_PATHS.CATEGORIES}/${id}`,
  // AREA_BY_ID: (id: string) => `${API_PATHS.AREAS}/${id}`,
  // TABLE_BY_ID: (id: string) => `${API_PATHS.TABLES}/${id}`,
  // SUBCATEGORY_BY_ID: (id: string) => `${API_PATHS.SUBCATEGORIES}/${id}`,
  // PREPARATION_SCREEN_BY_ID: (id: string) => `${API_PATHS.PREPARATION_SCREENS}/${id}`,
  // MODIFIER_BY_ID: (id: string) => `${API_PATHS.MODIFIERS}/${id}`,
  // MODIFIER_GROUP_BY_ID: (id: string) => `${API_PATHS.MODIFIER_GROUPS}/${id}`,
  // MODIFIERS_BY_GROUP_ID: (groupId: string) => `${API_PATHS.MODIFIERS}/by-group/${groupId}`,
  // PRODUCT_MODIFIER_GROUPS: (productId: string) => `${API_PATHS.PRODUCTS}/${productId}/modifier-groups`,
  // TABLES_BY_AREA_ID: (areaId: string) => `${API_PATHS.TABLES}/area/${areaId}`,

} as const;

/**
 * Función helper para construir URLs completas con parámetros de ruta.
 * @param pathTemplate - La plantilla de ruta de API_PATHS (ej. API_PATHS.PRODUCT_BY_ID).
 * @param params - Un objeto donde las claves coinciden con los parámetros en la plantilla (ej. { id: '123' }).
 * @returns La URL completa con los parámetros reemplazados.
 */
// export const buildApiPath = (pathTemplate: (...args: any[]) => string, ...params: any[]): string => {
//   return pathTemplate(...params);
// };

// Ejemplo de uso de buildApiPath:
// const productUrl = buildApiPath(API_PATHS.PRODUCT_BY_ID, productId);