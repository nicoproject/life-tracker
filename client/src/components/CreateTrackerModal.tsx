import React, { useState } from 'react';
import { TrackerType } from '../types/tracker';
import { createTracker } from '../api/tracker';
import styles from './CreateTrackerModal.module.css';

interface CreateTrackerModalProps {
  onClose: () => void;
  onTrackerCreated: () => void;
}

export const CreateTrackerModal: React.FC<CreateTrackerModalProps> = ({
  onClose,
  onTrackerCreated,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TrackerType>('counter');
  const [targetValue, setTargetValue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTracker({
        name,
        type,
        target_value: targetValue
      });
      
      onTrackerCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании трекера');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        
        <h2>Создать новый трекер</h2>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название трекера:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Например: Тренировки"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="type">Тип трекера:</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TrackerType)}
            >
              <option value="counter">Счетчик</option>
              <option value="progress">Прогресс</option>
              <option value="habit">Привычка</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="targetValue">Целевое значение:</label>
            <input
              type="number"
              id="targetValue"
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              min="0"
              required
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton}>
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
