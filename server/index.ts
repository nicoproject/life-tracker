import express from 'express'
import cors from 'cors'
import { pool } from './db'
import tasksRouter from './api/tasks'
import trackersRouter from './routes/trackers'

const app = express()
const port = 3001

// Настройка CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }),
)
app.use(express.json())
app.use('/tasks', tasksRouter)
app.use('/api/trackers', trackersRouter)

// Проверка подключения к базе данных
pool
  .getConnection()
  .then((connection) => {
    console.log('Connected to MySQL')
    connection.release()
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err)
  })

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

