import React, { useState, useEffect } from 'react';
import { Tracker } from '../types/tracker';
import { fetchTrackers, deleteTracker, updateTracker } from '../api/tracker';
import { SmokingTracker } from './SmokingTracker';
import { CreateTrackerModal } from './CreateTrackerModal';
import { EditTrackerModal } from './EditTrackerModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Dashboard.module.css';
import { useLanguage } from '../constants/labels.tsx';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTracker, setEditTracker] = useState<Tracker | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [trackerToDeleteId, setTrackerToDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadTrackers();
  }, []);

  const loadTrackers = async () => {
    try {
      setLoading(true);
      const fetchedTrackers = await fetchTrackers();
      
      // Remove tracker duplicates by name, keeping only the first one
      const uniqueTrackers = fetchedTrackers.reduce((acc: Tracker[], current) => {
        const exists = acc.find(t => t.name === current.name);
        if (!exists) {
          acc.push(current);
        } else {
          console.warn(`Found duplicate tracker: ${current.name}`);
        }
        return acc;
      }, []);

      setTrackers(uniqueTrackers);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoadingTrackers'));
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteTracker = async (trackerId: number) => {
    try {
      await deleteTracker(trackerId);
      setTrackers(prev => prev.filter(t => t.id !== trackerId));
      setMessage({
        text: t('trackerDeleted'),
        type: 'info'
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : t('errorDeletingTracker'),
        type: 'error'
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setTrackerToDeleteId(null);
    }
  };

  const confirmDeleteTracker = (trackerId: number) => {
    setTrackerToDeleteId(trackerId);
    setIsDeleteConfirmOpen(true);
  };

  const cancelDeleteTracker = () => {
    setIsDeleteConfirmOpen(false);
    setTrackerToDeleteId(null);
  };

  const handleTrackerCreated = () => {
    loadTrackers();
    setMessage({
      text: t('trackerCreated'),
      type: 'info'
    });
  };

  const handleTrackerEdit = (tracker: Tracker) => {
    setEditTracker(tracker);
  };

  const handleTrackerUpdate = async (updated: { name: string; current_value: number; target_value: number | null }) => {
    if (!editTracker) return;
    try {
      const updatedTracker = await updateTracker(editTracker.id, updated);
      setTrackers(prev => prev.map(t => t.id === editTracker.id ? updatedTracker : t));
      setMessage({ text: t('trackerUpdated'), type: 'info' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : t('errorUpdatingTracker'), type: 'error' });
    }
    setEditTracker(null);
  };

  if (loading) return <div className={styles.loading}>{t('loading')}</div>;
  if (error) return <div className={styles.error}>{t('error')}: {error}</div>;

  return (
    <div className={styles.dashboard}>
      <LanguageSwitcher />
      <h1 className={styles.title}>{t('dashboardTitle')}</h1>
      
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

      {trackers.length === 0 ? (
        <div className={styles.noTrackers}>
          <p>{t('noTrackers')}</p>
          <p>{t('addTracker')}</p>
        </div>
      ) : (
        <div className={styles.trackerGrid}>
          {trackers.map(tracker => (
            <div key={tracker.id} className={styles.trackerCard}>
              {tracker.type === 'counter' && tracker.name === 'Не курю' ? (
                <SmokingTracker onDeleted={() => executeDeleteTracker(tracker.id)} />
              ) : (
                <div className={styles.genericTracker}>
                  <h2>{tracker.name}</h2>
                  <p>{t('trackerType')}: {tracker.type}</p>
                  <p>{t('currentValue')}: {tracker.current_value}</p>
                  {tracker.target_value !== null && tracker.target_value !== undefined ? (
                    <p>{t('targetValue')}: {tracker.target_value}</p>
                  ) : (
                    <p>{t('targetValue')}: -</p>
                  )}
                  <button 
                    className={styles.deleteButton}
                    onClick={() => confirmDeleteTracker(tracker.id)}
                  >
                    {t('delete')}
                  </button>
                  <button
                    className={styles.editButton}
                    onClick={() => handleTrackerEdit(tracker)}
                  >
                    {t('edit')}
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
        + {t('addTracker')}
      </button>

      {isCreateModalOpen && (
        <CreateTrackerModal
          onClose={() => setIsCreateModalOpen(false)}
          onTrackerCreated={handleTrackerCreated}
        />
      )}

      {editTracker && (
        <EditTrackerModal
          tracker={editTracker}
          onClose={() => setEditTracker(null)}
          onSave={handleTrackerUpdate}
        />
      )}

      {isDeleteConfirmOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{t('deleteConfirmation')}</h3>
            <p>{t('deleteConfirmationMessage')}</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmButton}
                onClick={() => {
                  if (trackerToDeleteId !== null) {
                    executeDeleteTracker(trackerToDeleteId);
                  }
                }}
              >
                {t('yes')}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={cancelDeleteTracker}
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
