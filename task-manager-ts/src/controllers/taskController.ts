import { Request, Response } from 'express';
import Task from '../models/taskModel.js'

// @desc    get all tasks
// @route   GET /api/tasks
export const getTasks = async (req: any, res: Response) => {
  try {
    // only find tasks that belong to this specific user
    const tasks = await Task.find({ user: req.user._id });  
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({message: 'Server Error!' });
  }
};

// @desc    create a task
// @route   POST /api/tasks
export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description } = req.body;

    const newTask = await Task.create({
      title,
      description,
      user: req.user._id,   //attach the logged-in user's ID here!
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: 'Invalid task data' });
  }
};

// @desc    update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found!' });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,    // this returns the modified document, rather than the original
    });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID or data!' });
  }
};

// @desc    delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found!' });
      return;
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Task removed!' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID!' });
  }
}