// Import base types if needed
import type { BaseListQueryDto } from "../../../app/types/api.types";

// Manually defined types remain here
export type FindAllSubCategoriesDto = BaseListQueryDto & {
  categoryId?: string;
  isActive?: boolean;
};

// Zod schemas (SubCategory, CreateSubCategoryDto, UpdateSubCategoryDto, etc.)
// are defined in ../schema/subcategories.schema.ts
