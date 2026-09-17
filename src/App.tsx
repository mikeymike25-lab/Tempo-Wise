import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { IonAlert, IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import MainTabs from './pages/MainTabs';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { UserProvider, useUser } from './data/UserContext';
import { TaskProvider } from './data/TaskContext';
import { FocusProvider } from './data/FocusContext';
import { RoutineProvider } from './data/RoutineContext';
import { ReminderProvider, useReminders } from './data/ReminderContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode Palette
 */
import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AppRoutes: React.FC = () => {
  const { isLoggedIn, login } = useUser();

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Public Routes */}
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/signup" element={<Signup onLogin={login} />} />

        {/* Protected Routes (With Tab Bar) */}
        <Route
          path="/app/*"
          element={isLoggedIn ? <MainTabs /> : <Navigate to="/splash" replace />}
        />

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/app/home" : "/splash"} replace />}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const GlobalReminderAlert: React.FC = () => {
  const { activeAlert, dismissAlert, toggleReminder } = useReminders();

  return (
    <IonAlert
      isOpen={!!activeAlert}
      header="Reminder Alert"
      subHeader={activeAlert ? `${activeAlert.label} (${activeAlert.time})` : ''}
      message={activeAlert?.notes || 'It is time for your scheduled reminder.'}
      buttons={[
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => dismissAlert(),
        },
        {
          text: 'Mark Complete',
          handler: () => {
            if (activeAlert) {
              toggleReminder(activeAlert.id);
            }
            dismissAlert();
          },
        },
      ]}
      onDidDismiss={() => dismissAlert()}
    />
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <UserProvider>
        <TaskProvider>
          <FocusProvider>
            <RoutineProvider>
              <ReminderProvider>
                <AppRoutes />
                <GlobalReminderAlert />
              </ReminderProvider>
            </RoutineProvider>
          </FocusProvider>
        </TaskProvider>
      </UserProvider>
    </IonApp>
  );
};

export default App;
