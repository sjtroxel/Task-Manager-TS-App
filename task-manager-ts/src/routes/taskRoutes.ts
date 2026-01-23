import express from 'express';
import { getTasks } from '../controllers/taskController.js';

const router = express.Router();

// This matches the root of this file, which is /api/tasks
router.get('/', getTasks);

export default router;