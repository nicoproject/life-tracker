const API_URL = 'http://localhost:3001/tasks'

export const fetchTasks = async () => {
  const response = await fetch(API_URL)
  return response.json()
}

export const createTask = async (task: { title: string; status?: string }) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  return response.json()
}

export const updateTask = async (
  id: number,
  task: { title: string; status: string },
) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  return response.json()
}

export const deleteTask = async (id: number) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
}

