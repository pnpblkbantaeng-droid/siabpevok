const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const db = new Database(path.join(__dirname, 'absensi.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER,
    nama TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    pendidikan TEXT NOT NULL,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir TEXT NOT NULL,
    alamat TEXT NOT NULL,
    kabupaten TEXT NOT NULL,
    nomor_hp TEXT NOT NULL,
    nik TEXT NOT NULL,
    email TEXT NOT NULL,
    signature TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );
`);

const checkSuperadmin = db.prepare('SELECT * FROM users WHERE username = ?').get('Pemberdayaan');
if (!checkSuperadmin) {
  const hashedPassword = bcrypt.hashSync('Kios3in1*', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('Pemberdayaan', hashedPassword);
  console.log('Superadmin created: username = Pemberdayaan');
}

const checkAbsensiSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get('absensi_status');
if (!checkAbsensiSetting) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('absensi_status', 'ON');
  console.log('Absensi status initialized: ON');
}

const checkAbsensiMessage = db.prepare('SELECT * FROM settings WHERE key = ?').get('absensi_message');
if (!checkAbsensiMessage) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('absensi_message', 'Absensi OFF, hubungi admin di +6281243397116');
  console.log('Absensi message initialized');
}

module.exports = db;
