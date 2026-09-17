import React from 'react';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { Route, Navigate } from 'react-router-dom';
import { homeOutline, calendarOutline, timerOutline, repeatOutline, statsChartOutline } from 'ionicons/icons';

import Home from './Home';
import Schedule from './Schedule';
import AddTask from './AddTask';
import FocusTimer from './FocusTimer';
import Routines from './Routines';
import Progress from './Progress';
import Reminders from './Reminders';
import Profile from './Profile';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/app/home" element={<Home />} />
        <Route path="/app/schedule" element={<Schedule />} />
        <Route path="/app/add-task" element={<AddTask />} />
        <Route path="/app/focus" element={<FocusTimer />} />
        <Route path="/app/routines" element={<Routines />} />
        <Route path="/app/reminders" element={<Reminders />} />
        <Route path="/app/progress" element={<Progress />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app" element={<Navigate to="/app/home" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/app/home">
          <IonIcon aria-hidden="true" icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="schedule" href="/app/schedule">
          <IonIcon aria-hidden="true" icon={calendarOutline} />
          <IonLabel>Schedule</IonLabel>
        </IonTabButton>
        <IonTabButton tab="focus" href="/app/focus">
          <IonIcon aria-hidden="true" icon={timerOutline} />
          <IonLabel>Focus</IonLabel>
        </IonTabButton>
        <IonTabButton tab="routines" href="/app/routines">
          <IonIcon aria-hidden="true" icon={repeatOutline} />
          <IonLabel>Routines</IonLabel>
        </IonTabButton>
        <IonTabButton tab="progress" href="/app/progress">
          <IonIcon aria-hidden="true" icon={statsChartOutline} />
          <IonLabel>Progress</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
