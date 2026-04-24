import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_POINTS = 100;
const UPLOAD_REWARD_POINTS = 10;

interface CartItem {
  productId: string;
  qty: number;
}

interface RewardsState {
  points: number;
  cart: CartItem[];
  addUploadReward: () => void;
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (totalPoints: number) => boolean;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      points: 0,
      cart: [],

      addUploadReward: () => {
        const next = Math.min(MAX_POINTS, get().points + UPLOAD_REWARD_POINTS);
        set({ points: next });
      },

      addToCart: (productId, qty = 1) => {
        if (qty <= 0) return;
        const current = get().cart;
        const existing = current.find((item) => item.productId === productId);
        if (existing) {
          set({
            cart: current.map((item) =>
              item.productId === productId ? { ...item, qty: item.qty + qty } : item,
            ),
          });
          return;
        }
        set({ cart: [...current, { productId, qty }] });
      },

      removeFromCart: (productId) => {
        const current = get().cart;
        const existing = current.find((item) => item.productId === productId);
        if (!existing) return;
        if (existing.qty <= 1) {
          set({ cart: current.filter((item) => item.productId !== productId) });
          return;
        }
        set({
          cart: current.map((item) =>
            item.productId === productId ? { ...item, qty: item.qty - 1 } : item,
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      checkout: (totalPoints) => {
        const points = get().points;
        if (totalPoints <= 0 || totalPoints > points) return false;
        set({ points: points - totalPoints, cart: [] });
        return true;
      },
    }),
    {
      name: 'aura-rewards',
      partialize: (state) => ({
        points: state.points,
        cart: state.cart,
      }),
    },
  ),
);

export { MAX_POINTS, UPLOAD_REWARD_POINTS };
