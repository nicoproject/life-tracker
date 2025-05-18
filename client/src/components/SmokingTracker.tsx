import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry, TrackerStatus } from '../types/tracker';
import { fetchTrackers, fetchTrackerEntries, updateTrackerEntry, createTracker, deleteTracker } from '../api/tracker';
import styles from './SmokingTracker.module.css';
import { useLanguage } from '../constants/labels.tsx';

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
  const { t } = useLanguage();
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
      }, 5000); // Message will be shown for 5 seconds

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
          // Remove duplicates and sort
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
        setError(err instanceof Error ? err.message : t('errorLoadingTrackers'));
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
      
      // Check for an entry of the same type for today
      const hasSameStatusToday = entries.some(e => 
        e.date === today && e.status === status
      );
      
      if (hasSameStatusToday) {
        const messages: { failure: string; success: string; reset: string } = {
          failure: t('alreadyMarkedFailure'),
          success: t('alreadyMarkedSuccess'),
          reset: t('alreadyReset')
        };
        
        setMessage({
          text: messages[status as keyof typeof messages],
          type: 'info'
        });
        return;
      }

      // Check if the counter can be reset
      if (status === 'reset' && tracker.current_value === 0) {
        setMessage({ text: t('counterAlreadyReset'), type: 'info' });
        return;
      }

      const entry = await updateTrackerEntry(tracker.id, {
        date: today,
        status,
        notes: status === 'failure' ? t('statusFailure') : undefined,
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
          setMessage({ text: t('entryAlreadyExists'), type: 'info' });
          return prev;
        }
        
        return [entry, ...prev].sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.entry_time);
          const dateB = new Date(b.date + 'T' + b.entry_time);
          return dateB.getTime() - dateA.getTime();
        });
      });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : t('errorLoadingTrackers'), type: 'error' });
    }
  };

  const handleDeleteTracker = async () => {
    if (!tracker) return;

    try {
      await deleteTracker(tracker.id);
      setMessage({ text: t('trackerDeleted'), type: 'info' });
      onDeleted?.(tracker.id);
      setTracker(null);
      setEntries([]);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : t('errorDeletingTracker'), type: 'error' });
    }
  };

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div>{t('error')}: {error}</div>;
  if (!tracker) return <div>{t('errorLoadingTrackers')}</div>;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);

  return (
    <div className={styles.smokingTracker}>
      <h2>{t('smokingTracker')}</h2>
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
      <div className={styles.currentStats}>
        <p>{t('daysWithoutSmoking')}: {tracker.current_value}</p>
      </div>
      <div className={styles.actions}>
        <button 
          onClick={() => handleStatusChange('success')}
          disabled={todayEntries.some(e => e.status === 'success')}
        >
          {t('markSuccessfulDay')}
        </button>
        <button 
          onClick={() => handleStatusChange('failure')}
          disabled={todayEntries.some(e => e.status === 'failure')}
        >
          {t('markFailure')}
        </button>
        <button 
          onClick={() => handleStatusChange('reset')}
          disabled={todayEntries.some(e => e.status === 'reset') || tracker.current_value === 0}
        >
          {t('resetCounter')}
        </button>
        <button onClick={() => setIsHistoryOpen(true)}>
          {t('showHistory')}
        </button>
        <button 
          className={styles.deleteButton}
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          {t('delete')}
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
            <h3>{t('trackerHistory')} ({entries.length} {entries.length === 1 ? t('entry') : t('entries')})</h3>
            <ul className={styles.historyList}>
              {entries.map(entry => (
                <li key={`${entry.date}-${entry.entry_time}-${entry.status}`}>
                  {formatDateTime(entry.date, entry.entry_time)}: {entry.status === 'success' ? t('statusSuccess') : entry.status === 'failure' ? t('statusFailure') : t('statusReset')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className={styles.modal}>
          <div className={`${styles.modalContent} ${styles.confirmDialog}`}>
            <h3>{t('deleteConfirmation')}</h3>
            <p>{t('deleteConfirmationMessage')}</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmButton}
                onClick={handleDeleteTracker}
              >
                {t('yes')}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
