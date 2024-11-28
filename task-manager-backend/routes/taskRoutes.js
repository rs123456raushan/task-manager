const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, getStatistics } = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticate, getTasks);
router.get('/stats', authenticate, getStatistics);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask); // Update task
router.delete('/:id', authenticate, deleteTask); // Delete task

module.exports = router;
