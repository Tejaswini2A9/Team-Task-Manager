const express = require('express');
const { createTask, getTasks, updateTaskStatus, updateTaskMemberProgress, updateTask, deleteTask } = require('../controllers/taskController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.put('/:id', authMiddleware, adminMiddleware, updateTask);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTask);
router.put('/:id/status', authMiddleware, updateTaskStatus);
router.put('/:taskId/progress', authMiddleware, updateTaskMemberProgress);

module.exports = router;
