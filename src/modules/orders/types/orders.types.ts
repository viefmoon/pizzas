// Tipos específicos del módulo de órdenes

/** Representa un modificador individual (ej. Extra queso, Sin cebolla) */
export interface Modifier {
  id: string; // o number, según tu backend
  name: string;
  price: number; // Precio adicional del modificador
  isActive: boolean;
  // Otros campos si son necesarios (ej. stock, sku)
}

/** Representa un grupo de modificadores (ej. Tamaño, Extras, Salsas) */
export interface ModifierGroup {
  id: string; // o number
  name: string;
  minSelection: number;
  maxSelection: number;
  allowMultipleSelections?: boolean;
  isRequired?: boolean;
  isActive: boolean;
  modifiers: Modifier[];
}

/** Representa una variante de un producto (ej. Tamaño Pequeño, Mediano) */
export interface ProductVariant {
  id: string;
  name: string;
  price: number | null | undefined;
}

/** Representa un producto del menú (ej. Pizza Margarita, Refresco) */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | null | undefined;
  photo?: { path: string } | null;
  isActive: boolean;
  hasVariants: boolean;
  variants?: ProductVariant[];
  modifierGroups: ModifierGroup[];
}

/** Representa una subcategoría del menú (ej. Pizzas Clásicas, Bebidas) */
export interface SubCategory {
  id: string; // o number
  name: string;
  isActive: boolean;
  photo?: { path: string } | null; // Objeto de foto con ruta (opcional)
  products: Product[]; // Lista de productos dentro de esta subcategoría
}

/** Representa una categoría principal del menú (ej. Comida, Bebida) */
export interface Category {
  id: string; // o number
  name: string;
  photo?: { path: string } | null; // Objeto de foto con ruta
  isActive: boolean;
  subCategories: SubCategory[]; // Lista de subcategorías dentro de esta categoría
}

// --- Tipos relacionados con la Orden en sí ---

/** Representa un ítem dentro de una orden */
export interface OrderItemModifier {
  modifierId: string; // o number
  modifierName: string;
  price: number; // Precio del modificador en el momento de la orden
}

export interface OrderItem {
  id: string; // ID único para el ítem en la orden (puede ser temporal)
  productId: string; // o number
  productName: string;
  quantity: number;
  unitPrice: number; // Precio unitario base en el momento de la orden
  totalPrice: number; // quantity * (unitPrice + modifiersPrice)
  modifiers: OrderItemModifier[]; // Modificadores seleccionados para este ítem
  notes?: string; // Notas específicas para este ítem
}

/** Representa el estado de la orden */
export enum OrderStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  READY = "READY",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/** Representa el tipo de orden */
export enum OrderType {
  DINE_IN = "DINE_IN",
  TAKE_AWAY = "TAKE_AWAY",
  DELIVERY = "DELIVERY",
}

/** Representa una orden completa */
export interface Order {
  id: string; // o number, ID de la orden en el backend
  orderNumber: string; // Número de orden visible para el cliente/staff
  items: OrderItem[];
  totalAmount: number; // Suma de todos los totalPrice de los items
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  customerId?: string; // ID del cliente asociado (opcional)
  tableId?: string; // ID de la mesa asociada (opcional)
  notes?: string; // Notas generales de la orden
  // Otros campos relevantes: tipo de orden (comer aquí, llevar, domicilio),
  // información de pago, dirección de entrega, etc.
}
