import express from 'express';

const app = express();
const PORT = 5000;

// A simple route to test
app.get('/', (req, res) => {
  res.send('Task Manager API is running with TypeScript!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!!`);
});