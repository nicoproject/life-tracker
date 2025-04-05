import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import tasksRouter from './api/tasks';

const app = express()
app.use(cors({
  origin: 'http://localhost:5173' // URL вашего фронтенда
}));
app.use(express.json())
app.use('/tasks', tasksRouter);

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Shikira98',
  database: 'life_tracker',
})

// Проверка подключения к MySQL
pool
  .getConnection()
  .then(() => console.log('Connected to MySQL'))
  .catch((err) => console.error('MySQL connection error:', err))

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001')
})

