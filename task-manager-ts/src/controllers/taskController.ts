import { Request, Response } from 'express';
import Task from '../models/taskModel.js'

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();  
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({message: 'Server Error!' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const newTask = await Task.create({
      title,
      description,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: 'Invalid task data' });
  }
};