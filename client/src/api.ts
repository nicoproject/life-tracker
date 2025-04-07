const API_URL = 'http://localhost:3001/tasks'

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

export const fetchTasks = async () => {
  try {
    const response = await fetch(API_URL)
    return handleResponse(response)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

export const createTask = async (task: { title: string; status?: string }) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const updateTask = async (
  id: number,
  task: { title: string; status: string },
) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export const deleteTask = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    return handleResponse(response)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

