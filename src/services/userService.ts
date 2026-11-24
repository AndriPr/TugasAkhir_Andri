import { UserProfile } from '../types';

const USER_ID_KEY = 'lostfind_user_id';
const USER_PROFILE_KEY = 'lostfind_user_profile';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getUserIdentifier = (): string => {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = 'user-andri-01'; // Default identity for practical test / Andri Pratama
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    return 'user-andri-01';
  }
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  const defaultProfile: UserProfile = {
    userId: getUserIdentifier(),
    name: 'Andri Pratama',
    nim: '21120124140134',
    programStudi: 'Teknik Komputer / PPB',
    phone: '081234567890',
    email: 'andri.pratama@students.ac.id',
    role: 'Mahasiswa / Penemu Terverifikasi',
  };

  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
  } catch {}

  return defaultProfile;
};

export const saveUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    ...profile,
    userId: current.userId,
  };
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};
