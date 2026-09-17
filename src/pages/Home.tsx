import React, { useMemo } from 'react';
import { 
  IonContent, IonPage, IonAvatar, IonIcon, IonCard, IonFab, IonFabButton, IonButton
} from '@ionic/react';
import { 
  notificationsOutline, leafOutline, add, sunny, partlySunny, moon,
  timeOutline, play, checkmarkCircle, ellipseOutline, chevronForwardOutline
} from 'ionicons/icons';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { useTasks, Task } from '../data/TaskContext';
import { useUser } from '../data/UserContext';
import { formatDisplayName } from '../data/user';
import { useReminders } from '../data/ReminderContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { getTasksByDate, updateTask } = useTasks();
  const { user } = useUser();
  const { upcomingCount } = useReminders();
  
  const today = useMemo(() => new Date(), []);
  const todayDay = today.getDate().toString();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const todayDateString = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Time-aware greeting
  const currentHour = today.getHours();
  let greetingLabel = 'Good morning,';
  let greetingIcon = sunny;
  let greetingIconColor = 'var(--ion-color-warning, #F59E0B)';

  if (currentHour >= 12 && currentHour < 18) {
    greetingLabel = 'Good afternoon,';
    greetingIcon = partlySunny;
    greetingIconColor = '#F59E0B';
  } else if (currentHour >= 18 || currentHour < 5) {
    greetingLabel = 'Good evening,';
    greetingIcon = moon;
    greetingIconColor = '#74C69D';
  }

  // Today's tasks from real data
  const todaysTasks = getTasksByDate(todayDay, todayDateString);
  const totalTasksToday = todaysTasks.length;
  const completedTasksToday = todaysTasks.filter((t) => t.completed).length;
  const progressPercent = totalTasksToday > 0 
    ? Math.round((completedTasksToday / totalTasksToday) * 100) 
    : 0;

  // Smart focus selection: first incomplete high-priority task, or next pending task
  const pendingTasks = todaysTasks.filter((t) => !t.completed);
  const todaysFocus = pendingTasks.find((t) => t.priority === 'high') || pendingTasks[0] || null;
  const isAllCaughtUp = todaysTasks.length > 0 && pendingTasks.length === 0;

  const handleStartFocus = (task: Task) => {
    navigate(`/app/focus?taskId=${task.id}&taskTitle=${encodeURIComponent(task.title)}`);
  };

  // User name formatting: ensure we display the actual user's name
  const displayName = formatDisplayName(user.fullName, user.email);

  return (
    <IonPage>
      <IonContent fullscreen className="home-content">
        <div className="home-scroll-container">
          
          {/* Header Row: Greeting and Actions */}
          <div className="header-row">
            <div className="greeting-text">
              <h2>{greetingLabel}</h2>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {displayName}! <IonIcon icon={greetingIcon} style={{ color: greetingIconColor }} />
              </h1>
              <p>{todayFormatted}</p>
            </div>
            <div className="header-actions">
              <Link to="/app/reminders" className="notification-btn" title="View Reminders">
                <IonIcon icon={notificationsOutline} className="notification-bell" />
                {upcomingCount > 0 && <span className="notification-dot"></span>}
              </Link>
              <Link to="/app/profile" title="View Profile">
                <IonAvatar className="profile-avatar">
                  <img src={user.avatarUrl || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt="Profile" />
                </IonAvatar>
              </Link>
            </div>
          </div>

          {/* Today's Focus Card (Connected to Focus Timer) */}
          {todaysFocus ? (
            <IonCard className="focus-card ion-no-margin">
              <div className="focus-card-header">
                <div className="focus-card-title">
                  <div className="focus-icon-circle">
                    <IonIcon icon={leafOutline} />
                  </div>
                  Today's Focus
                </div>
                {todaysFocus.priority && (
                  <span className={`priority-badge ${todaysFocus.priority}`}>{todaysFocus.priority.toUpperCase()} PRIORITY</span>
                )}
              </div>
              <div className="focus-card-content">
                <h2>{todaysFocus.title}</h2>
                <p>{todaysFocus.time} {todaysFocus.location ? `• ${todaysFocus.location}` : ''}</p>
                <div className="focus-card-action-row">
                  <IonButton 
                    fill="solid" 
                    size="small" 
                    shape="round" 
                    className="focus-launch-btn"
                    onClick={() => handleStartFocus(todaysFocus)}
                  >
                    <IonIcon icon={play} slot="start" />
                    Start Focus Session
                  </IonButton>
                </div>
              </div>
            </IonCard>
          ) : isAllCaughtUp ? (
            <IonCard className="focus-card focus-card-all-done ion-no-margin">
              <div className="focus-card-header">
                <div className="focus-card-title">
                  <div className="focus-icon-circle done">
                    <IonIcon icon={checkmarkCircle} />
                  </div>
                  Today's Focus
                </div>
                <span className="priority-badge done">ALL DONE</span>
              </div>
              <div className="focus-card-content">
                <h2>All caught up for today!</h2>
                <p>You have completed all scheduled tasks. Keep up the high momentum.</p>
                <div className="focus-card-action-row">
                  <IonButton 
                    fill="solid" 
                    size="small" 
                    shape="round" 
                    className="focus-free-btn"
                    onClick={() => navigate('/app/focus')}
                  >
                    <IonIcon icon={timeOutline} slot="start" />
                    Start Free Timer
                  </IonButton>
                </div>
              </div>
            </IonCard>
          ) : (
            <IonCard className="focus-card ion-no-margin empty-focus-card">
              <div className="focus-icon-circle" style={{ marginBottom: '12px' }}>
                <IonIcon icon={timeOutline} style={{ fontSize: '24px' }} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 6px 0', color: '#1B4332' }}>No tasks for today!</h2>
              <p style={{ margin: '0 0 16px 0', color: '#6B7280', fontSize: '0.9rem' }}>Schedule a task to plan your day.</p>
              <IonButton 
                size="small" 
                shape="round" 
                className="focus-launch-btn"
                onClick={() => navigate('/app/add-task')}
              >
                <IonIcon icon={add} slot="start" />
                Add New Task
              </IonButton>
            </IonCard>
          )}

          {/* Today's Progress Card (Connected to Progress Stats & Page) */}
          <div className="progress-container">
            <div className="section-header-row">
              <h2 className="section-title">Today's Progress</h2>
              <Link to="/app/progress" className="section-link">
                View Stats <IonIcon icon={chevronForwardOutline} />
              </Link>
            </div>
            <div className="progress-card" onClick={() => navigate('/app/progress')} style={{ cursor: 'pointer' }}>
              <div className="progress-header">
                <span className="progress-text">
                  {totalTasksToday === 0 ? 'No tasks scheduled' : `${completedTasksToday}/${totalTasksToday} tasks completed`}
                </span>
                <span className="progress-percent">{progressPercent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Today's Schedule / Tasks (Connected to TaskContext) */}
          <div className="home-schedule-section">
            <div className="section-header-row">
              <h2 className="section-title">Today's Schedule</h2>
              <Link to="/app/schedule" className="section-link">
                View All <IonIcon icon={chevronForwardOutline} />
              </Link>
            </div>

            {todaysTasks.length > 0 ? (
              <div className="home-task-list">
                {todaysTasks.map((task) => (
                  <div key={task.id} className={`home-task-item ${task.completed ? 'is-completed' : ''}`}>
                    <button
                      type="button"
                      className={`home-task-checkbox ${task.completed ? 'checked' : ''}`}
                      onClick={() => updateTask({ ...task, completed: !task.completed })}
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <IonIcon icon={task.completed ? checkmarkCircle : ellipseOutline} />
                    </button>
                    <div 
                      className="home-task-details"
                      onClick={() => updateTask({ ...task, completed: !task.completed })}
                    >
                      <span className={`home-task-title ${task.completed ? 'strikethrough' : ''}`}>
                        {task.title}
                      </span>
                      <span className="home-task-meta">
                        <IonIcon icon={timeOutline} />
                        {task.time} {task.location ? `• ${task.location}` : ''}
                      </span>
                    </div>
                    {task.priority && (
                      <span className={`home-task-priority ${task.priority}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-empty-schedule">
                <p>Your agenda is clear for today.</p>
              </div>
            )}
          </div>

        </div>

        {/* Background Waves anchored to the bottom — fixed */}
        <div slot="fixed" className="home-waves-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(116, 198, 157, 0.15)" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.25)" d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.35)" d="M0,288L80,277.3C160,267,320,245,480,245.3C640,245,800,267,960,277.3C1120,288,1280,288,1360,288L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Floating Action Button for Add Task */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="home-fab">
          <IonFabButton routerLink="/app/add-task">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
