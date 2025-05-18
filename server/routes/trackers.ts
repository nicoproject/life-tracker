import { Router } from 'express'
import { db } from '../db'
import { Tracker, TrackerEntry } from '../db'

const router = Router()

// Get all trackers
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

// Create a new tracker
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

// Delete a tracker
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await db.execute('DELETE FROM trackers WHERE id = ?', [id])
    res.status(200).json({ message: 'Tracker deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tracker' })
  }
})

// Get tracker entries
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

// Create tracker entry
router.post('/:id/entries', async (req, res) => {
  const { id } = req.params
  const { date, status, notes } = req.body

  try {
    console.log('Creating tracker entry:', { id, date, status, notes })

    // Check if tracker exists
    const trackers = await db.query<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      [id],
    )

    if (trackers.length === 0) {
      console.log('Tracker not found:', id)
      return res.status(404).json({ error: 'Tracker not found' })
    }

    // Check if entry for this date already exists
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

    // Create a new entry
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

    // Get the created entry
    const [newEntry] = await db.query<TrackerEntry>(
      'SELECT * FROM tracker_entries WHERE id = ?',
      [result.insertId],
    )

    // Update tracker value
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
    res.status(500).json({
      error:
        err instanceof Error ? err.message : 'Failed to create tracker entry',
    })
  }
})

// PUT /:id - update current_value, target_value, and name
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, current_value, target_value } = req.body

  try {
    // Check if tracker exists
    const trackers = await db.query<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      [id],
    )

    if (!trackers || trackers.length === 0) {
      return res.status(404).json({ error: 'Tracker not found' })
    }

    // Update values
    await db.execute(
      'UPDATE trackers SET name = ?, current_value = ?, target_value = ? WHERE id = ?',
      [name, current_value, target_value, id],
    )

    // Get the updated tracker
    const updatedTrackers = await db.query<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      [id],
    )

    res.json(updatedTrackers[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tracker' })
  }
})

export default router

