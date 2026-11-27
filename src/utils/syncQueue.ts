import { apiClient } from '../config/api';
import { LostFindItem, ItemClaim } from '../types';

export const SYNC_QUEUE_KEY = 'lostfind_sync_queue';
export const LOCAL_ITEMS_KEY = 'lostfind_local_items';
export const LOCAL_CLAIMS_KEY = 'lostfind_local_claims';

export type SyncAction =
  | 'CREATE_ITEM'
  | 'UPDATE_ITEM'
  | 'DELETE_ITEM'
  | 'CREATE_CLAIM'
  | 'UPDATE_CLAIM';

export interface SyncOperation {
  id: string;
  action: SyncAction;
  targetId: string;
  payload?: any;
  createdAt: string;
}

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  remainingCount: number;
}

let isSyncRunning = false;

const emitSyncEvent = (detail?: Partial<SyncResult>) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lostfind-sync-updated', { detail }));
  }
};

export const getSyncQueue = (): SyncOperation[] => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveSyncQueue = (queue: SyncOperation[]): void => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
  emitSyncEvent({ remainingCount: queue.length });
};

export const getPendingSyncCount = (): number => {
  return getSyncQueue().length;
};

/**
 * Adds an offline operation into the persistent sync queue in localStorage.
 */
export const enqueueSyncOp = (
  action: SyncAction,
  targetId: string,
  payload?: any
): void => {
  const queue = getSyncQueue();
  const cleanPayload = payload ? { ...payload } : undefined;
  if (cleanPayload && 'pendingSync' in cleanPayload) {
    delete cleanPayload.pendingSync;
  }

  // Smart deduplication for local-first mutations
  if (action === 'DELETE_ITEM') {
    const hasUnsentCreate = queue.some(
      (op) => op.action === 'CREATE_ITEM' && op.targetId === targetId
    );
    const filtered = queue.filter((op) => op.targetId !== targetId);
    if (hasUnsentCreate) {
      saveSyncQueue(filtered);
      return;
    }
    filtered.push({
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      targetId,
      createdAt: new Date().toISOString(),
    });
    saveSyncQueue(filtered);
    return;
  }

  if (action === 'UPDATE_ITEM') {
    const createIdx = queue.findIndex(
      (op) => op.action === 'CREATE_ITEM' && op.targetId === targetId
    );
    if (createIdx !== -1) {
      queue[createIdx].payload = { ...queue[createIdx].payload, ...cleanPayload };
      saveSyncQueue(queue);
      return;
    }

    const updateIdx = queue.findIndex(
      (op) => op.action === 'UPDATE_ITEM' && op.targetId === targetId
    );
    if (updateIdx !== -1) {
      queue[updateIdx].payload = { ...queue[updateIdx].payload, ...cleanPayload };
      saveSyncQueue(queue);
      return;
    }
  }

  if (action === 'UPDATE_CLAIM') {
    const createIdx = queue.findIndex(
      (op) => op.action === 'CREATE_CLAIM' && op.targetId === targetId
    );
    if (createIdx !== -1) {
      queue[createIdx].payload = { ...queue[createIdx].payload, ...cleanPayload };
      saveSyncQueue(queue);
      return;
    }
  }

  queue.push({
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    targetId,
    payload: cleanPayload,
    createdAt: new Date().toISOString(),
  });
  saveSyncQueue(queue);
};

const clearLocalPendingFlag = (kind: 'item' | 'claim', targetId: string) => {
  try {
    const key = kind === 'item' ? LOCAL_ITEMS_KEY : LOCAL_CLAIMS_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list = JSON.parse(raw) as Array<LostFindItem | ItemClaim>;
    const updated = list.map((entry) =>
      entry.id === targetId ? { ...entry, pendingSync: false } : entry
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
};

/**
 * Replays queued offline mutations to the REST API / Supabase database.
 */
export const processSyncQueue = async (): Promise<SyncResult> => {
  const initialQueue = getSyncQueue();
  if (isSyncRunning || initialQueue.length === 0) {
    return { syncedCount: 0, failedCount: 0, remainingCount: initialQueue.length };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0, remainingCount: initialQueue.length };
  }

  isSyncRunning = true;
  let syncedCount = 0;
  let failedCount = 0;
  const remaining: SyncOperation[] = [];

  try {
    for (let i = 0; i < initialQueue.length; i++) {
      const op = initialQueue[i];
      try {
        if (op.action === 'CREATE_ITEM') {
          await apiClient.post('/items', op.payload);
          clearLocalPendingFlag('item', op.targetId);
        } else if (op.action === 'UPDATE_ITEM') {
          await apiClient.put(`/items/${op.targetId}`, op.payload);
          clearLocalPendingFlag('item', op.targetId);
        } else if (op.action === 'DELETE_ITEM') {
          await apiClient.delete(`/items/${op.targetId}`);
        } else if (op.action === 'CREATE_CLAIM') {
          await apiClient.post('/claims', op.payload);
          clearLocalPendingFlag('claim', op.targetId);
        } else if (op.action === 'UPDATE_CLAIM') {
          await apiClient.put(`/claims/${op.targetId}`, op.payload);
          clearLocalPendingFlag('claim', op.targetId);
        }
        syncedCount++;
      } catch (err: any) {
        // 404 on delete or 409 conflict means already deleted/created remotely -> clear from queue
        if (err?.status === 404 && op.action === 'DELETE_ITEM') {
          syncedCount++;
          continue;
        }
        // Network error or server down -> stop and keep remaining ops in order
        failedCount++;
        remaining.push(op, ...initialQueue.slice(i + 1));
        break;
      }
    }

    // Re-read in case new items were enqueued while syncing
    const latestQueue = getSyncQueue();
    const processedIds = new Set(initialQueue.map((q) => q.id));
    const newlyAdded = latestQueue.filter((q) => !processedIds.has(q.id));
    const finalQueue = [...remaining, ...newlyAdded];

    saveSyncQueue(finalQueue);
    const result: SyncResult = {
      syncedCount,
      failedCount,
      remainingCount: finalQueue.length,
    };
    emitSyncEvent(result);
    return result;
  } finally {
    isSyncRunning = false;
  }
};
