import { create } from 'zustand';
import type { MenuItem, OrderType } from '../types/database';

export interface CartItem {
  id: string; // Unique cart item ID (menuId + notes hash)
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isUnlimitedStock: boolean;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  isMobileCartOpen: boolean;

  // Actions
  addItem: (menu: MenuItem, notes?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  setOrderType: (orderType: OrderType) => void;
  setTableNumber: (tableNumber: string) => void;
  setCustomerName: (customerName: string) => void;
  setIsMobileCartOpen: (isOpen: boolean) => void;
  clearCart: () => void;

  // Selectors / Helpers
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  orderType: 'DINE_IN',
  tableNumber: '01',
  customerName: '',
  isMobileCartOpen: false,

  addItem: (menu: MenuItem, notes?: string) => {
    // Jika stok habis dan bukan unlimited, jangan tambahkan
    if (!menu.is_unlimited_stock && menu.stock <= 0) return;

    set((state) => {
      const cleanNotes = notes?.trim() || '';
      const existingIndex = state.items.findIndex(
        (i) => i.menuId === menu.id && (i.notes || '') === cleanNotes
      );

      if (existingIndex > -1) {
        const existingItem = state.items[existingIndex];
        // Cek batasan stok
        if (!menu.is_unlimited_stock && existingItem.quantity >= menu.stock) {
          return state; // Sudah mencapai batas stok tersedia
        }

        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1
        };
        return { items: updatedItems };
      }

      const newItem: CartItem = {
        id: `${menu.id}-${Date.now()}`,
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        notes: cleanNotes || undefined,
        isUnlimitedStock: menu.is_unlimited_stock,
        stock: menu.stock
      };

      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (cartItemId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== cartItemId)
    }));
  },

  updateQuantity: (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }

    set((state) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === cartItemId) {
          // Validasi batas stok jika stok terbatas
          if (!item.isUnlimitedStock && newQuantity > item.stock) {
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return { items: updatedItems };
    });
  },

  updateNotes: (cartItemId: string, notes: string) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === cartItemId ? { ...i, notes: notes.trim() || undefined } : i
      )
    }));
  },

  setOrderType: (orderType: OrderType) => set({ orderType }),
  setTableNumber: (tableNumber: string) => set({ tableNumber }),
  setCustomerName: (customerName: string) => set({ customerName }),
  setIsMobileCartOpen: (isOpen: boolean) => set({ isMobileCartOpen: isOpen }),
  clearCart: () => set({ items: [], customerName: '', tableNumber: '01' }),

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  }
}));
