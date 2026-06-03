const express = require('express');
const router = express.Router();
const { login, me, logout } = require('../controllers/auth.controller');
const jwtAuth = require('../middleware/jwtAuth');

router.post('/login', login);
router.post('/logout', jwtAuth, logout);
router.get('/me', jwtAuth, me);

module.exports = router;
