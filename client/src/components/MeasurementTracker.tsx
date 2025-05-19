import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry } from '../types/tracker';
import { useLanguage } from '../constants/labels.tsx';
import styles from './MeasurementTracker.module.css';

interface MeasurementTrackerProps {
  tracker: Tracker;
  selectedDate: Date;
}

export const MeasurementTracker: React.FC<MeasurementTrackerProps> = ({
  tracker,
  selectedDate,
}) => {
  const { t } = useLanguage();
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);

  // Load value for the selected date
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/trackers/${tracker.id}/entries?date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error(t('errorLoadingValue'));
        }
        
        const entries: TrackerEntry[] = await response.json();
        if (entries.length > 0) {
          setValue(entries[0].value.toString());
        } else {
          setValue('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errorLoadingValue'));
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [tracker.id, selectedDate, t]);

  const handleSave = async () => {
    try {
      // Validate date (not in future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      if (selected > today) {
        setMessage({
          text: t('futureDateNotAllowed'),
          type: 'error'
        });
        return;
      }

      // Validate value
      const numericValue = parseFloat(value.replace(',', '.'));
      if (isNaN(numericValue)) {
        setMessage({
          text: t('invalidValue'),
          type: 'error'
        });
        return;
      }

      setLoading(true);
      setError(null);

      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/trackers/${tracker.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formattedDate,
          value: numericValue,
        }),
      });

      if (!response.ok) {
        throw new Error(t('errorSavingValue'));
      }

      setMessage({
        text: t('valueSaved'),
        type: 'info'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorSavingValue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.measurementTracker}>
      <h3>{tracker.name}</h3>
      <p>{t('trackerType')}: {tracker.type}</p>
      
      <div className={styles.valueContainer}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('enterValue')}
          disabled={loading}
        />
        <button 
          onClick={handleSave}
          disabled={loading}
        >
          {t('save')}
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          <span>{message.text}</span>
          <button 
            className={styles.closeMessage} 
            onClick={() => setMessage(null)}
            aria-label={t('close')}
          >
            ×
          </button>
        </div>
      )}

      {loading && <p className={styles.loading}>{t('loading')}...</p>}
      {error && <p className={styles.error}>{t('error')}: {error}</p>}
    </div>
  );
}; 
