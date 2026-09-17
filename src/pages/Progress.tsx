import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonProgressBar,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import {
  statsChartOutline,
  checkmarkDoneCircleOutline,
  timerOutline,
  flameOutline,
  repeatOutline,
  bookOutline,
  briefcaseOutline,
  personOutline,
  checkmarkCircleOutline,
  timeOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useTasks } from '../data/TaskContext';
import { useFocus } from '../data/FocusContext';
import { useRoutines } from '../data/RoutineContext';
import { calculateProgress, ProgressPeriod } from '../data/progress';
import ProgressRing from '../components/ProgressRing';
import './Progress.css';

const Progress: React.FC = () => {
  const [period, setPeriod] = useState<ProgressPeriod>('week');

  const { tasks } = useTasks();
  const { sessions } = useFocus();
  const { routines } = useRoutines();

  // Derived progress analytics based on selected time window
  const stats = calculateProgress(tasks, sessions, routines, period);

  // Dynamic feedback message based on score
  const getMotivationalNote = (score: number) => {
    if (score >= 85) {
      return 'Exceptional momentum! You are crushing your productivity goals.';
    }
    if (score >= 70) {
      return 'Great pace! You are maintaining strong, consistent daily habits.';
    }
    if (score >= 50) {
      return 'Steady progress! Keep logging focus sessions and routines to level up.';
    }
    return 'Off to a steady start! Plan your schedule and begin a focus session.';
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Study':
        return bookOutline;
      case 'Work':
        return briefcaseOutline;
      default:
        return personOutline;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return timerOutline;
      case 'routine':
        return repeatOutline;
      default:
        return checkmarkCircleOutline;
    }
  };

  return (
    <IonPage className="progress-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="progress-toolbar">
          <IonTitle className="ion-text-center">
            <span className="progress-toolbar-title">
              <IonIcon icon={statsChartOutline} style={{ marginRight: '8px', fontSize: '1.25rem', verticalAlign: 'text-bottom' }} />
              Progress
            </span>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="progress-content">
        <div className="progress-ambient-glow"></div>
        <div className="progress-scroll-container">
          
          {/* Period Segment Tabs */}
          <div className="progress-segment-wrapper">
            <IonSegment
              value={period}
              onIonChange={(e) => setPeriod(e.detail.value as ProgressPeriod)}
              className="progress-main-segment"
            >
              <IonSegmentButton value="week">
                <IonLabel>Week</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="month">
                <IonLabel>Month</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="year">
                <IonLabel>Year</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* Hero Productivity Card */}
          <div className="progress-hero-card">
            <div className="progress-hero-left">
              <div className="progress-hero-tag">
                <IonIcon icon={sparklesOutline} />
                <span>Overall Productivity</span>
              </div>
              <h2 className="progress-hero-headline">
                {stats.productivityScore >= 80 ? 'Optimal Focus' : 'Consistent Flow'}
              </h2>
              <p className="progress-hero-desc">
                {getMotivationalNote(stats.productivityScore)}
              </p>
              <div className="progress-hero-pills">
                <span className="hero-micro-pill">
                  {stats.tasksCompleted} of {stats.totalTasks} tasks completed
                </span>
              </div>
            </div>

            <div className="progress-hero-right">
              <ProgressRing
                percentage={stats.productivityScore}
                radius={58}
                stroke={9}
                color="var(--ion-color-secondary, #74C69D)"
                trackColor="rgba(27, 67, 50, 0.09)"
                subtitle="Rate"
              />
            </div>
          </div>

          {/* Core Metric Statistics Grid */}
          <div className="progress-stats-grid">
            <div className="progress-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-tasks">
                  <IonIcon icon={checkmarkDoneCircleOutline} />
                </div>
                <span className="stat-card-badge">{stats.taskCompletionRate}%</span>
              </div>
              <div className="stat-card-value">
                {stats.tasksCompleted}
                <span className="stat-card-denom">/{stats.totalTasks}</span>
              </div>
              <div className="stat-card-label">Tasks Done</div>
            </div>

            <div className="progress-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-focus">
                  <IonIcon icon={timerOutline} />
                </div>
                <span className="stat-card-badge">{stats.focusMinutes}m</span>
              </div>
              <div className="stat-card-value">{stats.focusTimeFormatted}</div>
              <div className="stat-card-label">Focus Time</div>
            </div>

            <div className="progress-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-streak">
                  <IonIcon icon={flameOutline} />
                </div>
                <span className="stat-card-badge streak-badge">Active</span>
              </div>
              <div className="stat-card-value streak-value">
                {stats.currentStreak}
                <span className="stat-card-denom">days</span>
              </div>
              <div className="stat-card-label">Best Streak</div>
            </div>

            <div className="progress-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper stat-icon-routine">
                  <IonIcon icon={repeatOutline} />
                </div>
                <span className="stat-card-badge">{stats.routineCompletionRate}%</span>
              </div>
              <div className="stat-card-value">
                {stats.routinesCompleted}
                <span className="stat-card-denom">/{stats.totalRoutines}</span>
              </div>
              <div className="stat-card-label">Routines Met</div>
            </div>
          </div>

          {/* Category Breakdown Card */}
          <div className="progress-section-card">
            <div className="section-card-header">
              <div className="section-title-group">
                <h3 className="section-card-title">Category Breakdown</h3>
                <span className="section-card-subtitle">Distribution across life pillars</span>
              </div>
            </div>

            <div className="category-breakdown-list">
              {stats.categories.map((cat) => (
                <div key={cat.name} className="category-item-row">
                  <div className="category-item-top">
                    <div className="category-label-group">
                      <div className={`category-icon-bubble category-${cat.name.toLowerCase()}`}>
                        <IonIcon icon={getCategoryIcon(cat.name)} />
                      </div>
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-metric-group">
                      <span className="category-fraction">
                        {cat.completed}/{cat.total} done
                      </span>
                      <span className="category-percentage">{cat.percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="category-progress-track">
                    <IonProgressBar
                      value={cat.progress}
                      className={`category-bar category-bar-${cat.name.toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="progress-section-card">
            <div className="section-card-header">
              <div className="section-title-group">
                <h3 className="section-card-title">Recent Activity</h3>
                <span className="section-card-subtitle">Latest milestones and sessions</span>
              </div>
              <IonBadge color="light" className="recent-count-badge">
                {stats.recentActivities.length} items
              </IonBadge>
            </div>

            {stats.recentActivities.length > 0 ? (
              <div className="activity-timeline-list">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="activity-item-card">
                    <div className={`activity-icon-col type-${act.type}`}>
                      <IonIcon icon={getActivityTypeIcon(act.type)} />
                    </div>

                    <div className="activity-info-col">
                      <h4 className="activity-title">{act.title}</h4>
                      <div className="activity-meta-row">
                        <span className="activity-subtitle">{act.subtitle}</span>
                        <span className="activity-bullet">•</span>
                        <span className="activity-timestamp">
                          <IonIcon icon={timeOutline} style={{ marginRight: '3px', fontSize: '0.8rem' }} />
                          {act.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="activity-badge-col">
                      <IonBadge color={act.badgeColor} className="activity-status-pill">
                        {act.badgeText}
                      </IonBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="activity-empty-state">
                <div className="empty-icon-bubble">
                  <IonIcon icon={statsChartOutline} />
                </div>
                <h4>No activities recorded yet</h4>
                <p>Complete scheduled tasks, run focus sessions, or check off your daily routines to track your history here.</p>
              </div>
            )}
          </div>

        </div>

        {/* Background Waves — fixed */}
        <div slot="fixed" className="progress-waves-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(116, 198, 157, 0.15)" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.25)" d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.35)" d="M0,288L80,277.3C160,267,320,245,480,245.3C640,245,800,267,960,277.3C1120,288,1280,288,1360,288L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Progress;
