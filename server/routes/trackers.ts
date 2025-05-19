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
  const { date } = req.query

  try {
    let query = 'SELECT * FROM tracker_entries WHERE tracker_id = ?'
    const params = [id]

    if (date) {
      query += ' AND date = ?'
      params.push(date as string)
    }

    query += ' ORDER BY date DESC, entry_time DESC'

    const entries = await db.query<TrackerEntry>(query, params)
    res.json(entries)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracker entries' })
  }
})

// Create tracker entry
router.post('/:id/entries', async (req, res) => {
  const { id } = req.params
  const { date, value, notes } = req.body // Expect date, value, and notes

  try {
    // Check if tracker exists (optional, but good practice)
    const trackers = await db.query<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      [id],
    )

    if (trackers.length === 0) {
      return res.status(404).json({ error: 'Tracker not found' })
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert logic
    // Include entry_time and a default status for measurement entries
    const result = await db.execute(
      'INSERT INTO tracker_entries (tracker_id, date, entry_time, status, value, notes) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), notes = VALUES(notes)',
      [
        id,
        date,
        new Date().toTimeString().split(' ')[0], // Include current time
        'measurement', // Use a default status like 'measurement'
        value,
        notes || null, // Use null if notes is not provided
      ],
    )

    // After insert/update, fetch the entry to return
    const [entry] = await db.query<TrackerEntry>(
      'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date = ?',
      [id, date],
    )

    if (!entry) {
      // This case should ideally not happen with upsert, but good to handle
      return res
        .status(500)
        .json({ error: 'Failed to retrieve upserted entry' })
    }

    res.status(200).json(entry) // Return 200 for successful update/create
  } catch (err) {
    console.error('Error upserting tracker entry:', err)
    res.status(500).json({
      error:
        err instanceof Error ? err.message : 'Failed to upsert tracker entry',
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

