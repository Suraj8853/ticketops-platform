const express = require('express');
const router = express.Router();
const { listEvents, getEvent, createEvent, updateEvent, cancelEvent } = require('../controllers/events.controller');
 
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', cancelEvent);
 
module.exports = router;
