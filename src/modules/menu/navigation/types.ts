// Define los parámetros esperados por cada pantalla en el MenuStack
export type MenuStackParamList = {
  CategoriesScreen: undefined; // La pantalla de categorías no recibe parámetros
  SubCategoriesScreen: { categoryId: string; categoryName: string }; // Ejemplo para futura pantalla
  // ProductScreen: { productId: string }; // Ejemplo
  // ... otras pantallas del módulo menu
};