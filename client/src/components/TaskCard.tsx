import React from 'react';
import styles from './TaskCard.module.css';

type TaskProps = {
  task: {
    id: number;
    title: string;
    status: string;
  };
  onUpdateStatus: (id: number, newStatus: string) => void;
  onDelete: (id: number) => void;
};

const STATUS_OPTIONS = ['Не начато', 'В процессе', 'Завершено', 'Отложено'] as const;

export const TaskCard = ({ task, onUpdateStatus, onDelete }: TaskProps) => {
  return (
    <div className={styles['task-card']}>
      <h2>{task.title}</h2>
      <p>
        Статус: 
        <select 
          value={task.status} 
          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
        >
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </p>
      <button onClick={() => onDelete(task.id)}>Удалить</button>
    </div>
  );
};
