const express = require('express');
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.put('/:id', authMiddleware, adminMiddleware, updateProject);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProject);

module.exports = router;
