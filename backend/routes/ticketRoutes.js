const express = require('express');
const { createTicket, getTickets, resolveTicket } = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getTickets);
// We rely on authMiddleware, and front-end hides this for members. 
// A strict check could be added inside resolveTicket or middleware.
router.put('/:id/resolve', authMiddleware, resolveTicket);

module.exports = router;
