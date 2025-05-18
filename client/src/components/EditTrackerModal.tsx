import React, { useState } from 'react';
import { Tracker } from '../types/tracker';
import styles from './CreateTrackerModal.module.css';
import { LABELS } from './labels';

interface EditTrackerModalProps {
  tracker: Tracker;
  onClose: () => void;
  onSave: (updated: { name: string; current_value: number; target_value: number | null }) => void;
}

export const EditTrackerModal: React.FC<EditTrackerModalProps> = ({ tracker, onClose, onSave }) => {
  const [trackerName, setTrackerName] = useState<string>(tracker.name);
  const [currentValueString, setCurrentValueString] = useState<string>(String(tracker.current_value).replace('.', ','));
  const [targetValueString, setTargetValueString] = useState<string>(tracker.target_value === null ? '' : String(tracker.target_value).replace('.', ','));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Парсим значения из строкового состояния, заменяя запятую на точку
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
      name: trackerName,
      current_value: parsedCurrent,
      target_value: parsedTarget
    };

    onSave(updatedData);
    onClose();
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
        <h2>Редактировать трекер</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Название трекера:</label>
            <input
              type="text"
              value={trackerName}
              onChange={e => setTrackerName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{LABELS.type}:</label>
            <input type="text" value={tracker.type} disabled />
          </div>
          <div className={styles.formGroup}>
            <label>{LABELS.value} (текущее):</label>
            <input
              type="text"
              value={currentValueString}
              onChange={e => {
                const value = e.target.value;
                // Разрешаем ввод только цифр, точки, запятой и минуса (только в начале)
                if (/^-?\d*[.,]?\d*$/.test(value) || value === '' || value === '-') {
                   // Дополнительная проверка на наличие только одного десятичного разделителя
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
          <div className={styles.formGroup}>
            <label>{LABELS.targetValue}:</label>
            <input
              type="text"
              value={targetValueString}
              onChange={e => {
                const value = e.target.value;
                // Разрешаем ввод только цифр, точек, запятой и минуса (только в начале)
                if (/^-?\d*[.,]?\d*$/.test(value) || value === '' || value === '-') {
                   // Дополнительная проверка на наличие только одного десятичного разделителя
                   const dotCount = (value.match(/\./g) || []).length;
                   const commaCount = (value.match(/,/g) || []).length;
                   if (dotCount <= 1 && commaCount <= 1) {
                      setTargetValueString(value);
                   }
                }
              }}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              {LABELS.cancel}
            </button>
            <button type="submit" className={styles.submitButton}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
