import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    register a new user
// @route   POST /api/users
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 1. check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists!' });
      return;
    }

    // 2. hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      message: 'User registered successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
};

// @desc    authenticate a user & get token
// @route   POST /api/users/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. find user by email
    const user = await User.findOne({ email });

    // 2. check if user exists AND password matches
    // bcrypt.compare compares the plain text password with the hashed one
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),  // send the "key" back to the user
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
}