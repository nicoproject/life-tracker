import { useState, useEffect } from 'react';
import { TaskCard } from './components/TaskCard';
import { fetchTasks, createTask, updateTask, deleteTask } from './api';

export default function App() {
  const [tasks, setTasks] = useState<{ id: number; title: string; status: string }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const task = await createTask({ title: newTaskTitle });
    setTasks([...tasks, task]);
    setNewTaskTitle('');
  };

  const handleUpdateTask = async (id: number, newStatus: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updatedTask = await updateTask(id, { ...task, status: newStatus });
    setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newTaskTitle.trim()) {
        handleAddTask();
      }
    }
  };

  return (
    <div className="app">
      <input
        type="text"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        onKeyDown={handleKeyDown} 
        placeholder="Новая задача"
      />
      <button onClick={handleAddTask}>Добавить</button>

      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdateStatus={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      ))}
    </div>
  );
}
