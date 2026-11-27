import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader,
  Save,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  ShieldCheck,
  Award,
  Search,
  PackageCheck,
} from 'lucide-react';
import { ItemType, LostFindItem } from '../types';
import { INITIAL_CATEGORIES, CAMPUS_LOCATIONS } from '../utils/initialData';
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage';
import { itemService } from '../services/itemService';
import { getUserProfile } from '../services/userService';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface ReportPageProps {
  onSuccess: (newItem: LostFindItem) => void;
  onCancel: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ onSuccess, onCancel }) => {
  const userProfile = getUserProfile();

  const [reportType, setReportType] = useState<ItemType>('lost');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Elektronik');
  const [location, setLocation] = useState<string>('Perpustakaan Pusat');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('12:00 WIB');
  const [description, setDescription] = useState<string>('');
  const [securedAt, setSecuredAt] = useState<string>('Pos Satpam Utama');
  const [rewardInfo, setRewardInfo] = useState<string>('');
  const [contactName, setContactName] = useState<string>(userProfile.name);
  const [contactPhone, setContactPhone] = useState<string>(userProfile.phone);
  const [imageUrl, setImageUrl] = useState<string>('/presets/laptop.svg');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const [showDraftModal, setShowDraftModal] = useState<boolean>(() => hasDraft('report'));
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(() =>
    getDraftTimestamp('report')
  );

  const PRESET_IMAGES = [
    { label: 'Laptop', url: '/presets/laptop.svg' },
    { label: 'KTM / Kartu', url: '/presets/ktm.svg' },
    { label: 'Kunci', url: '/presets/kunci.svg' },
    { label: 'Dompet', url: '/presets/dompet.svg' },
    { label: 'Tumbler', url: '/presets/botol.svg' },
    { label: 'Helm', url: '/presets/helm.svg' },
  ];

  const handleSaveDraft = useCallback(
    (showNotification: boolean = true) => {
      const draftPayload = {
        reportType,
        title,
        category,
        location,
        customLocation,
        date,
        time,
        description,
        securedAt,
        rewardInfo,
        contactName,
        contactPhone,
        imageUrl,
      };

      const saved = saveDraft(draftPayload, 'report');
      if (saved) {
        const ts = getDraftTimestamp('report');
        setDraftTimestamp(ts);
        if (showNotification) {
          setSuccessToast(`Draf formulir tersimpan (${formatDraftTime(ts)})`);
          setTimeout(() => setSuccessToast(''), 3000);
        }
      }
    },
    [
      reportType,
      title,
      category,
      location,
      customLocation,
      date,
      time,
      description,
      securedAt,
      rewardInfo,
      contactName,
      contactPhone,
      imageUrl,
    ]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (title.trim() || description.trim()) {
        handleSaveDraft(false);
      }
    }, 25000);
    return () => clearInterval(timer);
  }, [handleSaveDraft, title, description]);

  const handleLoadDraft = () => {
    const draft = loadDraft('report');
    if (draft) {
      if (draft.reportType) setReportType(draft.reportType);
      if (draft.title) setTitle(draft.title);
      if (draft.category) setCategory(draft.category);
      if (draft.location) setLocation(draft.location);
      if (draft.customLocation) setCustomLocation(draft.customLocation);
      if (draft.date) setDate(draft.date);
      if (draft.time) setTime(draft.time);
      if (draft.description) setDescription(draft.description);
      if (draft.securedAt) setSecuredAt(draft.securedAt);
      if (draft.rewardInfo) setRewardInfo(draft.rewardInfo);
      if (draft.contactName) setContactName(draft.contactName);
      if (draft.contactPhone) setContactPhone(draft.contactPhone);
      if (draft.imageUrl) setImageUrl(draft.imageUrl);

      setShowDraftModal(false);
      setSuccessToast('Draf sebelumnya berhasil dipulihkan.');
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  const handleDiscardDraft = () => {
    deleteDraft('report');
    setShowDraftModal(false);
    setDraftTimestamp(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto maksimal 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Nama barang minimal 3 karakter.');
      return;
    }

    const finalLocation =
      location === 'Lainnya (Tulis Spesifik)' && customLocation.trim()
        ? customLocation.trim()
        : location;

    if (!finalLocation.trim() || finalLocation === 'Semua Lokasi') {
      setErrorMessage('Pilih atau tuliskan lokasi kejadian yang spesifik.');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMessage('Nomor telepon/WhatsApp wajib diisi.');
      return;
    }

    const payload: Partial<LostFindItem> = {
      title: title.trim(),
      type: reportType,
      category,
      location: finalLocation,
      date,
      time,
      description:
        description.trim() ||
        `Laporan ${reportType === 'lost' ? 'kehilangan' : 'penemuan'} ${title}.`,
      imageUrl: imageUrl || '/presets/laptop.svg',
      contactName: contactName.trim() || userProfile.name,
      contactPhone: contactPhone.trim(),
      status: 'open',
      rewardInfo: reportType === 'lost' && rewardInfo.trim() ? rewardInfo.trim() : undefined,
      securedAt: reportType === 'found' ? securedAt.trim() : undefined,
      userId: userProfile.userId,
    };

    try {
      setSubmitting(true);
      const res = await itemService.createItem(payload);
      if (res.success && res.data) {
        deleteDraft('report');
        onSuccess(res.data);
      } else {
        throw new Error('Gagal menyimpan laporan.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses laporan ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container page-enter">
      {/* Bright Sky Header Banner */}
      <div className={`subpage-hero subpage-hero--${reportType}`}>
        <div className="hero-decor" aria-hidden="true">
          <div className="hero-cloud hero-cloud--1" />
          <div className="hero-cloud hero-cloud--2" />
        </div>
        <div className="subpage-hero__inner">
          <div>
            <span className="hero-pill-badge">
              <Sparkles size={13} /> Auto-Save Draft Aktif
            </span>
            <h2 className="subpage-hero__title">Buat Laporan Kampus</h2>
            <p className="subpage-hero__sub">
              Publikasikan informasi barang hilang atau barang temuan agar segera menemukan pemiliknya.
            </p>
          </div>
          <button
            type="button"
            className="btn-glass-white"
            onClick={() => handleSaveDraft(true)}
            title="Simpan draf secara manual"
          >
            <Save size={15} />
            <span>Simpan Draf</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="toast toast--error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successToast && (
        <div className="toast toast--success">
          <CheckCircle size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Animated Type Selector Cards */}
      <div className="report-type-toggle">
        <button
          type="button"
          className={`toggle-btn ${reportType === 'lost' ? 'toggle-btn--active-lost' : ''}`}
          onClick={() => setReportType('lost')}
        >
          <div className="toggle-btn__icon-circle toggle-btn__icon-circle--lost">
            <Search size={18} />
          </div>
          <div className="toggle-btn__text">
            <strong>Saya Kehilangan Barang</strong>
            <span>Barang saya tercecer di lingkungan kampus</span>
          </div>
        </button>

        <button
          type="button"
          className={`toggle-btn ${reportType === 'found' ? 'toggle-btn--active-found' : ''}`}
          onClick={() => setReportType('found')}
        >
          <div className="toggle-btn__icon-circle toggle-btn__icon-circle--found">
            <PackageCheck size={18} />
          </div>
          <div className="toggle-btn__text">
            <strong>Saya Menemukan Barang</strong>
            <span>Saya mengamankan barang temuan di kampus</span>
          </div>
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="report-form-card">
        {/* Section 1 */}
        <div className="form-section">
          <div className="form-section-head">
            <span className="step-chip step-chip--cyan">01</span>
            <h3 className="form-section-title">Identitas &amp; Foto Barang</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Nama / Judul Barang *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: KTM Undip Teknik, Laptop ASUS Vivobook, Kunci Vario…"
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategori Barang *</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === 'Dokumen & Kartu') setImageUrl('/presets/ktm.svg');
                  else if (e.target.value === 'Elektronik') setImageUrl('/presets/laptop.svg');
                  else if (e.target.value === 'Kunci & Aksesoris') setImageUrl('/presets/kunci.svg');
                  else if (e.target.value === 'Tas & Dompet') setImageUrl('/presets/dompet.svg');
                  else if (e.target.value === 'Pakaian & Perlengkapan') setImageUrl('/presets/botol.svg');
                }}
                className="form-select"
              >
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Gambar / Unggah Foto</label>
              <div className="image-preview-bar">
                <img src={imageUrl} alt="Preview" className="img-thumb-preview" />
                <label htmlFor="file-image-input" className="btn btn--outline btn--sm">
                  <Upload size={14} /> Unggah Foto
                  <input
                    id="file-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Visual Preset Cards */}
          <div className="preset-choice-wrap">
            <span className="preset-choice-label">Atau pilih ilustrasi cepat:</span>
            <div className="preset-visual-grid">
              {PRESET_IMAGES.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  className={`preset-visual-card ${
                    imageUrl === p.url ? 'preset-visual-card--active' : ''
                  }`}
                  onClick={() => setImageUrl(p.url)}
                >
                  <img src={p.url} alt={p.label} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="form-section">
          <div className="form-section-head">
            <span className="step-chip step-chip--sky">02</span>
            <h3 className="form-section-title">Lokasi &amp; Waktu Kejadian</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} /> Lokasi Kampus *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-select"
              >
                {CAMPUS_LOCATIONS.filter((l) => l !== 'Semua Lokasi').map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="Lainnya (Tulis Spesifik)">Lokasi Lainnya (Tulis Spesifik)</option>
              </select>
            </div>

            {location === 'Lainnya (Tulis Spesifik)' && (
              <div className="form-group">
                <label className="form-label">Tuliskan Lokasi Spesifik *</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Misal: Gazebo Depan Dekanat, Musholla Lt. 1…"
                  className="form-input"
                  required
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} /> Tanggal Kejadian *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={14} /> Perkiraan Waktu / Jam
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Contoh: 14:30 WIB"
                className="form-input"
              />
            </div>
          </div>

          {reportType === 'found' && (
            <div className="form-group">
              <label className="form-label">
                <ShieldCheck size={14} /> Lokasi Barang Diamankan Saat Ini *
              </label>
              <input
                type="text"
                value={securedAt}
                onChange={(e) => setSecuredAt(e.target.value)}
                placeholder="Contoh: Pos Satpam Utama Gerbang Barat / Ruang BEM"
                className="form-input"
                required
              />
              <span className="form-hint">
                Tuliskan tempat barang disimpan agar pemilik tahu lokasi pengambilan.
              </span>
            </div>
          )}

          {reportType === 'lost' && (
            <div className="form-group">
              <label className="form-label">
                <Award size={14} /> Apresiasi / Tanda Terima Kasih (Opsional)
              </label>
              <input
                type="text"
                value={rewardInfo}
                onChange={(e) => setRewardInfo(e.target.value)}
                placeholder="Contoh: Traktir kopi, uang terima kasih Rp 100.000…"
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Deskripsi Lengkap &amp; Ciri-Ciri Khusus</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan warna, tanda khusus, goresan, stiker, atau kronologi singkat…"
              className="form-textarea"
            />
          </div>
        </div>

        {/* Section 3 */}
        <div className="form-section">
          <div className="form-section-head">
            <span className="step-chip step-chip--mint">03</span>
            <h3 className="form-section-title">Informasi Kontak Pelapor</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <User size={14} /> Nama Lengkap / Panggilan *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={14} /> Nomor WhatsApp / Telepon *
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="081234567890"
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn--cyan-pill"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader size={18} className="spin" /> Mempublikasikan…
              </>
            ) : (
              'Kirim & Terbitkan Laporan'
            )}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showDraftModal}
        title="Lanjutkan Draf Laporan Sebelumnya?"
        message={`Ditemukan draf laporan yang belum terselesaikan dari ${
          draftTimestamp ? formatDraftTime(draftTimestamp) : 'sesi sebelumnya'
        }. Apakah Anda ingin memulihkan draf tersebut?`}
        confirmLabel="Pulihkan Draf"
        cancelLabel="Hapus Draf"
        onConfirm={handleLoadDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  );
};
