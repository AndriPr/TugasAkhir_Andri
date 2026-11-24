import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runDatabaseTest() {
  console.log('\n======================================================');
  console.log('🧪 PENGUJIAN DATABASE & API RESTFUL - LOSTFIND');
  console.log('👤 Pengembang: Andri Pratama (21120124140134)');
  console.log('======================================================\n');

  try {
    // 1. Cek Server & Status Database
    console.log('1️⃣  Memeriksa Status Koneksi Server...');
    const rootRes = await axios.get(BASE_URL);
    console.log('   ✅ Server Aktif! Status:', rootRes.data.status);
    console.log('   ℹ️  Nama Aplikasi:', rootRes.data.app);

    // 2. Cek Tabel Kategori (categories)
    console.log('\n2️⃣  Mengambil Data Tabel Kategori (/api/categories)...');
    const catRes = await axios.get(`${BASE_URL}/categories`);
    console.log(`   ✅ Ditemukan ${catRes.data.data?.length || 0} kategori barang.`);
    if (catRes.data.data?.length > 0) {
      console.log('   📋 Contoh Kategori:', catRes.data.data.map((c: any) => c.name).join(', '));
    }

    // 3. Cek Tabel Barang (items)
    console.log('\n3️⃣  Mengambil Data Tabel Barang (/api/items)...');
    const itemRes = await axios.get(`${BASE_URL}/items`);
    console.log(`   ✅ Ditemukan ${itemRes.data.data?.length || 0} laporan barang kampus.`);

    // 4. Test CRUD: Tambah Barang Uji Coba (POST)
    console.log('\n4️⃣  Menguji INSERT Data Baru (POST /api/items)...');
    const testPayload = {
      title: 'Uji Coba Database - Flashdisk SanDisk 64GB',
      type: 'found',
      category: 'Elektronik',
      location: 'Lab Komputer Lt. 2',
      date: new Date().toISOString().split('T')[0],
      time: '18:40 WIB',
      description: 'Barang uji coba otomatis untuk validasi database sistem.',
      imageUrl: '/presets/laptop.svg',
      contactName: 'Andri Pratama',
      contactPhone: '081234567890',
      status: 'open',
      securedAt: 'Pos Pengamanan',
      userId: 'test-user-andri',
    };

    const postRes = await axios.post(`${BASE_URL}/items`, testPayload);
    const createdId = postRes.data.data?.id;
    console.log('   ✅ Berhasil INSERT! ID baru:', createdId);

    // 5. Test CRUD: Baca Data yang Baru Dimasukkan (GET by ID)
    console.log(`\n5️⃣  Menguji SELECT Data Berdasarkan ID (GET /api/items/${createdId})...`);
    const getSingleRes = await axios.get(`${BASE_URL}/items/${createdId}`);
    console.log('   ✅ Data berhasil dibaca:', getSingleRes.data.data?.title);

    // 6. Test CRUD: Update Data (PUT)
    console.log(`\n6️⃣  Menguji UPDATE Data (PUT /api/items/${createdId})...`);
    await axios.put(`${BASE_URL}/items/${createdId}`, {
      status: 'resolved',
      description: 'Deskripsi telah diperbarui melalui pengujian database.',
    });
    console.log('   ✅ Status barang berhasil diubah menjadi: "resolved" (Selesai).');

    // 7. Test CRUD: Hapus Data Uji Coba (DELETE)
    console.log(`\n7️⃣  Menguji DELETE Data Pembersihan (DELETE /api/items/${createdId})...`);
    await axios.delete(`${BASE_URL}/items/${createdId}`);
    console.log('   ✅ Data uji coba berhasil dihapus dan dibersihkan dari database.');

    // 8. Cek Statistik Ringkasan
    console.log('\n8️⃣  Mengambil Statistik Database (/api/items/stats)...');
    const statsRes = await axios.get(`${BASE_URL}/items/stats`);
    console.log('   📊 Statistik Saat Ini:');
    console.log('      • Total Barang   :', statsRes.data.data.total);
    console.log('      • Barang Hilang  :', statsRes.data.data.lost);
    console.log('      • Barang Temuan  :', statsRes.data.data.found);
    console.log('      • Selesai Kembali:', statsRes.data.data.resolved);

    console.log('\n======================================================');
    console.log('🎉 SEMUA PENGUJIAN DATABASE & API BERHASIL 100%!');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('\n❌ Gagal terhubung ke API / Database.');
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 Pastikan server API sedang berjalan dengan perintah: npm run server');
    } else {
      console.error('Detail Error:', err.response?.data || err.message);
    }
    process.exit(1);
  }
}

runDatabaseTest();
