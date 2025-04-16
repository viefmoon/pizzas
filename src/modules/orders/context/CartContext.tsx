import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { OrderItem } from '../types/orders.types';
import { Product } from '@/modules/menu/types/products.types';

// Función para generar un ID único sin depender de crypto.getRandomValues
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

// Definición del tipo para un modificador en un item del carrito
export interface CartItemModifier {
  id: string;
  name: string;
  price: number;
}

// Definición del tipo para un item en el carrito
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: CartItemModifier[];
  variantId?: string;
  variantName?: string;
}

// Contexto del carrito
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantId?: string, modifiers?: CartItemModifier[]) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartEmpty: boolean;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Proveedor del contexto
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calcular subtotal y total
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [items]);

  const total = useMemo(() => {
    return subtotal * 1.16; // Aplicando IVA (16%)
  }, [subtotal]);

  // Verificar si el carrito está vacío
  const isCartEmpty = items.length === 0;

  // Añadir item al carrito
  const addItem = (
    product: Product, 
    quantity: number = 1, 
    variantId?: string, 
    modifiers: CartItemModifier[] = []
  ) => {
    const variantToAdd = variantId ? product.variants?.find(v => v.id === variantId) : undefined;
    
    // Determinar el precio según variante o precio base
    const unitPrice = variantToAdd ? variantToAdd.price : product.price || 0;
    
    // Calcular precio adicional de los modificadores
    const modifiersPrice = modifiers.reduce((sum, mod) => sum + mod.price, 0);
    
    // Crear nuevo item
    const newItem: CartItem = {
      id: generateId(), // Generar ID único con nuestra implementación propia
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: unitPrice as number,
      totalPrice: (unitPrice as number + modifiersPrice) * quantity,
      modifiers,
      variantId,
      variantName: variantToAdd?.name,
    };

    setItems(currentItems => [...currentItems, newItem]);
  };

  // Eliminar item del carrito
  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  // Actualizar cantidad de un item
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems => 
      currentItems.map(item => {
        if (item.id === itemId) {
          const basePrice = item.unitPrice;
          return {
            ...item,
            quantity,
            totalPrice: basePrice * quantity + item.modifiers.reduce((sum, mod) => sum + mod.price, 0) * quantity
          };
        }
        return item;
      })
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    isCartEmpty,
    subtotal,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
