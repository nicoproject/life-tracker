import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry } from '../types/tracker';
import { fetchTrackers, fetchTrackerEntries, updateTrackerEntry, createTracker } from '../api/tracker';
import styles from './SugarTracker.module.css';

interface SugarTrackerProps {
  onDeleted?: (trackerId: number) => void;
}

export const SugarTracker: React.FC<SugarTrackerProps> = ({ onDeleted }) => {
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [newValue, setNewValue] = useState<string>('');

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trackers = await fetchTrackers();
        let sugarTracker = trackers.find(t => t.name === 'САХАР');
        
        if (!sugarTracker) {
          // Создаем трекер, если его нет
          sugarTracker = await createTracker({
            name: 'САХАР',
            type: 'measurement'
          });
        }
        
        setTracker(sugarTracker);
        const trackerEntries = await fetchTrackerEntries(sugarTracker.id);
        setEntries(trackerEntries.sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.entry_time);
          const dateB = new Date(b.date + 'T' + b.entry_time);
          return dateB.getTime() - dateA.getTime();
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddMeasurement = async () => {
    if (!tracker) return;
    
    const value = parseFloat(newValue);
    if (isNaN(value)) {
      setMessage({
        text: 'Пожалуйста, введите корректное значение',
        type: 'error'
      });
      return;
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const entry = await updateTrackerEntry(tracker.id, {
        date: today,
        status: 'measurement',
        value: value,
        notes: 'Измерение сахара'
      });
      
      setEntries(prev => [entry, ...prev]);
      setNewValue('');
      setMessage({
        text: 'Значение успешно добавлено',
        type: 'info'
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Произошла ошибка',
        type: 'error'
      });
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!tracker) return <div>Трекер не найден</div>;

  const latestEntry = entries[0];

  return (
    <div className={styles.sugarTracker}>
      <h2>Трекер сахара</h2>
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
      
      <div className={styles.currentValue}>
        {latestEntry ? (
          <>
            <p>Последнее измерение: {latestEntry.value} ммоль/л</p>
            <p>Дата: {new Date(latestEntry.date).toLocaleDateString('ru-RU')}</p>
            <p>Время: {latestEntry.entry_time}</p>
          </>
        ) : (
          <p>Нет измерений</p>
        )}
      </div>

      <div className={styles.addMeasurement}>
        <input
          type="number"
          step="0.1"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Введите значение сахара"
          className={styles.input}
        />
        <button 
          onClick={handleAddMeasurement}
          className={styles.addButton}
        >
          Добавить измерение
        </button>
      </div>

      <button 
        onClick={() => setIsHistoryOpen(true)}
        className={styles.historyButton}
      >
        Показать историю
      </button>

      {isHistoryOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setIsHistoryOpen(false)}
            >
              ×
            </button>
            <h3>История измерений</h3>
            <ul className={styles.historyList}>
              {entries.map(entry => (
                <li key={`${entry.date}-${entry.entry_time}`}>
                  {new Date(entry.date).toLocaleDateString('ru-RU')} {entry.entry_time}: {entry.value} ммоль/л
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 
