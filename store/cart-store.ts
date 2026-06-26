import { create } from 'zustand';
import { CartItem } from '@/types';

export interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (feederId: string, grams: number) => void;
  updateQuantity: (feederId: string, grams: number, quantity: number) => void;
  clearCart: () => void;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,

  addItem: (item) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.feederId === item.feederId && i.grams === item.grams
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }

      return { items: newItems, total: calculateTotal(newItems) };
    });
  },

  removeItem: (feederId, grams) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.feederId === feederId && i.grams === grams)
      );
      return { items: newItems, total: calculateTotal(newItems) };
    });
  },

  updateQuantity: (feederId, grams, quantity) => {
    set((state) => {
      const safeQuantity = Math.max(1, quantity);
      const newItems = state.items.map((i) =>
        i.feederId === feederId && i.grams === grams
          ? { ...i, quantity: safeQuantity }
          : i
      );
      return { items: newItems, total: calculateTotal(newItems) };
    });
  },

  clearCart: () => {
    set({ items: [], total: 0 });
  },
}));
