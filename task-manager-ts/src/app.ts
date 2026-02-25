import express from 'express';
import cors from 'cors';
import taskRouter from './routes/taskRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.send('Task Manager API is running with TypeScript!');
});

export default app;
