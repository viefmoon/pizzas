export type MenuStackParamList = {
  CategoriesScreen: undefined;
  SubCategoriesScreen: { categoryId: string; categoryName: string };
  Products: { subCategoryId: string; subCategoryName: string };
  ProductForm: { subCategoryId: string; productId?: string };
};