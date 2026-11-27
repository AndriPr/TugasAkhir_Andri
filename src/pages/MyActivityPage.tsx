import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Trash2,
  PackageOpen,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CloudUpload,
  CloudOff,
} from 'lucide-react';
import { LostFindItem, ItemClaim } from '../types';
import { useItems } from '../hooks/useItems';
import { useClaims } from '../hooks/useClaims';
import { getUserProfile } from '../services/userService';
import { formatDate, getStatusBadge } from '../utils/helpers';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AnimatedCounter } from '../components/common/MotionPrimitives';
import { getLastSyncError } from '../utils/syncQueue';

interface MyActivityPageProps {
  onSelectItem: (item: LostFindItem) => void;
  onSelectClaim: (claim: ItemClaim) => void;
  onNavigateReport: () => void;
  onDeleteItem: (itemId: string) => void;
  pendingSyncCount?: number;
  isSyncing?: boolean;
  isOffline?: boolean;
  onSyncNow?: () => void;
}

export const MyActivityPage: React.FC<MyActivityPageProps> = ({
  onSelectItem,
  onSelectClaim,
  onNavigateReport,
  onDeleteItem,
  pendingSyncCount = 0,
  isSyncing = false,
  isOffline = false,
  onSyncNow,
}) => {
  const userProfile = getUserProfile();
  const [subTab, setSubTab] = useState<'reports' | 'claims'>('reports');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const lastSyncError = pendingSyncCount > 0 ? getLastSyncError() : '';

  const { items: myItems, loading: itemsLoading, refetch: refetchItems } = useItems({
    userId: userProfile.userId,
  });

  const { claims: myClaims, loading: claimsLoading, refetch: refetchClaims } = useClaims(true);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDeleteItem(deleteTargetId);
      setDeleteTargetId(null);
      setTimeout(() => refetchItems(), 200);
    }
  };

  return (
    <div className="page-container page-enter">
      {/* Bright Sky Header with Animated Stats */}
      <div className="subpage-hero subpage-hero--lost">
        <div className="hero-decor" aria-hidden="true">
          <div className="hero-cloud hero-cloud--1" />
          <div className="hero-cloud hero-cloud--2" />
        </div>
        <div className="subpage-hero__inner">
          <div>
            <span className="hero-pill-badge">
              <Sparkles size={13} /> Riwayat &amp; Progres Verifikasi
            </span>
            <h2 className="subpage-hero__title">Aktivitas Saya</h2>
            <p className="subpage-hero__sub">
              Pantau laporan yang Anda publikasikan serta status klaim barang temuan secara real-time.
            </p>
          </div>
          <div className="hero-stat-pills">
            <div className="hero-mini-stat">
              <strong>
                <AnimatedCounter value={myItems.length} />
              </strong>
              <span>Laporan</span>
            </div>
            <div className="hero-mini-stat">
              <strong>
                <AnimatedCounter value={myClaims.length} />
              </strong>
              <span>Klaim</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Sync Banner when there are pending items in localStorage */}
      {pendingSyncCount > 0 && (
        <div className="sync-banner">
          <div className="sync-banner__left">
            <div className="sync-banner__icon">
              <CloudUpload size={20} className={isSyncing ? 'spin' : ''} />
            </div>
            <div>
              <strong>
                {pendingSyncCount} perubahan offline menunggu di-upload ke database
              </strong>
              <p>
                {isOffline
                  ? 'Akan otomatis diunggah ke Supabase agar terlihat di device lain saat internet aktif kembali.'
                  : lastSyncError
                    ? `Gagal sync terakhir: ${lastSyncError}`
                    : 'Koneksi aktif! Klik tombol di samping untuk langsung mengirim data ke database Supabase.'}
              </p>
            </div>
          </div>
          {onSyncNow && (
            <button
              type="button"
              className="btn btn--cyan-pill btn--sm"
              onClick={onSyncNow}
              disabled={isOffline || isSyncing}
            >
              {isSyncing ? 'Mengunggah…' : 'Upload ke Database'}
            </button>
          )}
        </div>
      )}

      {/* Tripco Dark-Pill Sub Tabs */}
      <div className="explore-pills-row">
        <button
          type="button"
          className={`explore-pill ${subTab === 'reports' ? 'explore-pill--active' : ''}`}
          onClick={() => setSubTab('reports')}
        >
          <FileText size={15} />
          <span>Laporan Saya ({myItems.length})</span>
        </button>

        <button
          type="button"
          className={`explore-pill ${subTab === 'claims' ? 'explore-pill--active' : ''}`}
          onClick={() => setSubTab('claims')}
        >
          <Clock size={15} />
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
            <button type="button" className="btn-pill-outline" onClick={refetchItems}>
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
              <PackageOpen size={38} className="text-muted" />
              <h3>Belum Ada Laporan Yang Dibuat</h3>
              <p>Anda belum pernah mempublikasikan laporan barang hilang atau barang temuan.</p>
              <button
                type="button"
                className="btn btn--cyan-pill"
                onClick={onNavigateReport}
                style={{ marginTop: '12px' }}
              >
                Buat Laporan Sekarang
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {myItems.map((item, idx) => {
                const statusBadge = getStatusBadge(item.status);
                return (
                  <div
                    key={item.id}
                    className="activity-item-card"
                    style={{ '--stagger-i': idx } as React.CSSProperties}
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
                          <span
                            className={`badge-tag ${
                              item.type === 'lost' ? 'badge-tag--lost' : 'badge-tag--found'
                            }`}
                          >
                            {item.type === 'lost' ? 'KEHILANGAN' : 'TEMUAN'}
                          </span>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                          >
                            {statusBadge.label}
                          </span>
                          {item.pendingSync && (
                            <span className="pending-sync-tag pending-sync-tag--inline">
                              <CloudOff size={11} /> Menunggu Sync
                            </span>
                          )}
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
            <button type="button" className="btn-pill-outline" onClick={refetchClaims}>
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
              <ShieldCheck size={38} className="text-muted" />
              <h3>Belum Ada Pengajuan Klaim</h3>
              <p>
                Jika Anda melihat barang Anda pada menu <strong>Ditemukan</strong>, klik barang tersebut lalu pilih &ldquo;Ajukan Klaim Kepemilikan&rdquo;.
              </p>
            </div>
          ) : (
            <div className="activity-list">
              {myClaims.map((claim, idx) => {
                const statusBadge = getStatusBadge(claim.status);
                return (
                  <div
                    key={claim.id}
                    className="activity-item-card"
                    style={{ '--stagger-i': idx } as React.CSSProperties}
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
                          {claim.pendingSync && (
                            <span className="pending-sync-tag pending-sync-tag--inline">
                              <CloudOff size={11} /> Menunggu Sync
                            </span>
                          )}
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
