const express = require('express');
const { createTeam, getTeams, updateTeam, deleteTeam } = require('../controllers/teamController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createTeam);
router.get('/', authMiddleware, getTeams);
router.put('/:id', authMiddleware, adminMiddleware, updateTeam);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTeam);

module.exports = router;
