const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/status', (req, res) => {
  const statusSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('absensi_status');
  const messageSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('absensi_message');
  res.json({ 
    status: statusSetting ? statusSetting.value : 'ON',
    message: messageSetting ? messageSetting.value : 'Absensi OFF, hubungi admin di +6281243397116'
  });
});

router.get('/programs', (req, res) => {
  const programs = db.prepare('SELECT * FROM programs ORDER BY name').all();
  res.json(programs);
});

router.post('/submit', (req, res) => {
  const statusSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('absensi_status');
  if (statusSetting && statusSetting.value === 'OFF') {
    const messageSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('absensi_message');
    return res.json({ 
      success: false, 
      message: messageSetting ? messageSetting.value : 'Absensi OFF, hubungi admin di +6281243397116' 
    });
  }

  const {
    program_id,
    nama,
    jenis_kelamin,
    pendidikan,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    kabupaten,
    nomor_hp,
    nik,
    email,
    signature
  } = req.body;

  if (!/^\d{16}$/.test(nik)) {
    return res.json({ success: false, message: 'NIK harus 16 digit angka' });
  }

  const today = new Date().toISOString().split('T')[0];
  const existingAttendance = db.prepare(
    `SELECT * FROM attendances WHERE nik = ? AND DATE(created_at) = ?`
  ).get(nik, today);

  if (existingAttendance) {
    return res.json({ 
      success: false, 
      message: 'Anda sudah melakukan absensi hari ini' 
    });
  }

  const convertedHP = nomor_hp.startsWith('08') 
    ? nomor_hp.replace(/^08/, '+62') 
    : nomor_hp;

  try {
    db.prepare(`
      INSERT INTO attendances (
        program_id, nama, jenis_kelamin, pendidikan, tempat_lahir, 
        tanggal_lahir, alamat, kabupaten, nomor_hp, nik, email, signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      program_id, nama, jenis_kelamin, pendidikan, tempat_lahir,
      tanggal_lahir, alamat, kabupaten, convertedHP, nik, email, signature
    );

    res.json({ success: true, message: 'Absensi berhasil disimpan' });
  } catch (error) {
    res.json({ success: false, message: 'Gagal menyimpan absensi: ' + error.message });
  }
});

module.exports = router;
