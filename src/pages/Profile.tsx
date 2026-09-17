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
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonModal,
  IonInput,
  IonToggle,
  IonAlert,
  IonToast,
  IonAccordionGroup,
  IonAccordion,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  chevronForwardOutline,
  flagOutline,
  notificationsOutline,
  colorPaletteOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
  createOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  trashOutline,
  addOutline,
  closeOutline,
  moonOutline,
  sunnyOutline,
  desktopOutline,
  calendarOutline,
  timerOutline,
  repeatOutline,
  statsChartOutline,
  shieldCheckmarkOutline,
  volumeHighOutline,
  refreshOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../data/UserContext';
import { useTasks } from '../data/TaskContext';
import { useFocus } from '../data/FocusContext';
import { Goal } from '../data/user';
import './Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    updateUser,
    updateNotificationPrefs,
    updatePreferences,
    addGoal,
    toggleGoal,
    deleteGoal,
    setTheme,
    logout,
    resetUserData,
  } = useUser();

  const { tasks } = useTasks();
  const { sessions } = useFocus();

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Alerts & Toasts
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit profile form state
  const [editName, setEditName] = useState(user.fullName);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editTitle, setEditTitle] = useState(user.title);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl);

  // Add goal form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('Focus');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  // Support inquiry state
  const [feedbackText, setFeedbackText] = useState('');

  // Quick Stats
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const completedGoalsCount = user.goals.filter((g) => g.completed).length;

  const handleOpenEditProfile = () => {
    setEditName(user.fullName);
    setEditEmail(user.email);
    setEditTitle(user.title);
    setEditAvatar(user.avatarUrl);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      setToastMessage('Name and email are required.');
      return;
    }
    updateUser({
      fullName: editName.trim(),
      email: editEmail.trim(),
      title: editTitle.trim(),
      avatarUrl: editAvatar.trim() || 'https://ionicframework.com/docs/img/demos/avatar.svg',
    });
    setShowEditProfileModal(false);
    setToastMessage('Profile updated successfully.');
  };

  const handleCreateGoal = () => {
    if (!newGoalTitle.trim()) {
      setToastMessage('Goal title cannot be empty.');
      return;
    }
    addGoal({
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      target: newGoalTarget.trim() || 'Daily Target',
      completed: false,
    });
    setNewGoalTitle('');
    setNewGoalTarget('');
    setToastMessage('New goal added!');
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleResetData = () => {
    resetUserData();
    setShowSettingsModal(false);
    setToastMessage('Preferences reset to initial defaults.');
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    setFeedbackText('');
    setToastMessage('Thank you! Your feedback has been submitted.');
  };

  return (
    <IonPage className="profile-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="profile-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/home" style={{ color: 'var(--ion-color-primary, #1B4332)' }} />
          </IonButtons>
          <IonTitle className="profile-toolbar-title">Profile & Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleOpenEditProfile} style={{ color: 'var(--ion-color-primary, #1B4332)' }}>
              <IonIcon icon={createOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="profile-content">
        <div className="profile-ambient-glow"></div>

        <div className="profile-container">
          {/* Phase 9.1: Profile Card (Avatar, Name, Email, Title) */}
          <div className="profile-hero-card">
            <div className="profile-avatar-wrapper" onClick={handleOpenEditProfile}>
              <img
                src={user.avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'}
                alt={user.fullName}
                className="profile-avatar-img"
              />
              <div className="profile-avatar-badge">
                <IonIcon icon={createOutline} />
              </div>
            </div>

            <h2 className="profile-name">{user.fullName}</h2>
            <p className="profile-email">{user.email}</p>

            <div className="profile-role-badge-container">
              <span className="profile-role-badge">{user.title || 'Student / Working Professional'}</span>
            </div>

            {/* Quick Stats Summary Grid */}
            <div className="profile-stats-grid">
              <div className="profile-stat-box">
                <div className="profile-stat-value">
                  {completedGoalsCount}/{user.goals.length}
                </div>
                <div className="profile-stat-label">Goals Met</div>
              </div>
              <div className="profile-stat-box">
                <div className="profile-stat-value">{completedTasksCount}</div>
                <div className="profile-stat-label">Tasks Done</div>
              </div>
              <div className="profile-stat-box">
                <div className="profile-stat-value">{sessions.length}</div>
                <div className="profile-stat-label">Focus Logs</div>
              </div>
            </div>
          </div>

          {/* Phase 9.2: Productivity & Goals Section */}
          <div className="profile-section-header">Productivity & Targets</div>
          <IonList className="profile-card-list" lines="full">
            <IonItem button detail={false} className="profile-list-item" onClick={() => setShowGoalsModal(true)}>
              <div className="profile-item-icon-container profile-item-icon-goals" slot="start">
                <IonIcon icon={flagOutline} />
              </div>
              <IonLabel className="profile-item-label">
                <h3>My Goals</h3>
                <p>Track targets for tasks, focus, and habits</p>
              </IonLabel>
              <IonBadge color="success" slot="end" className="profile-item-badge">
                {completedGoalsCount}/{user.goals.length}
              </IonBadge>
              <IonIcon icon={chevronForwardOutline} slot="end" className="profile-item-chevron" />
            </IonItem>
          </IonList>

          {/* Phase 9.2: Preferences & Settings Section */}
          <div className="profile-section-header">App Preferences</div>
          <IonList className="profile-card-list" lines="full">
            {/* Notifications */}
            <IonItem button detail={false} className="profile-list-item" onClick={() => setShowNotifModal(true)}>
              <div className="profile-item-icon-container profile-item-icon-notif" slot="start">
                <IonIcon icon={notificationsOutline} />
              </div>
              <IonLabel className="profile-item-label">
                <h3>Notifications</h3>
                <p>Reminders, focus alerts, and routine chimes</p>
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" className="profile-item-chevron" />
            </IonItem>

            {/* Appearance */}
            <IonItem button detail={false} className="profile-list-item" onClick={() => setShowAppearanceModal(true)}>
              <div className="profile-item-icon-container profile-item-icon-appearance" slot="start">
                <IonIcon icon={colorPaletteOutline} />
              </div>
              <IonLabel className="profile-item-label">
                <h3>Appearance</h3>
                <p>Theme mode ({user.theme.charAt(0).toUpperCase() + user.theme.slice(1)})</p>
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" className="profile-item-chevron" />
            </IonItem>

            {/* Settings */}
            <IonItem button detail={false} className="profile-list-item" onClick={() => setShowSettingsModal(true)}>
              <div className="profile-item-icon-container profile-item-icon-settings" slot="start">
                <IonIcon icon={settingsOutline} />
              </div>
              <IonLabel className="profile-item-label">
                <h3>Settings</h3>
                <p>Default focus timer and scheduling options</p>
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" className="profile-item-chevron" />
            </IonItem>
          </IonList>

          {/* Phase 9.2: Help & Support Section */}
          <div className="profile-section-header">Help & About</div>
          <IonList className="profile-card-list" lines="full">
            <IonItem button detail={false} className="profile-list-item" onClick={() => setShowHelpModal(true)}>
              <div className="profile-item-icon-container profile-item-icon-help" slot="start">
                <IonIcon icon={helpCircleOutline} />
              </div>
              <IonLabel className="profile-item-label">
                <h3>Help & Support</h3>
                <p>Quick start guide, FAQs, and feedback</p>
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" className="profile-item-chevron" />
            </IonItem>
          </IonList>

          {/* Phase 9.3: Log Out Section */}
          <div className="profile-section-header">Account Session</div>
          <IonList className="profile-card-list" lines="none">
            <IonItem
              button
              detail={false}
              className="profile-list-item profile-logout-item"
              onClick={() => setShowLogoutAlert(true)}
            >
              <div className="profile-item-icon-container profile-item-icon-logout" slot="start">
                <IonIcon icon={logOutOutline} />
              </div>
              <IonLabel className="profile-item-label">
                <h3>Log Out</h3>
                <p>End your current session</p>
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" className="profile-item-chevron" />
            </IonItem>
          </IonList>

          {/* App Footer */}
          <div className="profile-footer">
            <div className="profile-footer-logo">Tempus Wise</div>
            <div className="profile-footer-tagline">"Make Time Work for You."</div>
            <div className="profile-footer-version">Version 1.0.0 • Prototype Release</div>
          </div>
        </div>

        {/* MODAL 1: Edit Profile */}
        <IonModal isOpen={showEditProfileModal} onDidDismiss={() => setShowEditProfileModal(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar className="profile-modal-header">
              <IonTitle style={{ color: 'var(--ion-color-primary, #1B4332)', fontWeight: 700 }}>
                Edit Profile
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditProfileModal(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="profile-modal-content">
            <div className="profile-modal-container">
              <div className="profile-modal-card">
                <IonItem className="profile-input-item" lines="none">
                  <IonInput
                    label="Full Name"
                    labelPlacement="floating"
                    value={editName}
                    onIonInput={(e) => setEditName(e.detail.value || '')}
                  />
                </IonItem>
                <IonItem className="profile-input-item" lines="none">
                  <IonInput
                    label="Email Address"
                    labelPlacement="floating"
                    type="email"
                    value={editEmail}
                    onIonInput={(e) => setEditEmail(e.detail.value || '')}
                  />
                </IonItem>
                <IonItem className="profile-input-item" lines="none">
                  <IonInput
                    label="Occupation / Student Title"
                    labelPlacement="floating"
                    value={editTitle}
                    onIonInput={(e) => setEditTitle(e.detail.value || '')}
                  />
                </IonItem>
                <IonItem className="profile-input-item" lines="none">
                  <IonInput
                    label="Avatar Image URL"
                    labelPlacement="floating"
                    value={editAvatar}
                    onIonInput={(e) => setEditAvatar(e.detail.value || '')}
                  />
                </IonItem>
              </div>

              <IonButton
                expand="block"
                shape="round"
                style={{ '--background': 'var(--ion-color-primary, #1B4332)' }}
                onClick={handleSaveProfile}
              >
                Save Changes
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* MODAL 2: My Goals */}
        <IonModal isOpen={showGoalsModal} onDidDismiss={() => setShowGoalsModal(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar className="profile-modal-header">
              <IonTitle style={{ color: 'var(--ion-color-primary, #1B4332)', fontWeight: 700 }}>
                My Goals
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowGoalsModal(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="profile-modal-content">
            <div className="profile-modal-container">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ion-color-primary, #1B4332)', margin: '0 0 14px 0' }}>
                Active Productivity Targets
              </h3>

              {user.goals.map((goal) => (
                <div key={goal.id} className={`profile-goal-item ${goal.completed ? 'completed' : ''}`}>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => toggleGoal(goal.id)}
                    style={{ '--color': goal.completed ? 'var(--ion-color-secondary, #74C69D)' : 'var(--ion-color-step-400, #9CA3AF)', margin: 0 }}
                  >
                    <IonIcon icon={goal.completed ? checkmarkCircle : checkmarkCircleOutline} slot="icon-only" style={{ fontSize: '24px' }} />
                  </IonButton>
                  <div className="profile-goal-info">
                    <div className="profile-goal-title">{goal.title}</div>
                    <div className="profile-goal-meta">
                      <span
                        className="profile-goal-category-badge"
                        style={{
                          backgroundColor:
                            goal.category === 'Tasks'
                              ? 'rgba(74, 222, 128, 0.2)'
                              : goal.category === 'Focus'
                              ? 'rgba(250, 204, 21, 0.2)'
                              : goal.category === 'Routines'
                              ? 'rgba(116, 198, 157, 0.2)'
                              : 'rgba(99, 102, 241, 0.2)',
                          color:
                            goal.category === 'Tasks'
                              ? '#15803D'
                              : goal.category === 'Focus'
                              ? '#B45309'
                              : goal.category === 'Routines'
                              ? '#1B4332'
                              : '#4338CA',
                        }}
                      >
                        {goal.category}
                      </span>
                      <span className="profile-goal-target">{goal.target}</span>
                    </div>
                  </div>
                  <IonButton
                    fill="clear"
                    size="small"
                    color="danger"
                    onClick={() => deleteGoal(goal.id)}
                    style={{ margin: 0 }}
                  >
                    <IonIcon icon={trashOutline} slot="icon-only" />
                  </IonButton>
                </div>
              ))}

              {/* Add New Goal Card */}
              <div className="profile-modal-card" style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--ion-color-primary, #1B4332)' }}>
                  Add a New Goal
                </h4>
                <IonItem className="profile-input-item" lines="none">
                  <IonInput
                    placeholder="e.g. Read 20 pages of course notes"
                    value={newGoalTitle}
                    onIonInput={(e) => setNewGoalTitle(e.detail.value || '')}
                  />
                </IonItem>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <IonItem className="profile-input-item" lines="none">
                    <IonSelect
                      value={newGoalCategory}
                      onIonChange={(e) => setNewGoalCategory(e.detail.value)}
                      interface="popover"
                    >
                      <IonSelectOption value="Focus">Focus</IonSelectOption>
                      <IonSelectOption value="Tasks">Tasks</IonSelectOption>
                      <IonSelectOption value="Routines">Routines</IonSelectOption>
                      <IonSelectOption value="Personal">Personal</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonItem className="profile-input-item" lines="none">
                    <IonInput
                      placeholder="Target (e.g. Daily)"
                      value={newGoalTarget}
                      onIonInput={(e) => setNewGoalTarget(e.detail.value || '')}
                    />
                  </IonItem>
                </div>
                <IonButton
                  expand="block"
                  shape="round"
                  style={{ '--background': 'var(--ion-color-primary, #1B4332)', marginTop: '8px' }}
                  onClick={handleCreateGoal}
                >
                  <IonIcon icon={addOutline} slot="start" />
                  Add Goal
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* MODAL 3: Notifications */}
        <IonModal isOpen={showNotifModal} onDidDismiss={() => setShowNotifModal(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar className="profile-modal-header">
              <IonTitle style={{ color: 'var(--ion-color-primary, #1B4332)', fontWeight: 700 }}>
                Notifications
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowNotifModal(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="profile-modal-content">
            <div className="profile-modal-container">
              <div className="profile-modal-card">
                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={notificationsOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Task & Reminder Alerts</h3>
                    <p>Receive scheduled alerts for upcoming tasks</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.notificationPrefs.reminderAlerts}
                    onIonChange={(e) => updateNotificationPrefs({ reminderAlerts: e.detail.checked })}
                  />
                </IonItem>

                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={timerOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Focus Timer Chimes</h3>
                    <p>Play chime when work or break period finishes</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.notificationPrefs.focusTimerAlerts}
                    onIonChange={(e) => updateNotificationPrefs({ focusTimerAlerts: e.detail.checked })}
                  />
                </IonItem>

                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={repeatOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Daily Routine Briefing</h3>
                    <p>Morning prompt with your daily checklist</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.notificationPrefs.dailyRoutineBriefing}
                    onIonChange={(e) => updateNotificationPrefs({ dailyRoutineBriefing: e.detail.checked })}
                  />
                </IonItem>

                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={statsChartOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Weekly Progress Summary</h3>
                    <p>Digest of task completion and focus hours</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.notificationPrefs.weeklyProgressSummary}
                    onIonChange={(e) => updateNotificationPrefs({ weeklyProgressSummary: e.detail.checked })}
                  />
                </IonItem>

                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={volumeHighOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Sound Effects</h3>
                    <p>Audible feedback for button taps and completions</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.notificationPrefs.soundEnabled}
                    onIonChange={(e) => updateNotificationPrefs({ soundEnabled: e.detail.checked })}
                  />
                </IonItem>

                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={shieldCheckmarkOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Haptic Vibration</h3>
                    <p>Device vibration when timers expire</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.notificationPrefs.vibrationEnabled}
                    onIonChange={(e) => updateNotificationPrefs({ vibrationEnabled: e.detail.checked })}
                  />
                </IonItem>
              </div>

              <IonButton
                expand="block"
                shape="round"
                style={{ '--background': 'var(--ion-color-primary, #1B4332)' }}
                onClick={() => {
                  setShowNotifModal(false);
                  setToastMessage('Notification settings saved.');
                }}
              >
                Done
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* MODAL 4: Appearance */}
        <IonModal isOpen={showAppearanceModal} onDidDismiss={() => setShowAppearanceModal(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar className="profile-modal-header">
              <IonTitle style={{ color: 'var(--ion-color-primary, #1B4332)', fontWeight: 700 }}>
                Appearance
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAppearanceModal(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="profile-modal-content">
            <div className="profile-modal-container">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ion-color-primary, #1B4332)', margin: '0 0 8px 0' }}>
                Theme Selection
              </h3>
              <p style={{ color: 'var(--ion-color-step-600, #6B7280)', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
                Choose your visual mood. Tempus Wise stays grounded in calming forest-green accents across all modes.
              </p>

              <div className="theme-options-grid">
                <div
                  className={`theme-option-card ${user.theme === 'light' ? 'selected' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <IonIcon icon={sunnyOutline} className="theme-option-icon" />
                  <div className="theme-option-name">Light</div>
                </div>

                <div
                  className={`theme-option-card ${user.theme === 'dark' ? 'selected' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <IonIcon icon={moonOutline} className="theme-option-icon" />
                  <div className="theme-option-name">Dark</div>
                </div>

                <div
                  className={`theme-option-card ${user.theme === 'system' ? 'selected' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <IonIcon icon={desktopOutline} className="theme-option-icon" />
                  <div className="theme-option-name">System</div>
                </div>
              </div>

              <div className="profile-modal-card" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--ion-color-primary, #1B4332)' }}>
                  Design Tokens
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--ion-color-step-600, #6B7280)', margin: 0 }}>
                  Primary Dark Forest Green (<code>#1B4332</code>) & Secondary Sage Green (<code>#74C69D</code>) are active.
                </p>
              </div>

              <IonButton
                expand="block"
                shape="round"
                style={{ '--background': 'var(--ion-color-primary, #1B4332)' }}
                onClick={() => setShowAppearanceModal(false)}
              >
                Done
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* MODAL 5: Settings */}
        <IonModal isOpen={showSettingsModal} onDidDismiss={() => setShowSettingsModal(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar className="profile-modal-header">
              <IonTitle style={{ color: 'var(--ion-color-primary, #1B4332)', fontWeight: 700 }}>
                Settings
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowSettingsModal(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="profile-modal-content">
            <div className="profile-modal-container">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ion-color-primary, #1B4332)', margin: '0 0 14px 0' }}>
                Timer & Schedule Defaults
              </h3>

              <div className="profile-modal-card">
                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={timerOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Default Focus Duration</h3>
                    <p>Standard work block length</p>
                  </IonLabel>
                  <IonSelect
                    value={user.preferences.defaultFocusDuration}
                    interface="popover"
                    onIonChange={(e) => updatePreferences({ defaultFocusDuration: e.detail.value })}
                  >
                    <IonSelectOption value={25}>25 minutes</IonSelectOption>
                    <IonSelectOption value={50}>50 minutes</IonSelectOption>
                    <IonSelectOption value={90}>90 minutes</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={timerOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Default Break Duration</h3>
                    <p>Short resting period</p>
                  </IonLabel>
                  <IonSelect
                    value={user.preferences.defaultBreakDuration}
                    interface="popover"
                    onIonChange={(e) => updatePreferences({ defaultBreakDuration: e.detail.value })}
                  >
                    <IonSelectOption value={5}>5 minutes</IonSelectOption>
                    <IonSelectOption value={10}>10 minutes</IonSelectOption>
                    <IonSelectOption value={20}>20 minutes</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem lines="full" style={{ '--background': 'transparent' }}>
                  <IonIcon icon={calendarOutline} slot="start" style={{ color: '#1B4332' }} />
                  <IonLabel>
                    <h3>Week Start Day</h3>
                    <p>Calendar view first column</p>
                  </IonLabel>
                  <IonSelect
                    value={user.preferences.weekStartDay}
                    interface="popover"
                    onIonChange={(e) => updatePreferences({ weekStartDay: e.detail.value })}
                  >
                    <IonSelectOption value="Monday">Monday</IonSelectOption>
                    <IonSelectOption value="Sunday">Sunday</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel>
                    <h3>Auto-Start Breaks</h3>
                    <p>Automatically start break timer after focus</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={user.preferences.autoStartBreaks}
                    onIonChange={(e) => updatePreferences({ autoStartBreaks: e.detail.checked })}
                  />
                </IonItem>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ion-color-primary, #1B4332)', margin: '20px 0 14px 0' }}>
                Data & Storage
              </h3>
              <div className="profile-modal-card">
                <p style={{ fontSize: '0.85rem', color: 'var(--ion-color-step-600, #6B7280)', margin: '0 0 14px 0' }}>
                  All data is currently stored locally in your browser storage. You can restore sample defaults at any time.
                </p>
                <IonButton
                  expand="block"
                  fill="outline"
                  color="medium"
                  shape="round"
                  onClick={() => setShowResetAlert(true)}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Reset Sample Preferences
                </IonButton>
              </div>

              <IonButton
                expand="block"
                shape="round"
                style={{ '--background': 'var(--ion-color-primary, #1B4332)', marginTop: '20px' }}
                onClick={() => {
                  setShowSettingsModal(false);
                  setToastMessage('Settings updated.');
                }}
              >
                Done
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* MODAL 6: Help & Support */}
        <IonModal isOpen={showHelpModal} onDidDismiss={() => setShowHelpModal(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar className="profile-modal-header">
              <IonTitle style={{ color: 'var(--ion-color-primary, #1B4332)', fontWeight: 700 }}>
                Help & Support
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowHelpModal(false)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="profile-modal-content">
            <div className="profile-modal-container">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ion-color-primary, #1B4332)', margin: '0 0 8px 0' }}>
                The 5 Core Tools of Tempus Wise
              </h3>
              <p style={{ color: 'var(--ion-color-step-600, #6B7280)', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                Tempus Wise solves time management and consistency challenges for students and working professionals:
              </p>

              <div className="profile-modal-card">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <IonIcon icon={calendarOutline} style={{ color: '#1B4332', fontSize: '20px', marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#1B4332' }}>1. Smart Schedule Maker</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      Add tasks and events with date, time, priority, and notes to banish disorganized days.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <IonIcon icon={timerOutline} style={{ color: '#1B4332', fontSize: '20px', marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#1B4332' }}>2. Focus Timer (Pomodoro)</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      Beat procrastination with 25/5, 50/10, 90/20, or custom focused intervals.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <IonIcon icon={repeatOutline} style={{ color: '#1B4332', fontSize: '20px', marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#1B4332' }}>3. Routine Maker</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      Build repeatable morning, study, and evening checklists for reliable habits.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <IonIcon icon={notificationsOutline} style={{ color: '#1B4332', fontSize: '20px', marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#1B4332' }}>4. Reminders</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      Timely notifications so you never miss deadlines, exams, or important meetings.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <IonIcon icon={statsChartOutline} style={{ color: '#1B4332', fontSize: '20px', marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#1B4332' }}>5. Progress Tracking</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      Celebrate momentum with task counts, focus time totals, and habit streaks.
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Accordions */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ion-color-primary, #1B4332)', margin: '20px 0 12px 0' }}>
                Frequently Asked Questions
              </h3>
              <IonAccordionGroup className="profile-modal-card" style={{ padding: '4px' }}>
                <IonAccordion value="faq-1">
                  <IonItem slot="header" lines="none">
                    <IonLabel>Where is my data saved?</IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#6B7280' }}>
                    During this prototype phase, all your tasks, routines, reminders, and focus records are saved locally in your browser's localStorage.
                  </div>
                </IonAccordion>

                <IonAccordion value="faq-2">
                  <IonItem slot="header" lines="none">
                    <IonLabel>How does streak calculation work?</IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#6B7280' }}>
                    Streaks count consecutive days on which you complete at least one task or complete a focus session.
                  </div>
                </IonAccordion>

                <IonAccordion value="faq-3">
                  <IonItem slot="header" lines="none">
                    <IonLabel>Can I customize timer durations?</IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#6B7280' }}>
                    Yes! You can choose standard presets in Settings, or use the "Custom" mode directly on the Focus Timer screen.
                  </div>
                </IonAccordion>
              </IonAccordionGroup>

              {/* Send feedback */}
              <div className="profile-modal-card" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--ion-color-primary, #1B4332)' }}>
                  Send Feedback
                </h4>
                <IonItem className="profile-input-item" lines="none">
                  <IonInput
                    placeholder="Have a suggestion or found an issue?"
                    value={feedbackText}
                    onIonInput={(e) => setFeedbackText(e.detail.value || '')}
                  />
                </IonItem>
                <IonButton
                  expand="block"
                  shape="round"
                  style={{ '--background': 'var(--ion-color-primary, #1B4332)' }}
                  onClick={handleSendFeedback}
                >
                  Submit Feedback
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Phase 9.3: Logout Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Log Out"
          message="Are you sure you want to log out of Tempus Wise? Your local schedule and routines will remain securely saved on this device."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Log Out',
              role: 'destructive',
              handler: handleConfirmLogout,
            },
          ]}
        />

        {/* Reset Confirmation Alert */}
        <IonAlert
          isOpen={showResetAlert}
          onDidDismiss={() => setShowResetAlert(false)}
          header="Reset Sample Preferences?"
          message="This will reset your profile details, goals, and notification settings back to default."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Reset',
              role: 'destructive',
              handler: handleResetData,
            },
          ]}
        />

        {/* Toast Notification */}
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={2500}
          onDidDismiss={() => setToastMessage(null)}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
