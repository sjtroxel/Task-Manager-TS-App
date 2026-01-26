import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import taskRouter from './routes/taskRoutes.js';
import userRouter from './routes/userRoutes.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(express.json());

app.use('/api/tasks', taskRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.send('Task Manager API is running with TypeScript!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!!`);
});