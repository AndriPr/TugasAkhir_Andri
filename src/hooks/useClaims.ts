import { useState, useEffect, useCallback } from 'react';
import { ItemClaim } from '../types';
import { claimService } from '../services/claimService';
import { getUserIdentifier } from '../services/userService';

export function useClaims(filterByUser: boolean = true) {
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = getUserIdentifier();

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await claimService.getClaims(filterByUser ? userId : undefined);
      if (res.success) {
        setClaims(res.data);
      } else {
        setError('Gagal memuat daftar klaim.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [filterByUser, userId]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  useEffect(() => {
    const handleSynced = () => {
      fetchClaims();
    };
    window.addEventListener('lostfind-data-synced', handleSynced);
    return () => window.removeEventListener('lostfind-data-synced', handleSynced);
  }, [fetchClaims]);

  return {
    claims,
    loading,
    error,
    refetch: fetchClaims,
  };
}
