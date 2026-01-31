import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// GET /api/tasks --> gets all tasks
router.get('/', protect, getTasks);

// POST /api/tasks --> creates a new task
router.post('/', protect, createTask);

// PUT /api/tasks/:id --> full update
router.put('/:id', protect, updateTask);

// PATCH /api/tasks/:id --> partial update (like toggling 'done')
router.patch('/:id', protect, updateTask);      // use the same controller!

// DELETE /api/tasks/:id --> deletes a task
router.delete('/:id', protect, deleteTask);

export default router;