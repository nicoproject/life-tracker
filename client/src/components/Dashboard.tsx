import React, { useState, useEffect } from 'react';
import { Tracker } from '../types/tracker';
import { fetchTrackers, deleteTracker } from '../api/tracker';
import { SmokingTracker } from './SmokingTracker';
import { CreateTrackerModal } from './CreateTrackerModal';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadTrackers();
  }, []);

  const loadTrackers = async () => {
    try {
      setLoading(true);
      const fetchedTrackers = await fetchTrackers();
      
      // Удаляем дубликаты по имени, оставляя только первый трекер
      const uniqueTrackers = fetchedTrackers.reduce((acc: Tracker[], current) => {
        const exists = acc.find(t => t.name === current.name);
        if (!exists) {
          acc.push(current);
        } else {
          console.warn(`Найден дубликат трекера: ${current.name}`);
        }
        return acc;
      }, []);

      setTrackers(uniqueTrackers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке трекеров');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackerDeleted = async (trackerId: number) => {
    try {
      await deleteTracker(trackerId);
      setTrackers(prev => prev.filter(t => t.id !== trackerId));
      setMessage({
        text: 'Трекер успешно удален',
        type: 'info'
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Ошибка при удалении трекера',
        type: 'error'
      });
    }
  };

  const handleTrackerCreated = () => {
    loadTrackers();
    setMessage({
      text: 'Трекер успешно создан',
      type: 'info'
    });
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Панель трекеров</h1>
      
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          <span>{message.text}</span>
          <button 
            className={styles.closeMessage} 
            onClick={() => setMessage(null)}
            aria-label="Закрыть сообщение"
          >
            ×
          </button>
        </div>
      )}

      {trackers.length === 0 ? (
        <div className={styles.noTrackers}>
          <p>У вас пока нет трекеров</p>
          <p>Нажмите кнопку "Добавить трекер", чтобы создать новый трекер</p>
        </div>
      ) : (
        <div className={styles.trackerGrid}>
          {trackers.map(tracker => (
            <div key={tracker.id} className={styles.trackerCard}>
              {tracker.type === 'counter' && tracker.name === 'Не курю' ? (
                <SmokingTracker onDeleted={() => handleTrackerDeleted(tracker.id)} />
              ) : (
                <div className={styles.genericTracker}>
                  <h2>{tracker.name}</h2>
                  <p>Тип: {tracker.type}</p>
                  <p>Текущее значение: {tracker.current_value}</p>
                  {tracker.target_value !== null && tracker.target_value !== undefined ? (
                    <p>Целевое значение: {tracker.target_value}</p>
                  ) : (
                    <p>Целевое значение: -</p>
                  )}
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleTrackerDeleted(tracker.id)}
                  >
                    Удалить трекер
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button 
        className={styles.addButton}
        onClick={() => setIsCreateModalOpen(true)}
      >
        + Добавить трекер
      </button>

      {isCreateModalOpen && (
        <CreateTrackerModal
          onClose={() => setIsCreateModalOpen(false)}
          onTrackerCreated={handleTrackerCreated}
        />
      )}
    </div>
  );
}; 
