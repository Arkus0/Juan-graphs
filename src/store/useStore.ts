import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  operacionId: number;
  tablaId: number;
  nombreTabla: string;
  nombreOperacion?: string;
}

interface AppState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => set((state) => ({ favorites: [...state.favorites, item] })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'datos-espana-storage',
    }
  )
);
