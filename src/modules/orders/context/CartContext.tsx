import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { OrderItem } from "../types/orders.types";
import { Product } from "../../menu/types/products.types";

const generateId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
};

export interface CartItemModifier {
  id: string;
  name: string;
  price: number;
}

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

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    variantId?: string,
    modifiers?: CartItemModifier[]
  ) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartEmpty: boolean;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item: CartItem) => sum + item.totalPrice, 0);
  }, [items]);

  const total = useMemo(() => {
    return subtotal * 1.16;
  }, [subtotal]);

  const isCartEmpty = items.length === 0;

  const addItem = (
    product: Product,
    quantity: number = 1,
    variantId?: string,
    modifiers: CartItemModifier[] = []
  ) => {
    const variantToAdd = variantId
      ? product.variants?.find((v) => v.id === variantId)
      : undefined;

    const unitPrice = variantToAdd ? variantToAdd.price : product.price || 0;

    const modifiersPrice = modifiers.reduce((sum, mod) => sum + mod.price, 0);

    const newItem: CartItem = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: unitPrice as number,
      totalPrice: ((unitPrice as number) + modifiersPrice) * quantity,
      modifiers,
      variantId,
      variantName: variantToAdd?.name,
    };

    setItems((currentItems) => [...currentItems, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === itemId) {
          const basePrice = item.unitPrice;
          return {
            ...item,
            quantity,
            totalPrice:
              basePrice * quantity +
              item.modifiers.reduce((sum, mod) => sum + mod.price, 0) *
                quantity,
          };
        }
        return item;
      })
    );
  };

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
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
