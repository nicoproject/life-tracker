import { Router, Request, Response } from 'express'
import { pool, Tracker, TrackerEntry } from '../db'
import { ResultSetHeader } from 'mysql2'

const router = Router()

// Получение всех трекеров
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<Tracker[]>('SELECT * FROM trackers')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching trackers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Создание нового трекера
router.post('/', async (req: Request, res: Response) => {
  const { name, type, target_value } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO trackers (name, type, target_value) VALUES (?, ?, ?)',
      [name, type, target_value],
    )

    const [newTracker] = await pool.query<Tracker[]>(
      'SELECT * FROM trackers WHERE id = ?',
      [result.insertId],
    )

    res.status(201).json(newTracker[0])
  } catch (error) {
    console.error('Error creating tracker:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Получение записей трекера
router.get('/:trackerId/entries', async (req: Request, res: Response) => {
  const { trackerId } = req.params

  try {
    const [rows] = await pool.query<TrackerEntry[]>(
      'SELECT * FROM tracker_entries WHERE tracker_id = ? ORDER BY date DESC',
      [trackerId],
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching tracker entries:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Обновление записи трекера
router.post('/:trackerId/entries', async (req: Request, res: Response) => {
  const { trackerId } = req.params
  const { date, status, notes } = req.body

  try {
    // Проверяем существование трекера
    const [tracker] = await pool.query<Tracker[]>(
      'SELECT * FROM trackers WHERE id = ?',
      [trackerId],
    )

    if (tracker.length === 0) {
      return res.status(404).json({ error: 'Tracker not found' })
    }

    // Обновляем или создаем запись
    await pool.query<ResultSetHeader>(
      `INSERT INTO tracker_entries (tracker_id, date, value, status, notes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       notes = VALUES(notes)`,
      [trackerId, date, 1, status, notes],
    )

    // Обновляем текущее значение трекера
    if (status === 'success') {
      await pool.query<ResultSetHeader>(
        'UPDATE trackers SET current_value = current_value + 1 WHERE id = ?',
        [trackerId],
      )
    } else if (status === 'reset') {
      await pool.query<ResultSetHeader>(
        'UPDATE trackers SET current_value = 0 WHERE id = ?',
        [trackerId],
      )
    }

    // Получаем обновленную запись
    const [updatedEntry] = await pool.query<TrackerEntry[]>(
      'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date = ?',
      [trackerId, date],
    )

    res.json(updatedEntry[0])
  } catch (error) {
    console.error('Error updating tracker entry:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

