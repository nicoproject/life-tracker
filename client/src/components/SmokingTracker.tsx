import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry, TrackerStatus } from '../types/tracker';
import { fetchTrackers, fetchTrackerEntries, updateTrackerEntry, createTracker, deleteTracker } from '../api/tracker';
import styles from './SmokingTracker.module.css';

const formatDateTime = (dateString: string, timeString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date) + ' ' + timeString;
};

interface SmokingTrackerProps {
  onDeleted?: (trackerId: number) => void;
}

export const SmokingTracker: React.FC<SmokingTrackerProps> = ({ onDeleted }) => {
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000); // Сообщение будет показываться 5 секунд

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trackers = await fetchTrackers();
        const smokingTracker = trackers.find(t => t.type === 'counter');
        
        if (smokingTracker) {
          setTracker(smokingTracker);
          const trackerEntries = await fetchTrackerEntries(smokingTracker.id);
          // Удаляем дубликаты и сортируем
          const uniqueEntries = trackerEntries.reduce((acc: TrackerEntry[], current) => {
            const isDuplicate = acc.some(entry => 
              entry.date === current.date && 
              entry.status === current.status
            );
            if (!isDuplicate) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setEntries(uniqueEntries.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.entry_time);
            const dateB = new Date(b.date + 'T' + b.entry_time);
            return dateB.getTime() - dateA.getTime();
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusChange = async (status: TrackerStatus) => {
    if (!tracker) return;

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Проверяем наличие записи такого же типа за сегодня
      const hasSameStatusToday = entries.some(e => 
        e.date === today && e.status === status
      );
      
      if (hasSameStatusToday) {
        const messages = {
          failure: 'Вы уже отметили срыв сегодня, успокойтесь, срыв - часть выздоровления',
          success: 'Вы уже отметили успешный день сегодня',
          reset: 'Вы уже сбросили счетчик сегодня'
        };
        
        setMessage({
          text: messages[status],
          type: 'info'
        });
        return;
      }

      // Проверяем, можно ли обнулить счетчик
      if (status === 'reset' && tracker.current_value === 0) {
        setMessage({
          text: 'Счетчик уже обнулен',
          type: 'info'
        });
        return;
      }

      const entry = await updateTrackerEntry(tracker.id, {
        date: today,
        status,
        notes: status === 'failure' ? 'Срыв' : undefined,
      });
      
      if (status === 'success') {
        setTracker(prev => prev ? { ...prev, current_value: prev.current_value + 1 } : null);
      } else if (status === 'reset') {
        setTracker(prev => prev ? { ...prev, current_value: 0 } : null);
      }
      
      setEntries(prev => {
        const isDuplicate = prev.some(e => 
          e.date === entry.date && 
          e.status === entry.status
        );
        
        if (isDuplicate) {
          setMessage({
            text: 'Эта запись уже существует',
            type: 'info'
          });
          return prev;
        }
        
        return [entry, ...prev].sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.entry_time);
          const dateB = new Date(b.date + 'T' + b.entry_time);
          return dateB.getTime() - dateA.getTime();
        });
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Произошла ошибка',
        type: 'error'
      });
    }
  };

  const handleDeleteTracker = async () => {
    if (!tracker) return;

    try {
      await deleteTracker(tracker.id);
      setMessage({
        text: 'Трекер успешно удален',
        type: 'info'
      });
      onDeleted?.(tracker.id);
      setTracker(null);
      setEntries([]);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Ошибка при удалении трекера',
        type: 'error'
      });
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!tracker) return <div>Трекер не найден</div>;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);

  return (
    <div className={styles.smokingTracker}>
      <h2>Трекер курения</h2>
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
      <div className={styles.currentStats}>
        <p>Дней без курения: {tracker.current_value}</p>
      </div>
      <div className={styles.actions}>
        <button 
          onClick={() => handleStatusChange('success')}
          disabled={todayEntries.some(e => e.status === 'success')}
        >
          Отметить успешный день
        </button>
        <button 
          onClick={() => handleStatusChange('failure')}
          disabled={todayEntries.some(e => e.status === 'failure')}
        >
          Отметить срыв
        </button>
        <button 
          onClick={() => handleStatusChange('reset')}
          disabled={todayEntries.some(e => e.status === 'reset') || tracker.current_value === 0}
        >
          Обнулить счетчик
        </button>
        <button onClick={() => setIsHistoryOpen(true)}>
          Показать историю
        </button>
        <button 
          className={styles.deleteButton}
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          Удалить трекер
        </button>
      </div>

      {isHistoryOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setIsHistoryOpen(false)}
            >
              ×
            </button>
            <h3>История трекера ({entries.length} {entries.length === 1 ? 'запись' : entries.length >= 2 && entries.length <= 4 ? 'записи' : 'записей'})</h3>
            <ul className={styles.historyList}>
              {entries.map(entry => (
                <li key={`${entry.date}-${entry.entry_time}-${entry.status}`}>
                  {formatDateTime(entry.date, entry.entry_time)}: {entry.status === 'success' ? 'Успех' : entry.status === 'failure' ? 'Срыв' : 'Сброс'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className={styles.modal}>
          <div className={`${styles.modalContent} ${styles.confirmDialog}`}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить трекер? Это действие нельзя отменить.</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmButton}
                onClick={handleDeleteTracker}
              >
                Да, удалить
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
