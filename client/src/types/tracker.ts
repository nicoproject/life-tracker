export type TrackerType = 'counter' | 'progress' | 'habit'

export type TrackerStatus = 'success' | 'failure' | 'reset'

export interface Tracker {
  id: number
  name: string
  type: TrackerType
  current_value: number
  target_value: number | null
  created_at: string
  updated_at: string
}

export interface TrackerEntry {
  id: number
  tracker_id: number
  date: string
  entry_time: string
  value: number
  status: TrackerStatus
  notes: string | null
  created_at: string
}

export interface CreateTrackerInput {
  name: string
  type: TrackerType
  target_value?: number
}

export interface UpdateTrackerEntryInput {
  date: string
  entry_time?: string
  status: TrackerStatus
  notes?: string
}

