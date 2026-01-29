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
export const updateTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found!' });
    }

    // check if the task's user matches the logged-in user
    // we use .toString() because MongoDB IDs are technically objects
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this task!' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,    // this returns the modified document, rather than the original
    });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
};

// @desc    delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found!' });
    }

    // ownership check
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this task!' });
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Task removed!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
}