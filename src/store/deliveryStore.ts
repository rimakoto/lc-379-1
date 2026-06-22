import { create } from "zustand";
import type { DeliveryOrder } from "@/types";

const STORAGE_KEY = "delivery-tracker-orders";

function loadOrders(): DeliveryOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DeliveryOrder[];
  } catch {
    return [];
  }
}

function saveOrders(orders: DeliveryOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface DeliveryStore {
  orders: DeliveryOrder[];
  addOrder: (name: string, estimatedMinutes: number) => void;
  receiveOrder: (id: string) => void;
  removeOrder: (id: string) => void;
  repeatLastOrder: () => void;
  getLastOrder: () => DeliveryOrder | null;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  orders: loadOrders(),

  addOrder: (name: string, estimatedMinutes: number) => {
    const newOrder: DeliveryOrder = {
      id: generateId(),
      name,
      estimatedMinutes,
      createdAt: Date.now(),
      received: false,
      receivedAt: null,
    };
    set((state) => {
      const orders = [newOrder, ...state.orders];
      saveOrders(orders);
      return { orders };
    });
  },

  receiveOrder: (id: string) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === id ? { ...o, received: true, receivedAt: Date.now() } : o
      );
      saveOrders(orders);
      return { orders };
    });
  },

  removeOrder: (id: string) => {
    set((state) => {
      const orders = state.orders.filter((o) => o.id !== id);
      saveOrders(orders);
      return { orders };
    });
  },

  repeatLastOrder: () => {
    const last = get().getLastOrder();
    if (!last) return;
    get().addOrder(last.name, last.estimatedMinutes);
  },

  getLastOrder: () => {
    const { orders } = get();
    const active = orders.filter((o) => !o.received);
    if (active.length > 0) return active[0];
    const received = orders.filter((o) => o.received);
    if (received.length > 0) return received[0];
    return null;
  },
}));
