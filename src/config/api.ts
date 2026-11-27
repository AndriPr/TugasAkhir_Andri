import axios from 'axios';

// ---------------------------------------------------------------------------
// API Client Configuration (Sesuai Modul 1 / Modul 2 & BAB VI PWA)
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 detik timeout untuk jaringan lambat & serverless cold start
});

// Response interceptor — unwrap response and normalise errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan pada server';
    let status = null;

    if (error.response) {
      status = error.response.status;
      message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Kesalahan server (${status})`;
    } else if (error.request) {
      message = 'Tidak dapat menghubungi server. Mode offline aktif.';
    } else {
      message = error.message || message;
    }

    return Promise.reject({
      message,
      status,
      raw: error.response?.data,
    });
  }
);

export { BASE_URL };
