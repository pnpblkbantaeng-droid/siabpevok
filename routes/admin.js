const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const { isAuthenticated } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const csvParser = require('csv-parser');
const multer = require('multer');
const { google } = require('googleapis');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/programs', isAuthenticated, (req, res) => {
  const programs = db.prepare('SELECT * FROM programs ORDER BY created_at DESC').all();
  res.json(programs);
});

router.post('/programs', isAuthenticated, (req, res) => {
  const { name } = req.body;
  try {
    const result = db.prepare('INSERT INTO programs (name) VALUES (?)').run(name);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.put('/programs/:id', isAuthenticated, (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  try {
    db.prepare('UPDATE programs SET name = ? WHERE id = ?').run(name, id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.delete('/programs/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM programs WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get('/users', isAuthenticated, (req, res) => {
  const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.post('/users', isAuthenticated, (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.put('/users/:id', isAuthenticated, (req, res) => {
  const { username, password } = req.body;
  const { id } = req.params;
  try {
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, hashedPassword, id);
    } else {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, id);
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.session.user.id) {
    return res.json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
  }
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get('/attendances', isAuthenticated, (req, res) => {
  const { search, program, date } = req.query;
  let query = `
    SELECT a.*, p.name as program_name 
    FROM attendances a 
    LEFT JOIN programs p ON a.program_id = p.id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (a.nama LIKE ? OR a.nik LIKE ? OR a.email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (program) {
    query += ` AND a.program_id = ?`;
    params.push(program);
  }

  if (date) {
    query += ` AND DATE(a.created_at) = ?`;
    params.push(date);
  }

  query += ` ORDER BY a.created_at DESC`;

  const attendances = db.prepare(query).all(...params);
  res.json(attendances);
});

router.get('/attendances/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const attendance = db.prepare(`
    SELECT a.*, p.name as program_name 
    FROM attendances a 
    LEFT JOIN programs p ON a.program_id = p.id 
    WHERE a.id = ?
  `).get(id);
  res.json(attendance);
});

router.put('/attendances/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
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
    created_at
  } = req.body;

  try {
    db.prepare(`
      UPDATE attendances SET
        program_id = ?, nama = ?, jenis_kelamin = ?, pendidikan = ?,
        tempat_lahir = ?, tanggal_lahir = ?, alamat = ?, kabupaten = ?,
        nomor_hp = ?, nik = ?, email = ?, created_at = ?
      WHERE id = ?
    `).run(
      program_id, nama, jenis_kelamin, pendidikan, tempat_lahir,
      tanggal_lahir, alamat, kabupaten, nomor_hp, nik, email, created_at, id
    );
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.delete('/attendances/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM attendances WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get('/statistics', isAuthenticated, (req, res) => {
  const totalAttendances = db.prepare('SELECT COUNT(*) as count FROM attendances').get().count;
  const totalPrograms = db.prepare('SELECT COUNT(*) as count FROM programs').get().count;
  const todayAttendances = db.prepare(`
    SELECT COUNT(*) as count FROM attendances WHERE DATE(created_at) = DATE('now')
  `).get().count;

  const byProgram = db.prepare(`
    SELECT p.name, COUNT(a.id) as count
    FROM programs p
    LEFT JOIN attendances a ON p.id = a.program_id
    GROUP BY p.id, p.name
  `).all();

  res.json({
    totalAttendances,
    totalPrograms,
    todayAttendances,
    byProgram
  });
});

router.get('/settings', isAuthenticated, (req, res) => {
  const status = db.prepare('SELECT value FROM settings WHERE key = ?').get('absensi_status');
  const message = db.prepare('SELECT value FROM settings WHERE key = ?').get('absensi_message');
  res.json({ 
    absensi_status: status ? status.value : 'ON',
    absensi_message: message ? message.value : 'Absensi OFF, hubungi admin di +6281243397116'
  });
});

router.post('/settings', isAuthenticated, (req, res) => {
  const { absensi_status, absensi_message } = req.body;
  try {
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(absensi_status, 'absensi_status');
    if (absensi_message) {
      db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(absensi_message, 'absensi_message');
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get('/export/csv', isAuthenticated, (req, res) => {
  const attendances = db.prepare(`
    SELECT a.*, p.name as program_name 
    FROM attendances a 
    LEFT JOIN programs p ON a.program_id = p.id 
    ORDER BY a.created_at DESC
  `).all();

  const fields = [
    'id', 'program_name', 'nama', 'jenis_kelamin', 'pendidikan', 
    'tempat_lahir', 'tanggal_lahir', 'alamat', 'kabupaten', 
    'nomor_hp', 'nik', 'email', 'created_at'
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(attendances);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=absensi.csv');
  res.send(csv);
});

router.get('/export/pdf', isAuthenticated, (req, res) => {
  const attendances = db.prepare(`
    SELECT a.*, p.name as program_name 
    FROM attendances a 
    LEFT JOIN programs p ON a.program_id = p.id 
    ORDER BY a.created_at DESC
  `).all();

  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=absensi.pdf');

  doc.pipe(res);

  doc.fontSize(16).text('Laporan Absensi Peserta Pelatihan', { align: 'center' });
  doc.fontSize(12).text('Pekan Vokasi BPVP Bantaeng', { align: 'center' });
  doc.moveDown();

  attendances.forEach((att, index) => {
    if (index > 0 && index % 3 === 0) {
      doc.addPage();
    }

    doc.fontSize(10);
    doc.text(`${index + 1}. ${att.nama}`, { continued: false });
    doc.fontSize(9);
    doc.text(`   Program: ${att.program_name || '-'}`);
    doc.text(`   NIK: ${att.nik}`);
    doc.text(`   Jenis Kelamin: ${att.jenis_kelamin}`);
    doc.text(`   Pendidikan: ${att.pendidikan}`);
    doc.text(`   TTL: ${att.tempat_lahir}, ${att.tanggal_lahir}`);
    doc.text(`   Alamat: ${att.alamat}, ${att.kabupaten}`);
    doc.text(`   HP: ${att.nomor_hp}`);
    doc.text(`   Email: ${att.email}`);
    doc.text(`   Tanggal: ${new Date(att.created_at).toLocaleString('id-ID')}`);
    doc.moveDown();
  });

  doc.end();
});

router.post('/import/csv', isAuthenticated, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: 'File tidak ditemukan' });
  }

  const results = [];
  const csvData = req.file.buffer.toString();
  const lines = csvData.split('\n');

  if (lines.length <= 1) {
    return res.json({ success: false, message: 'File CSV kosong' });
  }

  const headers = lines[0].split(',').map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    results.push(row);
  }

  let imported = 0;
  let failed = 0;

  results.forEach(row => {
    try {
      db.prepare(`
        INSERT INTO attendances (
          program_id, nama, jenis_kelamin, pendidikan, tempat_lahir, 
          tanggal_lahir, alamat, kabupaten, nomor_hp, nik, email, signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        row.program_id || null,
        row.nama,
        row.jenis_kelamin,
        row.pendidikan,
        row.tempat_lahir,
        row.tanggal_lahir,
        row.alamat,
        row.kabupaten,
        row.nomor_hp,
        row.nik,
        row.email,
        row.signature || ''
      );
      imported++;
    } catch (error) {
      failed++;
    }
  });

  res.json({ 
    success: true, 
    message: `Import berhasil: ${imported} data, gagal: ${failed} data` 
  });
});

router.post('/import/sheets', isAuthenticated, async (req, res) => {
  const { spreadsheetId, range } = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json({ success: false, message: 'Data tidak ditemukan' });
    }

    const headers = rows[0];
    let imported = 0;
    let failed = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const data = {};

      headers.forEach((header, index) => {
        data[header] = row[index] || '';
      });

      try {
        db.prepare(`
          INSERT INTO attendances (
            program_id, nama, jenis_kelamin, pendidikan, tempat_lahir, 
            tanggal_lahir, alamat, kabupaten, nomor_hp, nik, email, signature
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          data.program_id || null,
          data.nama,
          data.jenis_kelamin,
          data.pendidikan,
          data.tempat_lahir,
          data.tanggal_lahir,
          data.alamat,
          data.kabupaten,
          data.nomor_hp,
          data.nik,
          data.email,
          data.signature || ''
        );
        imported++;
      } catch (error) {
        failed++;
      }
    }

    res.json({ 
      success: true, 
      message: `Import berhasil: ${imported} data, gagal: ${failed} data` 
    });
  } catch (error) {
    res.json({ success: false, message: 'Error: ' + error.message });
  }
});

module.exports = router;
