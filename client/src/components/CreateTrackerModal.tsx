import React, { useState } from 'react';
import { TrackerType } from '../types/tracker';
import { createTracker } from '../api/tracker';
import styles from './CreateTrackerModal.module.css';
import { LABELS } from './labels';

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value as TrackerType;
    setType(selectedType);
    if (selectedType === 'counter') setTargetValue(0);
    else if (selectedType === 'progress') setTargetValue(100);
    else if (selectedType === 'habit') setTargetValue(21);
    else setTargetValue(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const trackerData: any = {
        name,
        type
      };
      if (type !== 'measurement') {
        trackerData.target_value = targetValue;
      } else {
        trackerData.target_value = null;
      }
      await createTracker(trackerData);
      
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
        
        <h2>{LABELS.createTitle}</h2>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{LABELS.name}:</label>
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
            <label htmlFor="type">{LABELS.type}:</label>
            <select
              id="type"
              value={type}
              onChange={handleTypeChange}
            >
              <option value="counter">Счетчик</option>
              <option value="progress">Прогресс</option>
              <option value="habit">Привычка</option>
              <option value="measurement">Измерение</option>
            </select>
          </div>
          
          {(type === 'counter' || type === 'progress' || type === 'habit') && (
            <div className={styles.formGroup}>
              <label htmlFor="targetValue">{LABELS.value}:</label>
              <input
                type="number"
                id="targetValue"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                min="0"
                required
              />
            </div>
          )}
          
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              {LABELS.cancel}
            </button>
            <button type="submit" className={styles.submitButton}>
              {LABELS.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
