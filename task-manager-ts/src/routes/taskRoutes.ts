import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// GET /api/tasks --> gets all tasks
router.get('/', protect, getTasks);

// POST /api/tasks --> creates a new task
router.post('/', protect, createTask);

// GET /api/tasks --> gets all tasks
router.put('/:id', protect, updateTask);

// POST /api/tasks --> creates a new task
router.delete('/:id', protect, deleteTask);

export default router;