import React, { useState } from 'react';
import { TrackerType } from '../types/tracker';
import { createTracker } from '../api/tracker';
import styles from './CreateTrackerModal.module.css';
import { useLanguage } from '../constants/labels.tsx';

interface CreateTrackerModalProps {
  onClose: () => void;
  onTrackerCreated: () => void;
}

export const CreateTrackerModal: React.FC<CreateTrackerModalProps> = ({
  onClose,
  onTrackerCreated,
}) => {
  const { i18n } = useLanguage();
  const [name, setName] = useState('');
  const [type, setType] = useState<TrackerType>('counter');
  const [targetValueString, setTargetValueString] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value as TrackerType;
    setType(selectedType);
    if (selectedType === 'counter') setTargetValueString('0');
    else if (selectedType === 'progress') setTargetValueString('100');
    else if (selectedType === 'habit') setTargetValueString('21');
    else setTargetValueString('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedTarget = targetValueString.replace(',', '.');
    const parsedTarget = targetValueString === '' ? null : parseFloat(normalizedTarget);

    if (parsedTarget !== null && isNaN(parsedTarget)) {
      setError(i18n('invalidTargetValue'));
      return;
    }

    try {
      const trackerData: any = {
        name,
        type
      };

      if (parsedTarget !== null) {
         trackerData.target_value = parsedTarget;
      }

      await createTracker(trackerData);
      
      onTrackerCreated();
      onClose();
    } catch (err) {
      setError(i18n('errorCreatingTracker'));
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label={i18n('close')}
        >
          ×
        </button>
        
        <h2>{i18n('createTitle')}</h2>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{i18n('trackerName')}:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={i18n('trackerNamePlaceholder')}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="type">{i18n('trackerType')}:</label>
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
          
          <div className={styles.formGroup}>
            <label htmlFor="targetValue">{i18n('targetValue')}:</label>
            <input
              type="text"
              id="targetValue"
              value={targetValueString}
              onChange={e => {
                const value = e.target.value;
                if (/^-?\d*[.,]?\d*$/.test(value) || value === '' || value === '-') {
                   const dotCount = (value.match(/\./g) || []).length;
                   const commaCount = (value.match(/,/g) || []).length;
                   if (dotCount <= 1 && commaCount <= 1) {
                      setTargetValueString(value);
                   }
                }
              }}
              placeholder={type === 'measurement' ? 'Оставьте пустым' : 'Например: 100'}
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              {i18n('cancel')}
            </button>
            <button type="submit" className={styles.submitButton}>
              {i18n('createTracker')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
