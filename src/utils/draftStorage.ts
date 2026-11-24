// ---------------------------------------------------------------------------
// draftStorage.ts — Auto-save / restore form drafts via localStorage (PWA)
// ---------------------------------------------------------------------------

const PREFIX = 'lostfind_draft_';
const TS_SUFFIX = '_ts';

export const saveDraft = (draftData: any, formId: string = 'report'): boolean => {
  try {
    const key = `${PREFIX}${formId}`;
    const ts = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify({ ...draftData, savedAt: ts }));
    localStorage.setItem(`${key}${TS_SUFFIX}`, ts);
    return true;
  } catch {
    return false;
  }
};

export const loadDraft = (formId: string = 'report'): any | null => {
  try {
    const raw = localStorage.getItem(`${PREFIX}${formId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const deleteDraft = (formId: string = 'report'): boolean => {
  try {
    const key = `${PREFIX}${formId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}${TS_SUFFIX}`);
    return true;
  } catch {
    return false;
  }
};

export const hasDraft = (formId: string = 'report'): boolean => {
  try {
    return localStorage.getItem(`${PREFIX}${formId}`) !== null;
  } catch {
    return false;
  }
};

export const getDraftTimestamp = (formId: string = 'report'): string | null => {
  try {
    return localStorage.getItem(`${PREFIX}${formId}${TS_SUFFIX}`);
  } catch {
    return null;
  }
};

export const formatDraftTime = (timestamp: string | null): string => {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
};
