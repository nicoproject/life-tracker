import {
  Tracker,
  TrackerEntry,
  CreateTrackerInput,
  UpdateTrackerEntryInput,
} from '../types/tracker'

const API_URL = 'http://localhost:3001/api'

export const fetchTrackers = async (): Promise<Tracker[]> => {
  const response = await fetch(`${API_URL}/trackers`)
  if (!response.ok) throw new Error('Failed to fetch trackers')
  return response.json()
}

export const createTracker = async (
  input: CreateTrackerInput,
): Promise<Tracker> => {
  const response = await fetch(`${API_URL}/trackers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('Failed to create tracker')
  return response.json()
}

export const fetchTrackerEntries = async (
  trackerId: number,
): Promise<TrackerEntry[]> => {
  const response = await fetch(`${API_URL}/trackers/${trackerId}/entries`)
  if (!response.ok) throw new Error('Failed to fetch tracker entries')
  return response.json()
}

export const updateTrackerEntry = async (
  trackerId: number,
  input: UpdateTrackerEntryInput,
): Promise<TrackerEntry> => {
  const response = await fetch(`${API_URL}/trackers/${trackerId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update tracker entry')
  }
  return response.json()
}

export const deleteTracker = async (trackerId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/trackers/${trackerId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete tracker')
}

export const updateTracker = async (
  trackerId: number,
  input: Partial<Pick<Tracker, 'name' | 'current_value' | 'target_value'>>,
): Promise<Tracker> => {
  const response = await fetch(`${API_URL}/trackers/${trackerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('Failed to update tracker')
  return response.json()
}

