const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const jwtAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Unauthorized — no token provided' 
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Unauthorized — invalid token format' 
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    logger.info({ 
      message: 'Admin authenticated', 
      email: decoded.email,
      requestId: req.id 
    });

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized — token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized — invalid token' });
    }
    logger.error({ message: 'JWT auth error', error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = jwtAuth;
