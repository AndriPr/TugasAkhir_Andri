/**
 * Helpers utility functions untuk LostFind PWA
 */

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatTimeAgo = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    const now = new Date().getTime();
    const past = new Date(isoDate).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam yang lalu`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} hari yang lalu`;
    return formatDate(isoDate);
  } catch {
    return '';
  }
};

export const getCategoryColor = (category: string): { bg: string; text: string; border: string } => {
  switch (category) {
    case 'Elektronik':
      return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
    case 'Dokumen & Kartu':
      return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    case 'Kunci & Aksesoris':
      return { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' };
    case 'Tas & Dompet':
      return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
    case 'Pakaian & Perlengkapan':
      return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  }
};

export const getStatusBadge = (status: string): { label: string; bg: string; text: string } => {
  switch (status) {
    case 'open':
      return { label: 'Sedang Dicari', bg: '#fee2e2', text: '#b91c1c' };
    case 'claimed':
      return { label: 'Dalam Proses Klaim', bg: '#fef3c7', text: '#b45309' };
    case 'resolved':
      return { label: 'Telah Kembali', bg: '#dcfce7', text: '#15803d' };
    case 'pending':
      return { label: 'Menunggu Verifikasi', bg: '#e0f2fe', text: '#0284c7' };
    case 'verified':
      return { label: 'Terverifikasi (Valid)', bg: '#dcfce7', text: '#16a34a' };
    case 'rejected':
      return { label: 'Klaim Ditolak', bg: '#fee2e2', text: '#dc2626' };
    case 'completed':
      return { label: 'Selesai / Diambil', bg: '#f3f4f6', text: '#4b5563' };
    default:
      return { label: status, bg: '#f1f5f9', text: '#475569' };
  }
};

export const formatWhatsAppUrl = (phone: string, itemTitle: string, type: 'lost' | 'found'): string => {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  const message =
    type === 'lost'
      ? `Halo, saya melihat laporan barang hilang "${itemTitle}" di aplikasi LostFind Kampus. Saya memiliki informasi mengenai barang tersebut.`
      : `Halo, saya pemilik barang "${itemTitle}" yang dilaporkan ditemukan di aplikasi LostFind Kampus. Ingin konfirmasi mengenai barang tersebut.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const truncate = (str: string, maxLength: number = 80): string => {
  if (!str || str.length <= maxLength) return str || '';
  return str.slice(0, maxLength).trimEnd() + '…';
};

/**
 * Compresses an uploaded image File into a compact JPEG Data URL so it stays
 * well within Vercel serverless payload limits (4.5MB) and localStorage quota.
 */
export const compressImageFile = (
  file: File,
  maxDimension: number = 1024,
  quality: number = 0.78
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      if (file.type === 'image/svg+xml' || file.size <= 180 * 1024) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};
