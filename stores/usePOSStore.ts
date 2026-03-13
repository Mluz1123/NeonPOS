import { create } from 'zustand';
import { Product, SaleItem } from '@/types';

interface SaleTab {
  id: string;
  name: string;
  items: SaleItem[];
}

interface POSState {
  tabs: SaleTab[];
  activeTabId: string;
  
  // Actions
  addTab: (name?: string) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  
  // Cart Actions
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  tabs: [{ id: '1', name: 'Venta 1', items: [] }],
  activeTabId: '1',

  addTab: (name) => set((state) => {
    const newId = Math.random().toString(36).substring(7);
    const newTab = {
      id: newId,
      name: name || `Venta ${state.tabs.length + 1}`,
      items: []
    };
    return {
      tabs: [...state.tabs, newTab],
      activeTabId: newId
    };
  }),

  removeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) {
      const defaultId = '1';
      return {
        tabs: [{ id: defaultId, name: 'Venta 1', items: [] }],
        activeTabId: defaultId
      };
    }
    return {
      tabs: newTabs,
      activeTabId: state.activeTabId === id ? newTabs[0].id : state.activeTabId
    };
  }),

  setActiveTab: (id) => set({ activeTabId: id }),

  renameTab: (id, name) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, name } : t)
  })),

  addToCart: (product) => set((state) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return state;

    const existingItem = activeTab.items.find(item => item.product_id === product.id);
    let newItems;

    if (existingItem) {
      newItems = activeTab.items.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
          : item
      );
    } else {
      newItems = [...activeTab.items, {
        product_id: product.id,
        product,
        quantity: 1,
        unit_price: product.sale_price,
        subtotal: product.sale_price
      }];
    }

    return {
      tabs: state.tabs.map(t => t.id === state.activeTabId ? { ...t, items: newItems } : t)
    };
  }),

  updateQuantity: (productId, quantity) => set((state) => ({
    tabs: state.tabs.map(t => t.id === state.activeTabId ? {
      ...t,
      items: t.items.map(item => 
        item.product_id === productId 
          ? { ...item, quantity, subtotal: quantity * item.unit_price }
          : item
      )
    } : t)
  })),

  removeFromCart: (productId) => set((state) => ({
    tabs: state.tabs.map(t => t.id === state.activeTabId ? {
      ...t,
      items: t.items.filter(item => item.product_id !== productId)
    } : t)
  })),

  clearCart: () => set((state) => ({
    tabs: state.tabs.map(t => t.id === state.activeTabId ? { ...t, items: [] } : t)
  }))
}));
