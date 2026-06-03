const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, adminPassword);
    if (!isValid) {
      // try plain text comparison for dev
      if (password !== adminPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const token = jwt.sign(
      { 
        email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    logger.info({ message: 'Admin login successful', email });

    return res.json({ 
      token,
      expiresIn: '8h',
      email 
    });

  } catch (err) {
    logger.error({ message: 'Login error', error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const me = (req, res) => {
  return res.json({ 
    email: req.user.email,
    role: req.user.role 
  });
};

const logout = (req, res) => {
  return res.json({ message: 'Logged out successfully' });
};

module.exports = { login, me, logout };
