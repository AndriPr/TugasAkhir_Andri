import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { ItemClaim } from '../../types';
import { formatDate, getStatusBadge } from '../../utils/helpers';

interface ClaimDetailModalProps {
  claim: ItemClaim | null;
  onClose: () => void;
  onUpdateStatus?: (claimId: string, status: ItemClaim['status']) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  onClose,
  onUpdateStatus,
}) => {
  if (!claim) return null;

  const statusBadge = getStatusBadge(claim.status);

  return (
    <div className="detail-modal-backdrop" onClick={onClose}>
      <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-modal-header">
          <div className="detail-modal-type-tag">
            <span className="badge-tag badge-tag--claim">Detail Pengajuan Klaim</span>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Tutup detail">
            <X size={20} />
          </button>
        </div>

        <div className="detail-modal-body">
          {/* Claim Hero Status */}
          <div className="claim-status-banner">
            <div className="claim-status-icon-wrap">
              {claim.status === 'verified' ? (
                <CheckCircle2 size={32} color="#16a34a" />
              ) : claim.status === 'pending' ? (
                <Clock size={32} color="#0284c7" />
              ) : (
                <AlertCircle size={32} color="#dc2626" />
              )}
            </div>
            <div className="claim-status-info">
              <span
                className="status-badge"
                style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
              >
                {statusBadge.label}
              </span>
              <h3 className="claim-banner-title">{claim.itemTitle}</h3>
              <span className="claim-banner-sub">
                Diajukan pada {formatDate(claim.submittedAt)}
              </span>
            </div>
          </div>

          {/* Verification Notes */}
          {claim.verificationNotes && (
            <div className="detail-section detail-section--notice">
              <div className="section-notice-head">
                <ShieldCheck size={18} />
                <strong>Catatan Petugas Keamanan / Posko:</strong>
              </div>
              <p className="notice-text">{claim.verificationNotes}</p>
            </div>
          )}

          {/* Detail Pemohon & Bukti Ciri */}
          <div className="detail-section">
            <h4 className="section-heading">Informasi Pemohon</h4>
            <div className="claimant-summary-grid">
              <div className="summary-field">
                <span className="field-label">Nama Pemohon:</span>
                <span className="field-value">{claim.claimantName}</span>
              </div>
              <div className="summary-field">
                <span className="field-label">NIM Mahasiswa:</span>
                <span className="field-value">{claim.claimantNim}</span>
              </div>
              <div className="summary-field">
                <span className="field-label">Nomor WhatsApp:</span>
                <span className="field-value">{claim.claimantPhone}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-heading">Bukti Ciri Khusus Yang Diajukan</h4>
            <p className="detail-desc-text">{claim.proofDescription}</p>
          </div>

          {/* Alur Pengambilan Barang */}
          <div className="detail-section detail-section--steps">
            <h4 className="section-heading">Panduan Serah Terima di Kampus</h4>
            <ol className="pickup-steps-list">
              <li>
                <strong>Bawa Kartu Identitas:</strong> Bawa KTM fisik atau KTP asli untuk dicocokkan dengan data pengajuan.
              </li>
              <li>
                <strong>Kunjungi Pos Pengamanan:</strong> Datang ke Pos Satpam Pusat / Rektorat pada hari kerja (08.00 - 16.00 WIB).
              </li>
              <li>
                <strong>Verifikasi Fisik:</strong> Tunjukkan detail klaim ini kepada petugas jaga dan buktikan kepemilikan barang.
              </li>
              <li>
                <strong>Tanda Tangan Berita Acara:</strong> Tandatangani lembar serah terima barang temuan kampus.
              </li>
            </ol>
          </div>

          {/* Simulasi Demo Verifikasi bagi Praktikan/Asisten */}
          {onUpdateStatus && claim.status !== 'completed' && (
            <div className="demo-verification-panel">
              <span className="demo-label">Simulasi Aksi Petugas Posko:</span>
              <div className="demo-buttons">
                {claim.status === 'pending' && (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() =>
                      onUpdateStatus(
                        claim.id,
                        'verified'
                      )
                    }
                  >
                    Setujui Klaim (Verifikasi)
                  </button>
                )}
                {claim.status === 'verified' && (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() =>
                      onUpdateStatus(
                        claim.id,
                        'completed'
                      )
                    }
                  >
                    Selesaikan Serah Terima (Diambil)
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
