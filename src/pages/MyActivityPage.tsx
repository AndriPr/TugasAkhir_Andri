import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  PackageOpen,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { LostFindItem, ItemClaim } from '../types';
import { useItems } from '../hooks/useItems';
import { useClaims } from '../hooks/useClaims';
import { getUserProfile } from '../services/userService';
import { formatDate, getStatusBadge } from '../utils/helpers';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface MyActivityPageProps {
  onSelectItem: (item: LostFindItem) => void;
  onSelectClaim: (claim: ItemClaim) => void;
  onNavigateReport: () => void;
  onDeleteItem: (itemId: string) => void;
}

export const MyActivityPage: React.FC<MyActivityPageProps> = ({
  onSelectItem,
  onSelectClaim,
  onNavigateReport,
  onDeleteItem,
}) => {
  const userProfile = getUserProfile();
  const [subTab, setSubTab] = useState<'reports' | 'claims'>('reports');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Fetch Laporan Saya
  const { items: myItems, loading: itemsLoading, refetch: refetchItems } = useItems({
    userId: userProfile.userId,
  });

  // Fetch Klaim Saya
  const { claims: myClaims, loading: claimsLoading, refetch: refetchClaims } = useClaims(true);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDeleteItem(deleteTargetId);
      setDeleteTargetId(null);
      setTimeout(() => refetchItems(), 200);
    }
  };

  return (
    <div className="page-container">
      {/* Masthead */}
      <section className="page-masthead">
        <div className="page-masthead__content">
          <span className="page-subtitle-badge">Riwayat &amp; Status Pengajuan</span>
          <h2 className="page-title">Aktivitas Saya</h2>
          <p className="page-lede">
            Kelola laporan kehilangan/penemuan yang telah Anda buat, serta pantau status verifikasi klaim kepemilikan barang Anda.
          </p>
        </div>
      </section>

      {/* Sub Tabs */}
      <div className="activity-tabs-nav">
        <button
          type="button"
          className={`activity-tab-btn ${subTab === 'reports' ? 'activity-tab-btn--active' : ''}`}
          onClick={() => setSubTab('reports')}
        >
          <FileText size={16} />
          <span>Laporan Saya ({myItems.length})</span>
        </button>

        <button
          type="button"
          className={`activity-tab-btn ${subTab === 'claims' ? 'activity-tab-btn--active' : ''}`}
          onClick={() => setSubTab('claims')}
        >
          <Clock size={16} />
          <span>Klaim Saya ({myClaims.length})</span>
        </button>
      </div>

      {/* TAB 1: LAPORAN SAYA */}
      {subTab === 'reports' && (
        <div className="activity-content">
          <div className="list-meta-bar">
            <span className="list-count">
              <strong>{myItems.length}</strong> laporan aktif yang Anda publikasikan
            </span>
            <button type="button" className="btn-refresh" onClick={refetchItems}>
              <RefreshCw size={14} className={itemsLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {itemsLoading && myItems.length === 0 ? (
            <div className="state-box">
              <p>Memuat laporan Anda…</p>
            </div>
          ) : myItems.length === 0 ? (
            <div className="state-box">
              <PackageOpen size={36} className="text-muted" />
              <h3>Belum Ada Laporan Yang Dibuat</h3>
              <p>Anda belum pernah mempublikasikan laporan barang hilang atau barang temuan.</p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={onNavigateReport}
                style={{ marginTop: '12px' }}
              >
                Buat Laporan Sekarang
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {myItems.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                return (
                  <div
                    key={item.id}
                    className="activity-item-card"
                    onClick={() => onSelectItem(item)}
                  >
                    <div className="activity-card-left">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="activity-item-thumb"
                      />
                      <div className="activity-item-info">
                        <div className="activity-item-tags">
                          <span className={`badge-tag ${item.type === 'lost' ? 'badge-tag--lost' : 'badge-tag--found'}`}>
                            {item.type === 'lost' ? 'KEHILANGAN' : 'TEMUAN'}
                          </span>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                        <h4 className="activity-item-title">{item.title}</h4>
                        <span className="activity-item-meta">
                          {item.location} • {formatDate(item.date)}
                        </span>
                      </div>
                    </div>

                    <div className="activity-card-right">
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(item.id);
                        }}
                        title="Hapus laporan ini"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="activity-arrow">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KLAIM SAYA */}
      {subTab === 'claims' && (
        <div className="activity-content">
          <div className="list-meta-bar">
            <span className="list-count">
              <strong>{myClaims.length}</strong> permohonan klaim kepemilikan
            </span>
            <button type="button" className="btn-refresh" onClick={refetchClaims}>
              <RefreshCw size={14} className={claimsLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {claimsLoading && myClaims.length === 0 ? (
            <div className="state-box">
              <p>Memuat riwayat klaim Anda…</p>
            </div>
          ) : myClaims.length === 0 ? (
            <div className="state-box">
              <ShieldCheck size={36} className="text-muted" />
              <h3>Belum Ada Pengajuan Klaim</h3>
              <p>Jika Anda melihat barang Anda pada menu <strong>Barang Ditemukan</strong>, klik barang tersebut lalu pilih "Ajukan Klaim Kepemilikan".</p>
            </div>
          ) : (
            <div className="activity-list">
              {myClaims.map((claim) => {
                const statusBadge = getStatusBadge(claim.status);
                return (
                  <div
                    key={claim.id}
                    className="activity-item-card"
                    onClick={() => onSelectClaim(claim)}
                  >
                    <div className="activity-card-left">
                      <div className="activity-item-info">
                        <div className="activity-item-tags">
                          <span
                            className="status-badge"
                            style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                          >
                            {statusBadge.label}
                          </span>
                          <span className="meta-date">
                            Diajukan: {formatDate(claim.submittedAt)}
                          </span>
                        </div>
                        <h4 className="activity-item-title">{claim.itemTitle}</h4>
                        <p className="claim-proof-snippet">
                          <strong>Ciri yang diajukan:</strong> {claim.proofDescription}
                        </p>
                        {claim.verificationNotes && (
                          <div className="claim-note-box">
                            <strong>Catatan Petugas:</strong> {claim.verificationNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="activity-card-right">
                      <div className="activity-arrow">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title="Hapus Laporan Ini?"
        message="Laporan yang dihapus tidak dapat dipulihkan kembali dari sistem LostFind."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
