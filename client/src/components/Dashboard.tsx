import React, { useState, useEffect } from 'react';
import { Tracker } from '../types/tracker';
import { fetchTrackers, deleteTracker, updateTracker } from '../api/tracker';
import { SmokingTracker } from './SmokingTracker';
import { MeasurementTracker } from './MeasurementTracker';
import { CreateTrackerModal } from './CreateTrackerModal';
import { EditTrackerModal } from './EditTrackerModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Dashboard.module.css';
import { useLanguage } from '../constants/labels.tsx';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Tracker card content ---
function TrackerCardContent({ tracker, selectedDate, i18n, onDelete, onEdit, onReload }: any) {
  if (tracker.type === 'counter' && tracker.name === 'Не курю') {
    return <SmokingTracker onDeleted={onReload} />;
  } else if (tracker.type === 'measurement') {
    return <MeasurementTracker tracker={tracker} selectedDate={selectedDate} />;
  } else {
    return (
      <div className={styles.genericTracker}>
        <h2>{tracker.name}</h2>
        <p>{i18n('trackerType')}: {tracker.type}</p>
        <p>{i18n('currentValue')}: {tracker.current_value}</p>
        {tracker.target_value !== null && tracker.target_value !== undefined ? (
          <p>{i18n('targetValue')}: {tracker.target_value}</p>
        ) : (
          <p>{i18n('targetValue')}: -</p>
        )}
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(tracker.id)}
        >
          {i18n('delete')}
        </button>
        <button
          className={styles.editButton}
          onClick={() => onEdit(tracker)}
        >
          {i18n('edit')}
        </button>
      </div>
    );
  }
}

// --- Sortable tracker card ---
function SortableTrackerCard({ tracker, index, children }: { tracker: Tracker; index: number; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: tracker.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        styles.trackerCard +
        (isDragging ? ' ' + styles.dragging : '') +
        (isOver ? ' ' + styles.placeholder : '')
      }
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const { i18n, language } = useLanguage();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTracker, setEditTracker] = useState<Tracker | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [trackerToDeleteId, setTrackerToDeleteId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format the selected date
  const formattedDate = selectedDate.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Functions for date navigation
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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
      setError(err instanceof Error ? err.message : i18n('errorLoadingTrackers'));
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteTracker = async (trackerId: number) => {
    try {
      await deleteTracker(trackerId);
      setTrackers(prev => prev.filter(t => t.id !== trackerId));
      setMessage({
        text: i18n('trackerDeleted'),
        type: 'info'
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : i18n('errorDeletingTracker'),
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
      text: i18n('trackerCreated'),
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
      setMessage({ text: i18n('trackerUpdated'), type: 'info' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : i18n('errorUpdatingTracker'), type: 'error' });
    }
    setEditTracker(null);
  };

  // DnD-kit handlers
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (active.id !== over?.id) {
      const oldIndex = trackers.findIndex(t => t.id === active.id);
      const newIndex = trackers.findIndex(t => t.id === over.id);
      setTrackers((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const getActiveTracker = () => trackers.find(t => t.id === activeId);

  if (loading) return <div className={styles.loading}>{i18n('loading')}</div>;
  if (error) return <div className={styles.error}>{i18n('error')}: {error}</div>;

  return (
    <div className={styles.dashboard}>
      <LanguageSwitcher />
      <h1 className={styles.title}>{i18n('dashboardTitle')}</h1>
      <div className={styles.dateNavigation}>
        <button onClick={goToPreviousDay}>{'<'}</button>
        <p className={styles.selectedDate}>{formattedDate}</p>
        <button onClick={goToNextDay}>{'>'}</button>
      </div>
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          <span>{message.text}</span>
          <button 
            className={styles.closeMessage} 
            onClick={() => setMessage(null)}
            aria-label={i18n('close')}
          >
            ×
          </button>
        </div>
      )}
      {trackers.length === 0 ? (
        <div className={styles.noTrackers}>
          <p>{i18n('noTrackers')}</p>
          <p>{i18n('addTracker')}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={trackers.map(t => t.id)}
            strategy={rectSortingStrategy}
          >
            <div style={{position: 'relative'}}>
              {activeId && (
                <div className={styles.dragOverlayBackground} />
              )}
              <div className={styles.trackerGrid}>
                {trackers.map((tracker, index) => (
                  <SortableTrackerCard key={tracker.id} tracker={tracker} index={index}>
                    <TrackerCardContent
                      tracker={tracker}
                      selectedDate={selectedDate}
                      i18n={i18n}
                      onDelete={confirmDeleteTracker}
                      onEdit={handleTrackerEdit}
                      onReload={loadTrackers}
                    />
                  </SortableTrackerCard>
                ))}
              </div>
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div
                className={styles.trackerCard}
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)', opacity: 1, transition: 'none', zIndex: 100 }}
              >
                <TrackerCardContent
                  tracker={getActiveTracker()}
                  selectedDate={selectedDate}
                  i18n={i18n}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  onReload={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      <button 
        className={styles.addButton}
        onClick={() => setIsCreateModalOpen(true)}
      >
        + {i18n('addTracker')}
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
            <h3>{i18n('deleteConfirmation')}</h3>
            <p>{i18n('deleteConfirmationMessage')}</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmButton}
                onClick={() => {
                  if (trackerToDeleteId !== null) {
                    executeDeleteTracker(trackerToDeleteId);
                  }
                }}
              >
                {i18n('yes')}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={cancelDeleteTracker}
              >
                {i18n('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
