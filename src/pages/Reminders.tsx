import React, { useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCheckbox,
  IonActionSheet,
  IonAlert,
} from '@ionic/react';
import {
  add,
  notificationsOutline,
  timeOutline,
  calendarOutline,
  checkmarkCircleOutline,
  repeatOutline,
  bookmarkOutline,
  ellipsisVertical,
  trashOutline,
  createOutline,
  alarmOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useReminders, Reminder } from '../data/ReminderContext';
import CreateReminderModal from '../components/CreateReminderModal';
import './Reminders.css';

type SegmentFilter = 'all' | 'upcoming' | 'completed';

const Reminders: React.FC = () => {
  const {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    snoozeReminder,
    upcomingCount,
    completedCount,
    todayCount,
  } = useReminders();

  const [activeSegment, setActiveSegment] = useState<SegmentFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Action sheet & delete state
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Filter reminders
  const filteredReminders = reminders.filter((r) => {
    if (activeSegment === 'upcoming') return !r.completed;
    if (activeSegment === 'completed') return r.completed;
    return true;
  });

  const handleOpenActionSheet = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowActionSheet(true);
  };

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id' | 'completed'>) => {
    if (editingReminder) {
      updateReminder({
        ...editingReminder,
        ...reminderData,
      });
      setEditingReminder(null);
    } else {
      addReminder(reminderData);
    }
  };

  return (
    <IonPage className="reminders-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="reminders-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/home" className="reminders-back-btn" />
          </IonButtons>
          <IonTitle className="ion-text-center" style={{ fontWeight: 700 }}>
            Reminders
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              className="reminders-header-add-btn"
              onClick={() => {
                setEditingReminder(null);
                setShowCreateModal(true);
              }}
              title="Add Reminder"
            >
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="reminders-content">
        <div className="reminders-scroll-container">
          {/* Summary Stat Banner */}
          <div className="reminders-summary-grid">
            <div className="summary-stat-card">
              <div className="stat-value">
                <IonIcon icon={timeOutline} className="stat-icon" />
                <span>{upcomingCount}</span>
              </div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="summary-stat-card">
              <div className="stat-value stat-today">
                <IonIcon icon={calendarOutline} className="stat-icon" />
                <span>{todayCount}</span>
              </div>
              <div className="stat-label">Due Today</div>
            </div>
            <div className="summary-stat-card">
              <div className="stat-value stat-success">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon" />
                <span>{completedCount}</span>
              </div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          {/* Sub-tab Segment Bar */}
          <div className="reminder-segment-wrapper">
            <IonSegment
              value={activeSegment}
              onIonChange={(e) => setActiveSegment(e.detail.value as SegmentFilter)}
              className="reminders-main-segment"
            >
              <IonSegmentButton value="all">
                <IonLabel>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="upcoming">
                <IonLabel>Upcoming</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="completed">
                <IonLabel>Completed</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* Reminders Cards List */}
          {filteredReminders.length > 0 ? (
            <div className="reminders-list">
              {filteredReminders.map((reminder) => (
                <IonCard
                  key={reminder.id}
                  className={`reminder-card ${reminder.completed ? 'reminder-card-completed' : ''}`}
                >
                  <div className="reminder-card-body">
                    {/* Left: Checkbox */}
                    <div className="reminder-check-col">
                      <IonCheckbox
                        checked={reminder.completed}
                        onIonChange={() => toggleReminder(reminder.id)}
                        className="reminder-checkbox"
                      />
                    </div>

                    {/* Middle: Content */}
                    <div
                      className="reminder-content-col"
                      onClick={() => toggleReminder(reminder.id)}
                    >
                      <div className="reminder-title-row">
                        <h3 className="reminder-label">{reminder.label}</h3>
                      </div>

                      {/* Time and Metadata Tags */}
                      <div className="reminder-meta-row">
                        <span className="reminder-time-tag">
                          <IonIcon icon={timeOutline} />
                          {reminder.time}
                        </span>
                        <span className="reminder-date-tag">
                          <IonIcon icon={calendarOutline} />
                          {reminder.date}
                        </span>
                        {reminder.repeat !== 'none' && (
                          <span className="reminder-pill-tag repeat">
                            <IonIcon icon={repeatOutline} />
                            {reminder.repeat}
                          </span>
                        )}
                        {reminder.notifyBefore && (
                          <span className="reminder-pill-tag alert">
                            <IonIcon icon={notificationsOutline} />
                            {reminder.notifyBefore}
                          </span>
                        )}
                      </div>

                      {/* Linked Task or Routine Pill */}
                      {reminder.linkedTaskId && (
                        <div className="linked-badge-row">
                          <span className="linked-badge task">
                            <IonIcon icon={bookmarkOutline} />
                            Linked to Scheduled Task
                          </span>
                        </div>
                      )}
                      {reminder.linkedRoutineId && (
                        <div className="linked-badge-row">
                          <span className="linked-badge routine">
                            <IonIcon icon={repeatOutline} />
                            Linked to Habit Routine
                          </span>
                        </div>
                      )}

                      {/* Optional Notes */}
                      {reminder.notes && (
                        <p className="reminder-notes-text">{reminder.notes}</p>
                      )}
                    </div>

                    {/* Right: Options Menu */}
                    <div className="reminder-options-col">
                      <button
                        className="reminder-options-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionSheet(reminder);
                        }}
                        title="Reminder options"
                      >
                        <IonIcon icon={ellipsisVertical} />
                      </button>
                    </div>
                  </div>
                </IonCard>
              ))}
            </div>
          ) : (
            <div className="reminders-empty-state">
              <div className="empty-icon-box">
                <IonIcon icon={notificationsOutline} />
              </div>
              <h4>No reminders found</h4>
              <p>Keep track of assignment deadlines, lectures, and daily habit alerts.</p>
              <button
                className="empty-create-btn"
                onClick={() => {
                  setEditingReminder(null);
                  setShowCreateModal(true);
                }}
              >
                <IonIcon icon={sparklesOutline} />
                Add New Reminder
              </button>
            </div>
          )}
        </div>

        {/* Background Waves — fixed */}
        <div slot="fixed" className="reminders-waves-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              fill="rgba(116, 198, 157, 0.15)"
              d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
            <path
              fill="rgba(116, 198, 157, 0.25)"
              d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
            <path
              fill="rgba(116, 198, 157, 0.35)"
              d="M0,288L80,277.3C160,267,320,245,480,245.3C640,245,800,267,960,277.3C1120,288,1280,288,1360,288L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* Floating Pill Action Button */}
        <div className="floating-pill-container">
          <button
            className="pill-button"
            onClick={() => {
              setEditingReminder(null);
              setShowCreateModal(true);
            }}
          >
            <IonIcon icon={add} style={{ marginRight: '8px' }} />
            Add Reminder
          </button>
        </div>

        {/* Create / Edit Reminder Modal */}
        <CreateReminderModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingReminder(null);
          }}
          onSave={handleSaveReminder}
          editingReminder={editingReminder}
        />

        {/* Action Sheet */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={selectedReminder?.label || 'Reminder Options'}
          buttons={[
            {
              text: 'Snooze 15 minutes',
              icon: alarmOutline,
              handler: () => {
                if (selectedReminder) snoozeReminder(selectedReminder.id, 15);
              },
            },
            {
              text: 'Snooze 1 hour',
              icon: alarmOutline,
              handler: () => {
                if (selectedReminder) snoozeReminder(selectedReminder.id, 60);
              },
            },
            {
              text: 'Edit Reminder',
              icon: createOutline,
              handler: () => {
                if (selectedReminder) {
                  setEditingReminder(selectedReminder);
                  setShowCreateModal(true);
                }
              },
            },
            {
              text: 'Delete Reminder',
              role: 'destructive',
              icon: trashOutline,
              handler: () => {
                setShowDeleteAlert(true);
              },
            },
            {
              text: 'Cancel',
              role: 'cancel',
            },
          ]}
        />

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Reminder"
          message={`Are you sure you want to delete "${selectedReminder?.label}"?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: () => {
                if (selectedReminder) {
                  deleteReminder(selectedReminder.id);
                  setSelectedReminder(null);
                }
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Reminders;
