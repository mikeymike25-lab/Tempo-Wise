import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonInput,
  IonTextarea,
  IonDatetime,
} from '@ionic/react';
import {
  closeOutline,
  calendarOutline,
  timeOutline,
  notificationsOutline,
  linkOutline,
  bookmarkOutline,
  repeatOutline,
  chevronDownOutline,
  chevronUpOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { Reminder, ReminderRepeat, ReminderNotifyBefore } from '../data/ReminderContext';
import { useTasks, Task } from '../data/TaskContext';
import { useRoutines, Routine } from '../data/RoutineContext';
import './CreateReminderModal.css';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  editingReminder?: Reminder | null;
}

const REPEAT_OPTIONS: { id: ReminderRepeat; label: string }[] = [
  { id: 'none', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

const NOTIFY_OPTIONS: { id: ReminderNotifyBefore; label: string }[] = [
  { id: 'at-time', label: 'At event time' },
  { id: '5-min', label: '5m before' },
  { id: '10-min', label: '10m before' },
  { id: '15-min', label: '15m before' },
  { id: '30-min', label: '30m before' },
  { id: '1-hour', label: '1h before' },
  { id: '1-day', label: '1 day before' },
];

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingReminder,
}) => {
  const { tasks } = useTasks();
  const { routines } = useRoutines();

  const [label, setLabel] = useState('');
  const [dateIso, setDateIso] = useState('2026-09-17T08:00:00');
  const [displayDate, setDisplayDate] = useState('September 17, 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [timeIso, setTimeIso] = useState('2026-09-17T08:00:00');
  const [displayTime, setDisplayTime] = useState('08:00 AM');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [repeat, setRepeat] = useState<ReminderRepeat>('none');
  const [notifyBefore, setNotifyBefore] = useState<ReminderNotifyBefore>('15-min');
  const [notes, setNotes] = useState('');

  // Linking state
  const [linkType, setLinkType] = useState<'none' | 'task' | 'routine'>('none');
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>(undefined);
  const [linkedRoutineId, setLinkedRoutineId] = useState<string | undefined>(undefined);

  const [errorMessage, setErrorMessage] = useState('');

  // Reset or populate fields
  useEffect(() => {
    if (editingReminder) {
      setLabel(editingReminder.label);
      setDisplayDate(editingReminder.date);
      setDisplayTime(editingReminder.time);
      setRepeat(editingReminder.repeat);
      setNotifyBefore(editingReminder.notifyBefore);
      setNotes(editingReminder.notes || '');

      if (editingReminder.linkedTaskId) {
        setLinkType('task');
        setLinkedTaskId(editingReminder.linkedTaskId);
        setLinkedRoutineId(undefined);
      } else if (editingReminder.linkedRoutineId) {
        setLinkType('routine');
        setLinkedRoutineId(editingReminder.linkedRoutineId);
        setLinkedTaskId(undefined);
      } else {
        setLinkType('none');
        setLinkedTaskId(undefined);
        setLinkedRoutineId(undefined);
      }
    } else {
      const now = new Date();
      const monthName = now.toLocaleDateString('en-US', { month: 'long' });
      const day = now.getDate();
      const year = now.getFullYear();
      const formatted = `${monthName} ${day}, ${year}`;

      setLabel('');
      setDateIso(now.toISOString());
      setDisplayDate(formatted);
      setShowDatePicker(false);

      setTimeIso(now.toISOString());
      setDisplayTime('08:00 AM');
      setShowTimePicker(false);

      setRepeat('none');
      setNotifyBefore('15-min');
      setNotes('');
      setLinkType('none');
      setLinkedTaskId(undefined);
      setLinkedRoutineId(undefined);
    }
    setErrorMessage('');
  }, [editingReminder, isOpen]);

  const handleDateChange = (val: string) => {
    setDateIso(val);
    const cleanDate = val.split('T')[0];
    const [y, m, d] = cleanDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    setDisplayDate(
      dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  };

  const handleTimeChange = (val: string) => {
    setTimeIso(val);
    let timeStr = val;
    if (val.includes('T')) {
      timeStr = val.split('T')[1];
    }
    const [hoursStr, minsStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const mins = minsStr.slice(0, 2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setDisplayTime(`${hours}:${mins} ${ampm}`);
  };

  const handleSelectTask = (task: Task) => {
    setLinkedTaskId(task.id);
    setLinkedRoutineId(undefined);
    if (!label || label === '') {
      setLabel(`Task: ${task.title}`);
    }
    if (task.time) {
      setDisplayTime(task.time);
    }
    if (task.notes && !notes) {
      setNotes(task.notes);
    }
  };

  const handleSelectRoutine = (routine: Routine) => {
    setLinkedRoutineId(routine.id);
    setLinkedTaskId(undefined);
    if (!label || label === '') {
      setLabel(`Routine: ${routine.name}`);
    }
    if (routine.type === 'daily') setRepeat('daily');
    if (routine.type === 'weekly') setRepeat('weekly');
    if (routine.targetTime) {
      setDisplayTime(routine.targetTime);
    }
  };

  const handleSave = () => {
    if (!label.trim()) {
      setErrorMessage('Please enter a title for this reminder.');
      return;
    }

    onSave({
      label: label.trim(),
      date: displayDate,
      time: displayTime,
      repeat,
      notifyBefore,
      linkedTaskId: linkType === 'task' ? linkedTaskId : undefined,
      linkedRoutineId: linkType === 'routine' ? linkedRoutineId : undefined,
      category:
        linkType === 'task'
          ? 'Task'
          : linkType === 'routine'
          ? 'Routine'
          : 'Personal',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="reminder-modal-sheet"
      initialBreakpoint={0.9}
      breakpoints={[0, 0.9, 1]}
    >
      <IonHeader className="ion-no-border reminder-modal-header">
        <IonToolbar className="reminder-modal-toolbar">
          <IonTitle className="reminder-modal-title">
            {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose} className="reminder-modal-close-btn">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="reminder-modal-content">
        <div className="reminder-modal-inner">
          {errorMessage && (
            <div className="reminder-error-banner">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reminder Title Input */}
          <div className="reminder-form-group">
            <label className="reminder-field-label">Reminder Title</label>
            <IonInput
              className="reminder-text-input"
              value={label}
              placeholder="e.g. Mathematics Class, Submit Assignment"
              onIonInput={(e) => {
                setLabel(e.detail.value || '');
                if (errorMessage) setErrorMessage('');
              }}
            />
          </div>

          {/* Link to Task or Routine (Optional) */}
          <div className="reminder-form-group">
            <div className="reminder-link-header">
              <label className="reminder-field-label" style={{ margin: 0 }}>
                <IonIcon icon={linkOutline} style={{ marginRight: '6px' }} />
                Link to Task or Routine (Optional)
              </label>
            </div>
            <div className="link-mode-chips">
              <button
                type="button"
                className={`link-chip ${linkType === 'none' ? 'active' : ''}`}
                onClick={() => {
                  setLinkType('none');
                  setLinkedTaskId(undefined);
                  setLinkedRoutineId(undefined);
                }}
              >
                Standalone
              </button>
              <button
                type="button"
                className={`link-chip ${linkType === 'task' ? 'active' : ''}`}
                onClick={() => setLinkType('task')}
              >
                <IonIcon icon={bookmarkOutline} />
                <span>Link Task</span>
              </button>
              <button
                type="button"
                className={`link-chip ${linkType === 'routine' ? 'active' : ''}`}
                onClick={() => setLinkType('routine')}
              >
                <IonIcon icon={repeatOutline} />
                <span>Link Routine</span>
              </button>
            </div>

            {/* Task selection list */}
            {linkType === 'task' && (
              <div className="linked-selector-box">
                <span className="selector-hint">Select a task to pre-fill schedule details:</span>
                <div className="linked-items-list">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`linked-item-pill ${linkedTaskId === task.id ? 'selected' : ''}`}
                      onClick={() => handleSelectTask(task)}
                    >
                      <div className="linked-item-title">{task.title}</div>
                      <div className="linked-item-sub">{task.time} {task.location ? `• ${task.location}` : ''}</div>
                      {linkedTaskId === task.id && (
                        <IonIcon icon={checkmarkOutline} className="linked-check" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Routine selection list */}
            {linkType === 'routine' && (
              <div className="linked-selector-box">
                <span className="selector-hint">Select a routine to align habits:</span>
                <div className="linked-items-list">
                  {routines.map((routine) => (
                    <div
                      key={routine.id}
                      className={`linked-item-pill ${linkedRoutineId === routine.id ? 'selected' : ''}`}
                      onClick={() => handleSelectRoutine(routine)}
                    >
                      <div className="linked-item-title">{routine.name}</div>
                      <div className="linked-item-sub">{routine.type} • {routine.targetTime || 'Anytime'}</div>
                      {linkedRoutineId === routine.id && (
                        <IonIcon icon={checkmarkOutline} className="linked-check" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Picker Row */}
          <div className="reminder-form-group">
            <label className="reminder-field-label">Date</label>
            <div
              className="reminder-picker-card"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowTimePicker(false);
              }}
            >
              <div className="picker-card-left">
                <IonIcon icon={calendarOutline} className="picker-icon" />
                <span className="picker-value-text">{displayDate}</span>
              </div>
              <IonIcon
                icon={showDatePicker ? chevronUpOutline : chevronDownOutline}
                className="picker-chevron"
              />
            </div>

            {showDatePicker && (
              <div className="datetime-expand-box">
                <IonDatetime
                  presentation="date"
                  value={dateIso}
                  preferWheel={false}
                  onIonChange={(e) => {
                    if (e.detail.value) {
                      handleDateChange(e.detail.value as string);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Time Picker Row */}
          <div className="reminder-form-group">
            <label className="reminder-field-label">Time</label>
            <div
              className="reminder-picker-card"
              onClick={() => {
                setShowTimePicker(!showTimePicker);
                setShowDatePicker(false);
              }}
            >
              <div className="picker-card-left">
                <IonIcon icon={timeOutline} className="picker-icon" />
                <span className="picker-value-text">{displayTime}</span>
              </div>
              <IonIcon
                icon={showTimePicker ? chevronUpOutline : chevronDownOutline}
                className="picker-chevron"
              />
            </div>

            {showTimePicker && (
              <div className="datetime-expand-box">
                <IonDatetime
                  presentation="time"
                  value={timeIso}
                  preferWheel={true}
                  onIonChange={(e) => {
                    if (e.detail.value) {
                      handleTimeChange(e.detail.value as string);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Repeat Frequency */}
          <div className="reminder-form-group">
            <label className="reminder-field-label">Repeat</label>
            <div className="repeat-chips-row">
              {REPEAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`repeat-chip ${repeat === opt.id ? 'active' : ''}`}
                  onClick={() => setRepeat(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Alert Lead Time */}
          <div className="reminder-form-group">
            <label className="reminder-field-label">
              <IonIcon icon={notificationsOutline} style={{ marginRight: '6px' }} />
              Notification Alert
            </label>
            <div className="notify-chips-row">
              {NOTIFY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`notify-chip ${notifyBefore === opt.id ? 'active' : ''}`}
                  onClick={() => setNotifyBefore(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="reminder-form-group">
            <label className="reminder-field-label">Notes (Optional)</label>
            <IonTextarea
              className="reminder-textarea"
              value={notes}
              rows={3}
              placeholder="Additional details, checklist, or preparation tips..."
              onIonInput={(e) => setNotes(e.detail.value || '')}
            />
          </div>

          {/* Submit Button */}
          <div className="reminder-modal-actions">
            <IonButton
              expand="block"
              shape="round"
              className="reminder-submit-btn"
              onClick={handleSave}
            >
              {editingReminder ? 'Save Changes' : 'Set Reminder'}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default CreateReminderModal;
