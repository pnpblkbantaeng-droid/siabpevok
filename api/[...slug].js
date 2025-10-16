// api/[...slug].js
import express from 'express';
import { getAbsensi, tambahAbsensi } from '../database.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Route utama
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

// API: Ambil data
app.get('/api/absensi', async (req, res) => {
  try {
    const data = await getAbsensi();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data' });
  }
});

// API: Tambah data
app.post('/api/absensi', async (req, res) => {
  try {
    const { nama, kelas } = req.body;
    if (!nama || !kelas) {
      return res.status(400).json({ error: 'Nama dan kelas wajib diisi' });
    }
    const data = await tambahAbsensi(nama, kelas);
    res.status(201).json({ message: 'Berhasil absen!', data });
  } catch (err) {
    res.status(500).json({ error: 'Gagal simpan data' });
  }
});

// Handler untuk Vercel
export default async (req, res) => {
  return new Promise((resolve) => {
    app(req, res, () => {
      res.status(404).send('Route tidak ditemukan');
      resolve();
    });
  });
};