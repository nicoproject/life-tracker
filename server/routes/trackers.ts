import { Router } from 'express'
import { db } from '../db'
import { Tracker, TrackerEntry } from '../db'

const router = Router()

// Получить все трекеры
router.get('/', async (req, res) => {
  try {
    const trackers = await db.query<Tracker>(
      'SELECT * FROM trackers ORDER BY created_at DESC',
    )
    res.json(trackers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trackers' })
  }
})

// Создать новый трекер
router.post('/', async (req, res) => {
  const { name, type, target_value } = req.body
  try {
    const result = await db.execute(
      'INSERT INTO trackers (name, type, target_value, current_value) VALUES (?, ?, ?, 0)',
      [name, type, target_value],
    )
    const [newTracker] = await db.query<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      [result.insertId],
    )
    res.status(201).json(newTracker)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tracker' })
  }
})

// Удалить трекер
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await db.execute('DELETE FROM trackers WHERE id = ?', [id])
    res.status(200).json({ message: 'Tracker deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tracker' })
  }
})

// Получить записи трекера
router.get('/:id/entries', async (req, res) => {
  const { id } = req.params
  try {
    const entries = await db.query<TrackerEntry>(
      'SELECT * FROM tracker_entries WHERE tracker_id = ? ORDER BY date DESC, entry_time DESC',
      [id],
    )
    res.json(entries)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracker entries' })
  }
})

// Создать запись трекера
router.post('/:id/entries', async (req, res) => {
  const { id } = req.params
  const { date, status, notes } = req.body

  try {
    console.log('Creating tracker entry:', { id, date, status, notes })

    // Проверяем существование трекера
    const trackers = await db.query<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      [id],
    )

    if (trackers.length === 0) {
      console.log('Tracker not found:', id)
      return res.status(404).json({ error: 'Tracker not found' })
    }

    // Проверяем, нет ли уже записи за этот день
    const existingEntries = await db.query<TrackerEntry>(
      'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date = ? AND status = ?',
      [id, date, status],
    )

    if (existingEntries.length > 0) {
      console.log('Entry already exists:', { id, date, status })
      return res
        .status(400)
        .json({ error: 'Entry for this date and status already exists' })
    }

    // Создаем новую запись
    const result = await db.execute(
      'INSERT INTO tracker_entries (tracker_id, date, entry_time, status, value, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id,
        date,
        new Date().toTimeString().split(' ')[0],
        status,
        1,
        notes || null,
      ],
    )

    // Получаем созданную запись
    const [newEntry] = await db.query<TrackerEntry>(
      'SELECT * FROM tracker_entries WHERE id = ?',
      [result.insertId],
    )

    // Обновляем значение трекера
    if (status === 'success') {
      await db.execute(
        'UPDATE trackers SET current_value = current_value + 1 WHERE id = ?',
        [id],
      )
    } else if (status === 'reset') {
      await db.execute('UPDATE trackers SET current_value = 0 WHERE id = ?', [
        id,
      ])
    }

    console.log('Successfully created entry:', newEntry)
    res.status(201).json(newEntry)
  } catch (err) {
    console.error('Error creating tracker entry:', err)
    res
      .status(500)
      .json({
        error:
          err instanceof Error ? err.message : 'Failed to create tracker entry',
      })
  }
})

export default router

