import React, { useState, useEffect } from 'react';
import { Tracker, TrackerType } from '../types/tracker';
import styles from './EditTrackerModal.module.css';
import { useLanguage } from '../constants/labels.tsx';

interface EditTrackerModalProps {
  tracker: Tracker;
  onClose: () => void;
  onSave: (updated: { name: string; current_value: number; target_value: number | null }) => void;
}

export const EditTrackerModal: React.FC<EditTrackerModalProps> = ({
  tracker,
  onClose,
  onSave,
}) => {
  const { i18n } = useLanguage();
  const [name, setName] = useState(tracker.name);
  const [currentValueString, setCurrentValueString] = useState<string>(String(tracker.current_value).replace('.', ','));
  const [targetValueString, setTargetValueString] = useState<string>(tracker.target_value === null ? '' : String(tracker.target_value).replace('.', ','));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse values from string state, replacing comma with dot
    const normalizedCurrent = currentValueString.replace(',', '.');
    const parsedCurrent = parseFloat(normalizedCurrent);

    const normalizedTarget = targetValueString.replace(',', '.');
    const parsedTarget = targetValueString === '' ? null : parseFloat(normalizedTarget);

    if (isNaN(parsedCurrent)) {
      setError('Введите корректное текущее значение');
      return;
    }

    if (parsedTarget !== null && isNaN(parsedTarget)) {
      setError('Введите корректное целевое значение или оставьте пустым');
      return;
    }

    const updatedData = {
      name: name,
      current_value: parsedCurrent,
      target_value: parsedTarget
    };

    onSave(updatedData);
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>{i18n('editTracker')}</h3>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label={i18n('close')}
        >
          ×
        </button>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{i18n('trackerName')}:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{i18n('type')}:</label>
            <input type="text" value={tracker.type} disabled />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="current_value">{i18n('currentValue')}:</label>
            <input
              type="text"
              value={currentValueString}
              onChange={e => {
                const value = e.target.value;
                // Allow only digits, dot, comma, and optional minus at the beginning
                if (/^-?\d*[.,]?\d*$/.test(value) || value === '' || value === '-') {
                   // Additional check for only one decimal separator
                   const dotCount = (value.match(/\./g) || []).length;
                   const commaCount = (value.match(/,/g) || []).length;
                   if (dotCount <= 1 && commaCount <= 1) {
                      setCurrentValueString(value);
                   }
                }
              }}
              required
            />
          </div>
          {(tracker.type === 'counter' || tracker.type === 'progress') && (
            <div className={styles.formGroup}>
              <label htmlFor="target_value">{i18n('targetValue')}:</label>
              <input
                type="text"
                value={targetValueString}
                onChange={e => {
                  const value = e.target.value;
                  // Allow only digits, dots, commas, and optional minus at the beginning
                  if (/^-?\d*[.,]?\d*$/.test(value) || value === '' || value === '-') {
                     // Additional check for only one decimal separator
                     const dotCount = (value.match(/\./g) || []).length;
                     const commaCount = (value.match(/,/g) || []).length;
                     if (dotCount <= 1 && commaCount <= 1) {
                        setTargetValueString(value);
                     }
                  }
                }}
              />
            </div>
          )}
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              {i18n('cancel')}
            </button>
            <button type="submit" className={styles.submitButton}>
              {i18n('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
