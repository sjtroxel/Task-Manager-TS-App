import express from 'express';
import { getTasks, createTask } from '../controllers/taskController.js';

const router = express.Router();

// GET /api/tasks --> gets all tasks
router.get('/', getTasks);

// POST /api/tasks --> creates a new task
router.post('/', createTask);

export default router;