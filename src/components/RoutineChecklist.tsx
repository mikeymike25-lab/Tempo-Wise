import React from 'react';
import { IonList, IonItem, IonCheckbox, IonLabel } from '@ionic/react';
import { RoutineStep } from '../data/RoutineContext';
import './RoutineChecklist.css';

interface RoutineChecklistProps {
  steps: RoutineStep[];
  onToggle: (stepId: string) => void;
  disabled?: boolean;
}

const RoutineChecklist: React.FC<RoutineChecklistProps> = ({ steps, onToggle, disabled = false }) => {
  return (
    <IonList className="routine-checklist" lines="none">
      {steps.map((step) => (
        <IonItem
          key={step.id}
          className={`routine-step-item ${step.done ? 'step-completed' : ''}`}
          button={!disabled}
          detail={false}
          onClick={() => {
            if (!disabled) {
              onToggle(step.id);
            }
          }}
        >
          <IonCheckbox
            slot="start"
            checked={step.done}
            disabled={disabled}
            className="routine-step-checkbox"
            onClick={(e) => {
              // Stop event bubbling since the parent IonItem also triggers onToggle
              e.stopPropagation();
              if (!disabled) {
                onToggle(step.id);
              }
            }}
          />
          <IonLabel className="routine-step-label">
            {step.label}
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

export default RoutineChecklist;
