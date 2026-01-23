import { Request, Response } from 'express';

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = (req: Request, res: Response) => {
  res.json({ message: 'Getting all tasks from the controller!!' });
};