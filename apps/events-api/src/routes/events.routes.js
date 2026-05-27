const express = require('express');
const router = express.Router();
const { listEvents, getEvent, getSeats } = require('../controllers/events.controller');
 
router.get('/', listEvents);
router.get('/:id', getEvent);
router.get('/:id/seats', getSeats);
 
module.exports = router;
