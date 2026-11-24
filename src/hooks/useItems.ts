import { useState, useEffect, useCallback } from 'react';
import { LostFindItem } from '../types';
import { itemService } from '../services/itemService';

export function useItems(params: {
  type?: 'lost' | 'found';
  category?: string;
  search?: string;
  status?: string;
  userId?: string;
} = {}) {
  const [items, setItems] = useState<LostFindItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const paramKey = JSON.stringify(params);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await itemService.getItems(params);
      if (res.success) {
        setItems(res.data);
        setIsOffline(res.isOffline);
      } else {
        setError('Gagal memuat daftar barang.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data.');
      setItems([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    isOffline,
    refetch: fetchItems,
  };
}
