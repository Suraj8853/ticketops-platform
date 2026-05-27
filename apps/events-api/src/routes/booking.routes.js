const express = require('express');
const router = express.Router();
const { createBooking, getBooking, cancelBooking } = require('../controllers/bookings.controller');
 
router.post('/', createBooking);
router.get('/:id', getBooking);
router.post('/:id/cancel', cancelBooking);
 
module.exports = router;
