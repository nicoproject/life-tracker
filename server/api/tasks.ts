import { Router } from 'express'
import { pool, Task } from '../db'
import { ResultSetHeader } from 'mysql2'

const router = Router()
// Получить все задачи (Read)
router.get('/', async (req, res) => {
  try {
    const [tasks] = await pool.query<Task[]>('SELECT * FROM tasks')
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// Создать задачу (Create)
router.post('/', async (req, res) => {
  const { title, status } = req.body
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tasks (title, status) VALUES (?, ?)',
      [title, status || 'Не начато'],
    )

    const [newTask] = await pool.query<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId],
    )

    res.status(201).json(newTask[0])
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// Обновить задачу (Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, status } = req.body

  console.log('Updating task:', { id, title, status })

  if (!title || !status) {
    console.log('Missing required fields:', { title, status })
    return res.status(400).json({ error: 'Title and status are required' })
  }

  // Проверяем допустимые значения статуса
  const validStatuses = ['Не начато', 'В процессе', 'Завершено', 'Отложено']
  if (!validStatuses.includes(status)) {
    console.log('Invalid status:', status)
    return res.status(400).json({
      error: 'Invalid status',
      validStatuses,
    })
  }

  try {
    // Проверяем существование задачи
    const [existingTask] = await pool.query<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [id],
    )

    console.log('Existing task:', existingTask)

    if (existingTask.length === 0) {
      console.log('Task not found')
      return res.status(404).json({ error: 'Task not found' })
    }

    // Обновляем задачу
    console.log('Executing update query')
    const [updateResult] = await pool.query<ResultSetHeader>(
      'UPDATE tasks SET title = ?, status = ? WHERE id = ?',
      [title, status, id],
    )
    console.log('Update result:', updateResult)

    if (updateResult.affectedRows === 0) {
      console.log('No rows were updated')
      return res.status(500).json({ error: 'No rows were updated' })
    }

    // Возвращаем обновленную задачу
    console.log('Fetching updated task')
    const [updatedTask] = await pool.query<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [id],
    )
    console.log('Updated task:', updatedTask)

    if (updatedTask.length === 0) {
      console.log('Updated task not found')
      return res.status(500).json({ error: 'Failed to fetch updated task' })
    }

    res.json(updatedTask[0])
  } catch (error) {
    console.error('Error updating task:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    res.status(500).json({
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Удалить задачу (Delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query<ResultSetHeader>('DELETE FROM tasks WHERE id = ?', [id])
    res.json({ success: true, message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({ success: false, error: 'Failed to delete task' })
  }
})

export default router

