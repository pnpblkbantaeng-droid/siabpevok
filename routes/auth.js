const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.json({ success: false, message: 'Username atau password salah' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.json({ success: false, message: 'Username atau password salah' });
  }

  req.session.user = {
    id: user.id,
    username: user.username
  };

  res.json({ success: true, message: 'Login berhasil' });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logout berhasil' });
});

router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
