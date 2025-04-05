import { Router } from 'express'
import { pool } from '../index'

const router = Router()
// Получить все задачи (Read)
router.get('/', async (req, res) => {
  const [tasks] = await pool.query('SELECT * FROM tasks')
  res.json(tasks)
})

// Создать задачу (Create)
router.post('/', async (req, res) => {
  const { title, status } = req.body
  const [result] = await pool.query(
    'INSERT INTO tasks (title, status) VALUES (?, ?)',
    [title, status || 'Не начато'],
  )
  res.status(201).json({ id: (result as any).insertId, title, status })
})

// Обновить задачу (Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, status } = req.body
  await pool.query('UPDATE tasks SET title = ?, status = ? WHERE id = ?', [
    title,
    status,
    id,
  ])
  res.json({ id, title, status })
})

// Удалить задачу (Delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM tasks WHERE id = ?', [id])
  res.status(204).send()
})

export default router

