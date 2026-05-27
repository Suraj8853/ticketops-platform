const express = require('express');
const router = express.Router();
const { listBookings, getReports } = require('../controllers/bookings.controller');
 
router.get('/', listBookings);
router.get('/reports', getReports);
 
module.exports = router;
