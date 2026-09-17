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
  IonLabel,
  IonInput,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import {
  closeOutline,
  add,
  trashOutline,
  sparklesOutline,
  checkmarkOutline,
  sunnyOutline,
  moonOutline,
  bookOutline,
  fitnessOutline,
  briefcaseOutline,
  heartOutline,
} from 'ionicons/icons';
import { Routine, RoutineStep } from '../data/RoutineContext';
import './CreateRoutineModal.css';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: Omit<Routine, 'id' | 'streak'>) => void;
  editingRoutine?: Routine | null;
}

const CATEGORIES = [
  { id: 'Morning', icon: sunnyOutline, label: 'Morning' },
  { id: 'Evening', icon: moonOutline, label: 'Evening' },
  { id: 'Study', icon: bookOutline, label: 'Study' },
  { id: 'Fitness', icon: fitnessOutline, label: 'Fitness' },
  { id: 'Work', icon: briefcaseOutline, label: 'Work' },
  { id: 'Wellness', icon: heartOutline, label: 'Wellness' },
];

const SUGGESTIONS: Record<string, string[]> = {
  Morning: [
    'Drink 500ml cold water',
    '10-minute mindful stretching',
    "Review today's schedule",
    'Healthy breakfast & tea',
  ],
  Evening: [
    'Tidy desk and workspace',
    'Prep outfit & bag for tomorrow',
    'Read 15 pages of a book',
    '30m screen-free wind-down',
  ],
  Study: [
    'Clear desk distractions',
    'Set 25m Pomodoro goal',
    'Review lecture notes',
    'Water bottle ready',
  ],
  Fitness: [
    'Fill water bottle',
    '5-minute warm-up',
    'Post-workout stretch',
    'Protein recovery snack',
  ],
  Wellness: [
    '5 minutes deep breathing',
    'Write 3 gratitude points',
    'Take multivitamins',
    'Afternoon walk outside',
  ],
  Work: [
    'Clear top priority item first',
    'Check and archive emails',
    'Update task board',
    'Clean workspace end of day',
  ],
};

const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRoutine,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [category, setCategory] = useState('Morning');
  const [targetTime, setTargetTime] = useState('08:00 AM');
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [newStepText, setNewStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset or populate fields when opened
  useEffect(() => {
    if (editingRoutine) {
      setName(editingRoutine.name);
      setType(editingRoutine.type);
      setCategory(editingRoutine.category || 'Morning');
      setTargetTime(editingRoutine.targetTime || '08:00 AM');
      setSteps(editingRoutine.steps);
    } else {
      setName('');
      setType('daily');
      setCategory('Morning');
      setTargetTime('08:00 AM');
      setSteps([
        { id: `st-1`, label: 'Drink a glass of fresh water', done: false },
        { id: `st-2`, label: '10-minute morning stretch', done: false },
      ]);
    }
    setNewStepText('');
    setErrorMessage('');
  }, [editingRoutine, isOpen]);

  const handleAddStep = (labelToAdd?: string) => {
    const text = (labelToAdd || newStepText).trim();
    if (!text) return;

    // Check if already in list
    if (steps.some((s) => s.label.toLowerCase() === text.toLowerCase())) {
      setErrorMessage('This step is already in your routine.');
      return;
    }

    const newStep: RoutineStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: text,
      done: false,
    };

    setSteps([...steps, newStep]);
    setNewStepText('');
    setErrorMessage('');
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('Please give your routine a name.');
      return;
    }
    if (steps.length === 0) {
      setErrorMessage('Please add at least one step to this routine.');
      return;
    }

    onSave({
      name: name.trim(),
      type,
      category,
      targetTime: targetTime.trim() || undefined,
      steps,
    });

    onClose();
  };

  const currentSuggestions = SUGGESTIONS[category] || SUGGESTIONS.Morning;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="routine-modal-sheet"
      initialBreakpoint={0.9}
      breakpoints={[0, 0.9, 1]}
    >
      <IonHeader className="ion-no-border routine-modal-header">
        <IonToolbar className="routine-modal-toolbar">
          <IonTitle className="routine-modal-title">
            {editingRoutine ? 'Edit Routine' : 'Create Routine'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose} className="routine-modal-close-btn">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="routine-modal-content">
        <div className="routine-modal-scroll-inner">
          {errorMessage && (
            <div className="routine-error-banner">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Routine Name Input */}
          <div className="routine-form-group">
            <label className="routine-field-label">Routine Name</label>
            <IonInput
              className="routine-text-input"
              value={name}
              placeholder="e.g. Morning Momentum, Study Warm-up"
              onIonInput={(e) => {
                setName(e.detail.value || '');
                if (errorMessage) setErrorMessage('');
              }}
            />
          </div>

          {/* Frequency Type Segment */}
          <div className="routine-form-group">
            <label className="routine-field-label">Frequency</label>
            <IonSegment
              value={type}
              onIonChange={(e) => setType(e.detail.value as Routine['type'])}
              className="routine-type-segment"
            >
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

          {/* Category Chips */}
          <div className="routine-form-group">
            <label className="routine-field-label">Category</label>
            <div className="category-chips-row">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <IonIcon icon={cat.icon} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Time / Cue */}
          <div className="routine-form-group">
            <label className="routine-field-label">Target Time or Trigger</label>
            <IonInput
              className="routine-text-input"
              value={targetTime}
              placeholder="e.g. 07:30 AM or Every Sunday"
              onIonInput={(e) => setTargetTime(e.detail.value || '')}
            />
          </div>

          {/* Steps List Builder */}
          <div className="routine-form-group">
            <div className="steps-header-row">
              <label className="routine-field-label" style={{ margin: 0 }}>
                Routine Steps ({steps.length})
              </label>
              <span className="steps-count-hint">Ordered checklist</span>
            </div>

            {/* List of current steps */}
            <div className="steps-builder-list">
              {steps.map((step, idx) => (
                <div key={step.id} className="builder-step-row">
                  <div className="builder-step-number">{idx + 1}</div>
                  <div className="builder-step-text">{step.label}</div>
                  <button
                    type="button"
                    className="builder-step-delete-btn"
                    onClick={() => handleRemoveStep(step.id)}
                    title="Remove Step"
                  >
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add step input */}
            <div className="add-step-input-row">
              <IonInput
                className="step-text-input"
                value={newStepText}
                placeholder="Type a new step and press Add..."
                onIonInput={(e) => setNewStepText(e.detail.value || '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
              />
              <IonButton
                fill="solid"
                className="add-step-btn"
                onClick={() => handleAddStep()}
                disabled={!newStepText.trim()}
              >
                <IonIcon slot="icon-only" icon={add} />
              </IonButton>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="suggestions-container">
              <div className="suggestions-title">
                <IonIcon icon={sparklesOutline} />
                <span>Quick suggestions for {category}</span>
              </div>
              <div className="suggestions-chips">
                {currentSuggestions.map((suggestion, idx) => {
                  const isAdded = steps.some(
                    (s) => s.label.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAdded}
                      className={`suggestion-pill ${isAdded ? 'added' : ''}`}
                      onClick={() => handleAddStep(suggestion)}
                    >
                      <IonIcon icon={isAdded ? checkmarkOutline : add} />
                      <span>{suggestion}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="routine-modal-actions">
            <IonButton
              expand="block"
              shape="round"
              className="routine-submit-btn"
              onClick={handleSave}
            >
              {editingRoutine ? 'Save Changes' : 'Create Routine'}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default CreateRoutineModal;
