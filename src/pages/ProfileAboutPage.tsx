import React, { useState } from 'react';
import {
  User,
  Shield,
  Smartphone,
  Save,
  Check,
  RefreshCw,
  Play,
  Info,
  PhoneCall,
  MapPin,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { getUserProfile, saveUserProfile } from '../services/userService';
import { UserProfile } from '../types';

interface ProfileAboutPageProps {
  onReplaySplash: () => void;
}

export const ProfileAboutPage: React.FC<ProfileAboutPageProps> = ({ onReplaySplash }) => {
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const [name, setName] = useState<string>(profile.name);
  const [nim, setNim] = useState<string>(profile.nim);
  const [phone, setPhone] = useState<string>(profile.phone);
  const [email, setEmail] = useState<string>(profile.email);
  const [feedback, setFeedback] = useState<string>('');

  const [activeSection, setActiveSection] = useState<'profile' | 'about' | 'posko'>('profile');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserProfile({
      name: name.trim(),
      nim: nim.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    setProfile(updated);
    setFeedback('Profil mahasiswa berhasil disimpan.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm('Bersihkan data cache lokal aplikasi? Data seed akan dimuat ulang.')) {
      localStorage.removeItem('lostfind_local_items');
      localStorage.removeItem('lostfind_local_claims');
      window.location.reload();
    }
  };

  return (
    <div className="page-container">
      {/* Masthead */}
      <section className="page-masthead">
        <div className="page-masthead__content">
          <span className="page-subtitle-badge">Identitas Praktikan &amp; Informasi Sistem</span>
          <h2 className="page-title">Profil &amp; Tentang LostFind</h2>
          <p className="page-lede">
            Aplikasi PWA Tugas Akhir Praktikum Pengembangan Perangkat Bergerak (PPB) Universitas Diponegoro.
          </p>
        </div>
      </section>

      {/* Nav Pills Section */}
      <div className="profile-subnav">
        <button
          type="button"
          className={`pill ${activeSection === 'profile' ? 'pill--active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <User size={14} /> Profil Praktikan
        </button>
        <button
          type="button"
          className={`pill ${activeSection === 'about' ? 'pill--active' : ''}`}
          onClick={() => setActiveSection('about')}
        >
          <Info size={14} /> Tentang LostFind
        </button>
        <button
          type="button"
          className={`pill ${activeSection === 'posko' ? 'pill--active' : ''}`}
          onClick={() => setActiveSection('posko')}
        >
          <PhoneCall size={14} /> Posko Keamanan Kampus
        </button>
      </div>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* SECTION 1: PROFIL PRAKTIKAN */}
      {activeSection === 'profile' && (
        <div className="profile-section-wrap">
          {/* Student Card */}
          <div className="student-profile-card">
            <div className="student-card-glow" />
            <div className="student-card-content">
              <div className="student-avatar-wrap">
                <div className="student-avatar">
                  <User size={40} className="text-primary" />
                </div>
                <div className="avatar-online-dot" />
              </div>

              <div className="student-details">
                <span className="student-tag">Praktikan Pengembang</span>
                <h3 className="student-name">{profile.name}</h3>
                <div className="student-meta-row">
                  <span className="student-nim-badge">NIM: {profile.nim}</span>
                  <span className="student-major">{profile.programStudi}</span>
                </div>
                <p className="student-desc">
                  Pengembang sistem LostFind: Progressive Web App (PWA) berbasis TypeScript, React, dan RESTful API Web Service.
                </p>
              </div>
            </div>
          </div>

          {/* Form Edit Profil */}
          <form onSubmit={handleSaveProfile} className="profile-form-card">
            <h4 className="form-card-title">Pengaturan Identitas Akun</h4>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIM (Nomor Induk Mahasiswa)</label>
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Mahasiswa</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-actions-bar">
              <button type="submit" className="btn btn--primary">
                <Save size={16} /> Simpan Perubahan Profil
              </button>
            </div>
          </form>

          {/* System Control Card */}
          <div className="system-control-card">
            <h4 className="form-card-title">Pintasan Sistem &amp; PWA</h4>
            <div className="system-buttons-row">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={onReplaySplash}
                title="Putar ulang intro splash screen"
              >
                <Play size={14} /> Putar Ulang Splash Screen
              </button>
              <button
                type="button"
                className="btn btn--danger-ghost btn--sm"
                onClick={handleClearCache}
                title="Reset cache lokal aplikasi"
              >
                <RefreshCw size={14} /> Reset Cache Lokal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TENTANG LOSTFIND */}
      {activeSection === 'about' && (
        <div className="about-section-wrap">
          <div className="about-feature-box">
            <div className="about-feature-head">
              <div className="feature-icon-badge">
                <Shield size={24} />
              </div>
              <div>
                <h3>Tentang LostFind Kampus</h3>
                <span className="about-sub">Solusi Terpadu Penanganan Barang Hilang &amp; Temuan</span>
              </div>
            </div>
            <p className="about-text">
              <strong>LostFind</strong> adalah aplikasi Progressive Web App (PWA) yang dirancang khusus untuk memfasilitasi pelaporan barang hilang dan publikasi barang temuan di seluruh lingkungan kampus. Aplikasi ini mengintegrasikan komunikasi langsung antara penemu dan pemilik melalui WhatsApp, dilengkapi dengan alur verifikasi klaim kepemilikan oleh pos pengamanan kampus.
            </p>
          </div>

          <div className="architecture-grid">
            <div className="arch-card">
              <div className="arch-card-icon">
                <Smartphone size={20} />
              </div>
              <h4>Progressive Web App (PWA)</h4>
              <p>
                Dapat diinstal langsung di layar beranda smartphone (Android/iOS) dan laptop tanpa melalui Play Store, mendukung pengoperasian offline melalui Service Worker cache.
              </p>
            </div>

            <div className="arch-card">
              <div className="arch-card-icon">
                <Layers size={20} />
              </div>
              <h4>RESTful API Web Service</h4>
              <p>
                Dibangun menggunakan Node.js dan Express.js dengan arsitektur MVC (Model, Controller, Routes), mendukung database cloud Supabase/PostgreSQL dan offline-first synchronization.
              </p>
            </div>

            <div className="arch-card">
              <div className="arch-card-icon">
                <ShieldCheck size={20} />
              </div>
              <h4>Verifikasi Klaim Transparan</h4>
              <p>
                Pemilik barang temuan dapat mengajukan bukti dan ciri-ciri unik secara online untuk diverifikasi oleh staf keamanan sebelum proses serah terima fisik dilakukan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: POSKO KEAMANAN KAMPUS */}
      {activeSection === 'posko' && (
        <div className="posko-section-wrap">
          <div className="posko-card">
            <div className="posko-head">
              <MapPin size={22} className="text-primary" />
              <div>
                <h4>Pos Pengamanan &amp; Satpam Utama Gerbang Barat</h4>
                <span>Pusat Penyimpanan Barang Temuan Berharga (Laptop, HP, Dompet)</span>
              </div>
            </div>
            <div className="posko-body">
              <div className="posko-row">
                <Clock size={16} />
                <span>Jam Pelayanan: Senin - Jumat (08.00 - 16.30 WIB)</span>
              </div>
              <div className="posko-row">
                <PhoneCall size={16} />
                <span>Hotline Satpam: (024) 7460024 / 0812-3456-7890</span>
              </div>
            </div>
          </div>

          <div className="posko-card">
            <div className="posko-head">
              <MapPin size={22} className="text-primary" />
              <div>
                <h4>Sekretariat BEM / Layanan Kemahasiswaan</h4>
                <span>Penyimpanan Perlengkapan Harian (Tumbler, Jaket, Helm, Buku)</span>
              </div>
            </div>
            <div className="posko-body">
              <div className="posko-row">
                <Clock size={16} />
                <span>Jam Operasional: Senin - Sabtu (09.00 - 17.00 WIB)</span>
              </div>
              <div className="posko-row">
                <PhoneCall size={16} />
                <span>Kontak Layanan: 0878-1122-3344</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
