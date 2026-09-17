import React from 'react';
import { IonItem, IonLabel, IonNote } from '@ionic/react';
import PriorityBadge from './PriorityBadge';

interface TaskRowProps {
  task: {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
  };
}

const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
  return (
    <IonItem>
      <IonLabel className={task.completed ? 'ion-text-wrap task-completed' : 'ion-text-wrap'}>
        <h2>{task.title}</h2>
      </IonLabel>
      <IonNote slot="end">
        <PriorityBadge priority={task.priority} />
      </IonNote>
    </IonItem>
  );
};

export default TaskRow;
