import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonProgressBar,
  IonAlert,
  IonActionSheet,
} from '@ionic/react';
import {
  add,
  repeatOutline,
  flameOutline,
  refreshOutline,
  checkmarkCircleOutline,
  sunnyOutline,
  moonOutline,
  bookOutline,
  fitnessOutline,
  briefcaseOutline,
  heartOutline,
  ellipsisVertical,
  trashOutline,
  createOutline,
  checkmarkDoneOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useRoutines, Routine } from '../data/RoutineContext';
import RoutineChecklist from '../components/RoutineChecklist';
import CreateRoutineModal from '../components/CreateRoutineModal';
import './Routines.css';

type SegmentFilter = 'all' | 'daily' | 'weekly' | 'custom';

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'morning':
      return sunnyOutline;
    case 'evening':
      return moonOutline;
    case 'study':
      return bookOutline;
    case 'fitness':
      return fitnessOutline;
    case 'work':
      return briefcaseOutline;
    case 'wellness':
      return heartOutline;
    default:
      return repeatOutline;
  }
};

const Routines: React.FC = () => {
  const {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleStep,
    resetRoutine,
    markAllStepsDone,
    completedTodayCount,
    totalActiveCount,
    bestStreak,
  } = useRoutines();

  const [activeSegment, setActiveSegment] = useState<SegmentFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Action Sheet & Alert state
  const [selectedRoutineForAction, setSelectedRoutineForAction] = useState<Routine | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Filter routines based on segment
  const filteredRoutines = routines.filter((routine) => {
    if (activeSegment === 'all') return true;
    return routine.type === activeSegment;
  });

  const handleOpenActionSheet = (routine: Routine) => {
    setSelectedRoutineForAction(routine);
    setShowActionSheet(true);
  };

  const handleSaveRoutine = (routineData: Omit<Routine, 'id' | 'streak'>) => {
    if (editingRoutine) {
      updateRoutine({
        ...editingRoutine,
        ...routineData,
      });
      setEditingRoutine(null);
    } else {
      addRoutine(routineData);
    }
  };

  return (
    <IonPage className="routines-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="routines-toolbar">
          <div slot="start" style={{ width: '48px' }}></div>
          <IonTitle className="ion-text-center" style={{ fontWeight: 'bold' }}>
            Routines
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              className="routine-header-add-btn"
              onClick={() => {
                setEditingRoutine(null);
                setShowCreateModal(true);
              }}
              title="Add New Routine"
            >
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="routines-content">
        <div className="routines-scroll-container">
          {/* Summary Stat Banner */}
          <div className="routines-summary-grid">
            <div className="summary-stat-card">
              <div className="stat-value">{totalActiveCount}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="summary-stat-card">
              <div className="stat-value stat-success">{completedTodayCount}</div>
              <div className="stat-label">Done Today</div>
            </div>
            <div className="summary-stat-card">
              <div className="stat-value stat-streak">
                <IonIcon icon={flameOutline} className="streak-icon" />
                <span>{bestStreak}d</span>
              </div>
              <div className="stat-label">Top Streak</div>
            </div>
          </div>

          {/* Sub-tab Segment Bar (Daily / Weekly / Custom) */}
          <div className="routine-segment-wrapper">
            <IonSegment
              value={activeSegment}
              onIonChange={(e) => setActiveSegment(e.detail.value as SegmentFilter)}
              className="routines-main-segment"
            >
              <IonSegmentButton value="all">
                <IonLabel>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="daily">
                <IonLabel>Daily</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="weekly">
                <IonLabel>Weekly</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="custom">
                <IonLabel>Custom</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* Routine Cards List */}
          {filteredRoutines.length > 0 ? (
            <div className="routines-list">
              {filteredRoutines.map((routine) => {
                const totalSteps = routine.steps.length;
                const completedSteps = routine.steps.filter((s) => s.done).length;
                const isComplete = totalSteps > 0 && completedSteps === totalSteps;
                const progressRatio = totalSteps > 0 ? completedSteps / totalSteps : 0;
                const percentInt = Math.round(progressRatio * 100);

                return (
                  <IonCard
                    key={routine.id}
                    className={`routine-card ${isComplete ? 'routine-card-complete' : ''}`}
                  >
                    {/* Top Row: Icon, Title, Badges, Menu Button */}
                    <div className="routine-card-header">
                      <div className="routine-header-left">
                        <div className={`routine-icon-badge ${routine.category?.toLowerCase() || 'default'}`}>
                          <IonIcon icon={getCategoryIcon(routine.category)} />
                        </div>
                        <div className="routine-title-box">
                          <h3 className="routine-card-title">{routine.name}</h3>
                          <div className="routine-card-meta">
                            <span className="routine-type-tag">{routine.type}</span>
                            {routine.targetTime && (
                              <>
                                <span className="meta-dot">•</span>
                                <span className="routine-time-tag">{routine.targetTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="routine-header-right">
                        {routine.streak > 0 && (
                          <div className="routine-streak-pill" title={`${routine.streak} streak`}>
                            <IonIcon icon={flameOutline} />
                            <span>{routine.streak}d</span>
                          </div>
                        )}
                        <button
                          className="routine-options-btn"
                          onClick={() => handleOpenActionSheet(routine)}
                          title="Routine options"
                        >
                          <IonIcon icon={ellipsisVertical} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Counter */}
                    <div className="routine-progress-container">
                      <div className="routine-progress-info">
                        <span className="progress-counter">
                          {completedSteps}/{totalSteps} steps completed
                        </span>
                        <span className={`progress-percentage ${isComplete ? 'complete' : ''}`}>
                          {percentInt}%
                        </span>
                      </div>
                      <IonProgressBar
                        value={progressRatio}
                        color={isComplete ? 'success' : 'secondary'}
                        className="routine-progress-bar"
                      />
                    </div>

                    {/* Steps Checklist */}
                    <div className="routine-checklist-container">
                      <RoutineChecklist
                        steps={routine.steps}
                        onToggle={(stepId) => toggleStep(routine.id, stepId)}
                      />
                    </div>

                    {/* Completion Banner or Card Footer */}
                    {isComplete ? (
                      <div className="routine-complete-banner">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span>Completed! Momentum streak active.</span>
                      </div>
                    ) : (
                      <div className="routine-card-footer">
                        <button
                          className="routine-footer-action-btn"
                          onClick={() => markAllStepsDone(routine.id)}
                        >
                          <IonIcon icon={checkmarkDoneOutline} />
                          <span>Mark all done</span>
                        </button>
                        <button
                          className="routine-footer-action-btn"
                          onClick={() => resetRoutine(routine.id)}
                        >
                          <IonIcon icon={refreshOutline} />
                          <span>Reset</span>
                        </button>
                      </div>
                    )}
                  </IonCard>
                );
              })}
            </div>
          ) : (
            <div className="routines-empty-state">
              <div className="empty-icon-box">
                <IonIcon icon={repeatOutline} />
              </div>
              <h4>No routines in this section</h4>
              <p>Create consistent habits to automate your success every day.</p>
              <button
                className="empty-create-btn"
                onClick={() => {
                  setEditingRoutine(null);
                  setShowCreateModal(true);
                }}
              >
                <IonIcon icon={sparklesOutline} />
                Create New Routine
              </button>
            </div>
          )}
        </div>

        {/* Background Waves — fixed */}
        <div slot="fixed" className="routines-waves-bg">
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

        {/* Floating Action Button - Pill shaped (matching Schedule) */}
        <div className="floating-pill-container">
          <button
            className="pill-button"
            onClick={() => {
              setEditingRoutine(null);
              setShowCreateModal(true);
            }}
          >
            <IonIcon icon={add} style={{ marginRight: '8px' }} />
            Add Routine
          </button>
        </div>

        {/* Create / Edit Routine Modal */}
        <CreateRoutineModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRoutine(null);
          }}
          onSave={handleSaveRoutine}
          editingRoutine={editingRoutine}
        />

        {/* Action Sheet for Routine Options */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={selectedRoutineForAction?.name || 'Routine Options'}
          buttons={[
            {
              text: 'Reset / Uncheck Steps',
              icon: refreshOutline,
              handler: () => {
                if (selectedRoutineForAction) {
                  resetRoutine(selectedRoutineForAction.id);
                }
              },
            },
            {
              text: 'Edit Routine',
              icon: createOutline,
              handler: () => {
                if (selectedRoutineForAction) {
                  setEditingRoutine(selectedRoutineForAction);
                  setShowCreateModal(true);
                }
              },
            },
            {
              text: 'Delete Routine',
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
          header="Delete Routine"
          message={`Are you sure you want to delete "${selectedRoutineForAction?.name}"?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: () => {
                if (selectedRoutineForAction) {
                  deleteRoutine(selectedRoutineForAction.id);
                  setSelectedRoutineForAction(null);
                }
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Routines;
