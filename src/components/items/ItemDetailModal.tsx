import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Award,
  CheckCircle,
  Send,
  Loader,
  Trash2,
} from 'lucide-react';
import { LostFindItem } from '../../types';
import { formatDate, getCategoryColor, getStatusBadge, formatWhatsAppUrl } from '../../utils/helpers';
import { claimService } from '../../services/claimService';
import { getUserProfile } from '../../services/userService';

interface ItemDetailModalProps {
  item: LostFindItem | null;
  onClose: () => void;
  onItemUpdated?: (updatedItem: LostFindItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onClaimSubmitted?: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onItemUpdated,
  onDeleteItem,
  onClaimSubmitted,
}) => {
  if (!item) return null;

  const userProfile = getUserProfile();
  const isOwner = item.userId === userProfile.userId;
  const catColor = getCategoryColor(item.category);
  const statusBadge = getStatusBadge(item.status);

  // Klaim Form State
  const [showClaimForm, setShowClaimForm] = useState<boolean>(false);
  const [claimantName, setClaimantName] = useState<string>(userProfile.name);
  const [claimantNim, setClaimantNim] = useState<string>(userProfile.nim);
  const [claimantPhone, setClaimantPhone] = useState<string>(userProfile.phone);
  const [proofDescription, setProofDescription] = useState<string>('');
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [claimError, setClaimError] = useState<string>('');

  const handleWhatsApp = () => {
    const url = formatWhatsAppUrl(item.contactPhone, item.title, item.type);
    window.open(url, '_blank');
  };

  const handleDirectCall = () => {
    window.location.href = `tel:${item.contactPhone}`;
  };

  const handleMarkResolved = () => {
    const updated: LostFindItem = {
      ...item,
      status: 'resolved',
      updatedAt: new Date().toISOString(),
    };
    if (onItemUpdated) onItemUpdated(updated);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    if (!claimantName.trim() || !claimantPhone.trim() || !proofDescription.trim()) {
      setClaimError('Mohon lengkapi nama, nomor telepon, dan bukti ciri khusus kepemilikan.');
      return;
    }

    try {
      setSubmittingClaim(true);
      const res = await claimService.createClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemType: item.type,
        itemImageUrl: item.imageUrl,
        claimantName: claimantName.trim(),
        claimantNim: claimantNim.trim(),
        claimantPhone: claimantPhone.trim(),
        proofDescription: proofDescription.trim(),
        userId: userProfile.userId,
      });

      if (res.success) {
        setClaimSuccess(true);
        if (onClaimSubmitted) onClaimSubmitted();
        if (onItemUpdated) {
          onItemUpdated({ ...item, status: 'claimed' });
        }
      } else {
        setClaimError('Gagal mengajukan klaim. Silakan coba lagi.');
      }
    } catch (err: any) {
      setClaimError(err.message || 'Terjadi kesalahan saat mengirim formulir klaim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="detail-modal-backdrop" onClick={onClose}>
      <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="detail-modal-header">
          <div className="detail-modal-type-tag">
            {item.type === 'lost' ? (
              <span className="badge-tag badge-tag--lost">Laporan Barang Hilang</span>
            ) : (
              <span className="badge-tag badge-tag--found">Laporan Penemuan Barang</span>
            )}
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Tutup detail">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="detail-modal-body">
          {/* Main Visual */}
          <div className="detail-media-wrap">
            <img src={item.imageUrl} alt={item.title} className="detail-hero-img" />
          </div>

          {/* Title & Badges */}
          <div className="detail-heading">
            <div className="detail-badges-row">
              <span
                className="category-badge"
                style={{
                  backgroundColor: catColor.bg,
                  color: catColor.text,
                  borderColor: catColor.border,
                }}
              >
                {item.category}
              </span>
              <span
                className="status-badge"
                style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
              >
                {statusBadge.label}
              </span>
            </div>
            <h2 className="detail-title">{item.title}</h2>
          </div>

          {/* Metadata Grid */}
          <div className="detail-info-grid">
            <div className="info-box">
              <div className="info-box__icon">
                <MapPin size={18} />
              </div>
              <div className="info-box__content">
                <span className="info-box__label">
                  {item.type === 'lost' ? 'Lokasi Terakhir Terlihat' : 'Lokasi Ditemukan'}
                </span>
                <span className="info-box__value">{item.location}</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-box__icon">
                <Calendar size={18} />
              </div>
              <div className="info-box__content">
                <span className="info-box__label">Waktu Kejadian</span>
                <span className="info-box__value">
                  {formatDate(item.date)} • {item.time}
                </span>
              </div>
            </div>

            {item.securedAt && (
              <div className="info-box info-box--highlight">
                <div className="info-box__icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="info-box__content">
                  <span className="info-box__label">Tempat Pengamanan Saat Ini</span>
                  <span className="info-box__value">{item.securedAt}</span>
                </div>
              </div>
            )}

            {item.rewardInfo && (
              <div className="info-box info-box--reward">
                <div className="info-box__icon">
                  <Award size={18} />
                </div>
                <div className="info-box__content">
                  <span className="info-box__label">Apresiasi / Hadiah</span>
                  <span className="info-box__value">{item.rewardInfo}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="detail-section">
            <h4 className="section-heading">Deskripsi &amp; Ciri-Ciri Barang</h4>
            <p className="detail-desc-text">{item.description}</p>
          </div>

          {/* Contact Box */}
          <div className="detail-contact-box">
            <div className="contact-avatar">
              <User size={22} />
            </div>
            <div className="contact-info">
              <span className="contact-role">
                {item.type === 'lost' ? 'Pelapor Kehilangan' : 'Penemu Barang'}
              </span>
              <strong className="contact-name">{item.contactName}</strong>
              <span className="contact-phone">{item.contactPhone}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="detail-action-buttons">
            <button type="button" className="btn btn--whatsapp" onClick={handleWhatsApp}>
              <MessageCircle size={18} />
              <span>Chat WhatsApp</span>
            </button>
            <button type="button" className="btn btn--outline" onClick={handleDirectCall}>
              <Phone size={18} />
              <span>Telepon</span>
            </button>
          </div>

          {/* For Found Items: Klaim Kepemilikan */}
          {item.type === 'found' && item.status !== 'resolved' && (
            <div className="claim-section">
              {!showClaimForm && !claimSuccess ? (
                <div className="claim-prompt-box">
                  <div className="claim-prompt-info">
                    <strong>Apakah ini barang milik Anda?</strong>
                    <p>Ajukan klaim dengan menyebutkan ciri unik untuk diverifikasi posko pengamanan.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setShowClaimForm(true)}
                  >
                    Ajukan Klaim Kepemilikan
                  </button>
                </div>
              ) : claimSuccess ? (
                <div className="claim-success-card">
                  <CheckCircle size={28} className="claim-success-icon" />
                  <h4>Klaim Anda Berhasil Diajukan!</h4>
                  <p>
                    Pengajuan klaim Anda telah dicatat. Silakan cek menu <strong>Aktivitas Saya</strong>{' '}
                    untuk memantau status persetujuan dari petugas keamanan kampus.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="claim-form-card">
                  <div className="claim-form-head">
                    <h4>Formulir Klaim Kepemilikan Barang</h4>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setShowClaimForm(false)}
                    >
                      Batal
                    </button>
                  </div>

                  {claimError && <div className="toast toast--error">{claimError}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nama Pemilik *</label>
                      <input
                        type="text"
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">NIM Mahasiswa *</label>
                      <input
                        type="text"
                        value={claimantNim}
                        onChange={(e) => setClaimantNim(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      value={claimantPhone}
                      onChange={(e) => setClaimantPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bukti Ciri Khusus / Kepemilikan *</label>
                    <textarea
                      rows={3}
                      value={proofDescription}
                      onChange={(e) => setProofDescription(e.target.value)}
                      placeholder="Contoh: Ada goresan di sudut kiri, isi dompet pecahan uang tertentu, wallpaper lockscreen foto kucing..."
                      className="form-textarea"
                      required
                    />
                    <span className="form-hint">
                      Ciri khusus ini akan dicocokkan oleh petugas sebelum barang diserahterimakan.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary btn--full"
                    disabled={submittingClaim}
                  >
                    {submittingClaim ? (
                      <>
                        <Loader size={18} className="spin" /> Mengirim Pengajuan…
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Kirim Pengajuan Klaim
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Owner Operations: Mark as Resolved or Delete */}
          {isOwner && (
            <div className="owner-action-box">
              <span className="owner-label">Kelola Laporan Anda:</span>
              <div className="owner-buttons">
                {item.status !== 'resolved' && (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleMarkResolved}
                  >
                    <CheckCircle size={15} /> Tandai Sudah Kembali
                  </button>
                )}
                {onDeleteItem && (
                  <button
                    type="button"
                    className="btn btn--danger-ghost btn--sm"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 size={15} /> Hapus Laporan
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
