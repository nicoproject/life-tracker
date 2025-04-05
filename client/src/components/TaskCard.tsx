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
          <option value="Не начато">Не начато</option>
          <option value="В процессе">В процессе</option>
          <option value="Готово">Готово</option>
        </select>
      </p>
      <button onClick={() => onDelete(task.id)}>Удалить</button>
    </div>
  );
};
