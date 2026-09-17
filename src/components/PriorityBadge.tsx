import React from 'react';
import { IonBadge } from '@ionic/react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let color = 'success';
  if (priority === 'medium') color = 'warning';
  if (priority === 'high') color = 'danger';

  return (
    <IonBadge color={color}>
      {priority.toUpperCase()}
    </IonBadge>
  );
};

export default PriorityBadge;
