import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TaskCard } from './components/TaskCard';
import { fetchTasks, createTask, updateTask, deleteTask } from './api';
import { LanguageProvider } from './constants/labels';
import './App.css';

export const App: React.FC = () => {
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
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        console.error('Task not found:', id);
        return;
      }
      
      const updatedTask = await updateTask(id, {
        title: task.title,
        status: newStatus
      });
      
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
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
    <LanguageProvider>
      <div className="App">
        <Dashboard />
        <div className="tasks-section">
          <h2>Задачи</h2>
          <div className="add-task">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown} 
              placeholder="Новая задача"
            />
            <button onClick={handleAddTask}>Добавить</button>
          </div>
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
};
