import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, FavoriteItem } from './useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({ favorites: [] });
  });

  it('adds a favorite', () => {
    const item: FavoriteItem = { id: '1', operacionId: 10, tablaId: 20, nombreTabla: 'Test' };
    useStore.getState().addFavorite(item);
    expect(useStore.getState().favorites).toContainEqual(item);
    expect(useStore.getState().isFavorite('1')).toBe(true);
  });

  it('removes a favorite', () => {
    const item: FavoriteItem = { id: '1', operacionId: 10, tablaId: 20, nombreTabla: 'Test' };
    useStore.getState().addFavorite(item);
    useStore.getState().removeFavorite('1');
    expect(useStore.getState().favorites).toHaveLength(0);
    expect(useStore.getState().isFavorite('1')).toBe(false);
  });
});
