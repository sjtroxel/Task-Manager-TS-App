import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

// GET /api/tasks --> gets all tasks
router.get('/', getTasks);

// POST /api/tasks --> creates a new task
router.post('/', createTask);

// GET /api/tasks --> gets all tasks
router.put('/:id', updateTask);

// POST /api/tasks --> creates a new task
router.delete('/:id', deleteTask);

export default router;