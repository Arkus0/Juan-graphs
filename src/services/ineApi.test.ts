import { describe, it, expect, vi } from 'vitest';
import { getOperacionesDisponibles, ineApi } from './ineApi';

describe('ineApi', () => {
  it('should fetch available operations', async () => {
    const mockData = [{ Id: 1, Nombre: 'Op 1', Codigo: '123' }];
    const spy = vi.spyOn(ineApi, 'get').mockResolvedValueOnce({ data: mockData } as any);

    const result = await getOperacionesDisponibles();
    expect(result).toEqual(mockData);
    expect(spy).toHaveBeenCalledWith('/OPERACIONES_DISPONIBLES');
  });
});
