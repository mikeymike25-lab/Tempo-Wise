import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonToast,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonList,
  IonAlert,
} from '@ionic/react';
import {
  settingsOutline,
  play,
  pause,
  refreshOutline,
  playSkipForwardOutline,
  chevronDownOutline,
  closeOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { useFocus, FocusTimerSettings } from '../data/FocusContext';
import { useTasks, Task } from '../data/TaskContext';
import { playSessionCompletionSound } from '../utils/audio';
import { getStorageItem, setStorageItem, removeStorageItem } from '../data/storage';
import { useLocation } from 'react-router-dom';
import './FocusTimer.css';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface ActiveTimerState {
  mode: TimerMode;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  lastTick: number;
  selectedTask: string;
  selectedTaskId?: string;
}

const FocusTimer: React.FC = () => {
  const location = useLocation();
  const { settings, updateSettings, logFocusSession } = useFocus();
  const { tasks } = useTasks();

  const [mode, setMode] = useState<TimerMode>(() => {
    const saved = getStorageItem<ActiveTimerState | null>('tempus-active-timer', null);
    return saved ? saved.mode : 'pomodoro';
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    const saved = getStorageItem<ActiveTimerState | null>('tempus-active-timer', null);
    return saved ? saved.isRunning : false;
  });
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = getStorageItem<ActiveTimerState | null>('tempus-active-timer', null);
    if (saved) {
      if (saved.isRunning) {
        const elapsed = Math.floor((Date.now() - saved.lastTick) / 1000);
        return Math.max(0, saved.timeLeft - elapsed);
      }
      return saved.timeLeft;
    }
    return settings.focusMinutes * 60;
  });
  const [totalDuration, setTotalDuration] = useState<number>(() => {
    const saved = getStorageItem<ActiveTimerState | null>('tempus-active-timer', null);
    return saved ? saved.totalDuration : settings.focusMinutes * 60;
  });

  // Task selection
  const [selectedTask, setSelectedTask] = useState<string>(() => {
    const saved = getStorageItem<ActiveTimerState | null>('tempus-active-timer', null);
    return saved ? saved.selectedTask : 'Study for Mathematics';
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(() => {
    const saved = getStorageItem<ActiveTimerState | null>('tempus-active-timer', null);
    return saved ? saved.selectedTaskId : '8';
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [customTaskInput, setCustomTaskInput] = useState('');

  // Read task query params if navigated from Home's "Today's Focus"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');
    const taskTitle = params.get('taskTitle');
    if (taskTitle) {
      setSelectedTask(decodeURIComponent(taskTitle));
      setSelectedTaskId(taskId || undefined);
    }
  }, [location.search]);

  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempPreset, setTempPreset] = useState(settings.preset);
  const [tempFocusMins, setTempFocusMins] = useState(settings.focusMinutes);
  const [tempBreakMins, setTempBreakMins] = useState(settings.shortBreakMinutes);
  const [tempLongBreakMins, setTempLongBreakMins] = useState(settings.longBreakMinutes);
  const [tempAutoStart, setTempAutoStart] = useState(settings.autoStartBreaks);
  const [tempSound, setTempSound] = useState(settings.soundEnabled);

  // Completion Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastAction, setToastAction] = useState<(() => void) | null>(null);
  const [toastActionText, setToastActionText] = useState('');

  // Interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate duration for a given mode based on current settings
  const getDurationForMode = (m: TimerMode): number => {
    switch (m) {
      case 'pomodoro':
        return settings.focusMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
    }
  };

  // Update durations if idle and settings changed (e.g. from Profile)
  useEffect(() => {
    if (!isRunning && timeLeft === totalDuration) {
      const dur = getDurationForMode(mode);
      setTotalDuration(dur);
      setTimeLeft(dur);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes, mode]);

  // Persist active timer status so browser refresh does not restart or lose time
  useEffect(() => {
    if (isRunning || timeLeft < totalDuration) {
      const activeState: ActiveTimerState = {
        mode,
        timeLeft,
        totalDuration,
        isRunning,
        lastTick: Date.now(),
        selectedTask,
        selectedTaskId,
      };
      setStorageItem('tempus-active-timer', activeState);
    } else {
      removeStorageItem('tempus-active-timer');
    }
  }, [mode, timeLeft, totalDuration, isRunning, selectedTask, selectedTaskId]);

  // Sync timer when mode changes or settings change (if not running)
  const switchMode = (newMode: TimerMode, autoPlay = false) => {
    setMode(newMode);
    const dur = getDurationForMode(newMode);
    setTotalDuration(dur);
    setTimeLeft(dur);
    setIsRunning(autoPlay);
  };

  // Warning modal when switching timer mode while timer is in-progress/running
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);

  const handleModeTabClick = (newMode: TimerMode) => {
    if (newMode === mode) return;

    // If timer is running or has progress (countdown in progress)
    if (isRunning || timeLeft < totalDuration) {
      setPendingMode(newMode);
      setShowSwitchWarning(true);
    } else {
      switchMode(newMode);
    }
  };

  const confirmSwitchMode = () => {
    if (pendingMode) {
      switchMode(pendingMode);
      setPendingMode(null);
    }
    setShowSwitchWarning(false);
  };

  const cancelSwitchMode = () => {
    setPendingMode(null);
    setShowSwitchWarning(false);
  };

  // Pure countdown interval (no side-effects inside state setter!)
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Session completion effect (cleanly called outside state updater)
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleSessionComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning]);

  // Session completion handler
  const handleSessionComplete = () => {
    setIsRunning(false);
    removeStorageItem('tempus-active-timer');

    if (settings.soundEnabled) {
      playSessionCompletionSound();
    }

    if (mode === 'pomodoro') {
      // Log session to FocusContext & storage
      logFocusSession({
        taskId: selectedTaskId,
        taskTitle: selectedTask,
        mode: settings.preset,
        durationMinutes: Math.round(totalDuration / 60),
      });

      setToastMessage('Focus session completed! Great work staying productive.');
      setToastActionText('Start Break');
      setToastAction(() => () => {
        switchMode('shortBreak', true);
      });
      setShowToast(true);

      if (settings.autoStartBreaks) {
        switchMode('shortBreak', true);
      }
    } else {
      setToastMessage('Break finished! Ready to begin your next focus session?');
      setToastActionText('Start Focus');
      setToastAction(() => () => {
        switchMode('pomodoro', true);
      });
      setShowToast(true);
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    setIsRunning(!isRunning);
  };

  // Reset current timer
  const handleReset = () => {
    setIsRunning(false);
    removeStorageItem('tempus-active-timer');
    const dur = getDurationForMode(mode);
    setTimeLeft(dur);
    setTotalDuration(dur);
  };

  // Skip to next phase
  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      switchMode('shortBreak');
    } else {
      switchMode('pomodoro');
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG circular progress calculation
  const radius = 120;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Progress fraction (1 when full, 0 when empty)
  const progressRatio = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Handle Preset Selection in Settings
  const handlePresetChange = (presetVal: '25/5' | '25/10' | '50/10' | '90/20' | 'custom') => {
    setTempPreset(presetVal);
    switch (presetVal) {
      case '25/5':
        setTempFocusMins(25);
        setTempBreakMins(5);
        setTempLongBreakMins(15);
        break;
      case '25/10':
        setTempFocusMins(25);
        setTempBreakMins(10);
        setTempLongBreakMins(20);
        break;
      case '50/10':
        setTempFocusMins(50);
        setTempBreakMins(10);
        setTempLongBreakMins(25);
        break;
      case '90/20':
        setTempFocusMins(90);
        setTempBreakMins(20);
        setTempLongBreakMins(30);
        break;
      case 'custom':
        break;
    }
  };

  // Save Settings Modal
  const saveSettings = () => {
    updateSettings({
      preset: tempPreset,
      focusMinutes: tempFocusMins,
      shortBreakMinutes: tempBreakMins,
      longBreakMinutes: tempLongBreakMins,
      autoStartBreaks: tempAutoStart,
      soundEnabled: tempSound,
    });
    setShowSettingsModal(false);

    // If timer is not currently running, update the timer display
    if (!isRunning) {
      let dur = tempFocusMins * 60;
      if (mode === 'shortBreak') dur = tempBreakMins * 60;
      if (mode === 'longBreak') dur = tempLongBreakMins * 60;
      setTotalDuration(dur);
      setTimeLeft(dur);
    }
  };

  return (
    <IonPage className="focus-timer-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="focus-timer-toolbar">
          <IonButtons slot="start">
            <div style={{ width: '36px' }}></div>
          </IonButtons>
          <IonTitle className="focus-header-title">Pomodoro Timer</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              size="small"
              className="focus-settings-btn"
              onClick={() => {
                setTempPreset(settings.preset);
                setTempFocusMins(settings.focusMinutes);
                setTempBreakMins(settings.shortBreakMinutes);
                setTempLongBreakMins(settings.longBreakMinutes);
                setTempAutoStart(settings.autoStartBreaks);
                setTempSound(settings.soundEnabled);
                setShowSettingsModal(true);
              }}
            >
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="focus-timer-content" scrollY={false}>
        <div className="focus-timer-container">
          {/* Radial ambient glow */}
          <div className="focus-ambient-glow"></div>

          {/* Circular Countdown Display */}
          <div className="timer-ring-wrapper">
            <svg className="timer-svg" viewBox="0 0 280 280">
              {/* Background Track */}
              <circle
                className="timer-track"
                cx="140"
                cy="140"
                r={radius}
                strokeWidth={strokeWidth}
              />
              {/* Vibrant Mint Progress Arc */}
              <circle
                className="timer-progress"
                cx="140"
                cy="140"
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Inner Ring Content */}
            <div className="timer-center-content">
              {/* Sprout / Leaf SVG Icon */}
              <div className="timer-sprout-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21V13M12 13C12 13 12 7 18 5C18 11 12 13 12 13ZM12 13C12 13 12 9 7 8C7 13 12 13 12 13Z"
                    stroke="#1B4332"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Countdown Digits */}
              <div className="timer-digits">{formatTime(timeLeft)}</div>

              {/* Mode Subtitle */}
              <div className="timer-subtitle">
                {mode === 'pomodoro'
                  ? 'Focus Time'
                  : mode === 'shortBreak'
                  ? 'Short Break'
                  : 'Long Break'}
              </div>
            </div>
          </div>

          {/* Associated Task Pill */}
          <div className="focus-task-selector" onClick={() => setShowTaskModal(true)}>
            <span className="focus-task-title">{selectedTask}</span>
            <IonIcon icon={chevronDownOutline} className="focus-task-dropdown-icon" />
          </div>

          {/* Primary Action Controls */}
          <div className="focus-controls-row">
            {/* Reset Button */}
            <button className="focus-secondary-control" onClick={handleReset} title="Reset">
              <IonIcon icon={refreshOutline} />
            </button>

            {/* Big White Circular Play/Pause Button */}
            <button
              className={`focus-main-play-btn ${isRunning ? 'is-active' : ''}`}
              onClick={togglePlay}
              aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
            >
              <IonIcon icon={isRunning ? pause : play} />
            </button>

            {/* Skip / Fast Forward Button */}
            <button className="focus-secondary-control" onClick={handleSkip} title="Skip Phase">
              <IonIcon icon={playSkipForwardOutline} />
            </button>
          </div>

          {/* Floating Mode Selector Pill (Bottom) */}
          <div className="focus-mode-pills-bar">
            <button
              className={`focus-mode-pill ${mode === 'pomodoro' ? 'active' : ''}`}
              onClick={() => handleModeTabClick('pomodoro')}
            >
              Pomodoro
            </button>
            <button
              className={`focus-mode-pill ${mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => handleModeTabClick('shortBreak')}
            >
              Short Break
            </button>
            <button
              className={`focus-mode-pill ${mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => handleModeTabClick('longBreak')}
            >
              Long Break
            </button>
          </div>
        </div>

        {/* Background Waves — fixed */}
        <div slot="fixed" className="focus-waves-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(116, 198, 157, 0.15)" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.25)" d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.35)" d="M0,288L80,277.3C160,267,320,245,480,245.3C640,245,800,267,960,277.3C1120,288,1280,288,1360,288L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Task Selection Modal */}
        <IonModal
          isOpen={showTaskModal}
          onDidDismiss={() => setShowTaskModal(false)}
          className="focus-modal-sheet"
          initialBreakpoint={0.65}
          breakpoints={[0, 0.65, 0.9]}
        >
          <div className="modal-sheet-content">
            <div className="modal-sheet-header">
              <h3>Link a Task to Focus</h3>
              <IonButton fill="clear" onClick={() => setShowTaskModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div className="modal-custom-task-box">
              <IonInput
                value={customTaskInput}
                placeholder="Or type custom focus topic..."
                onIonInput={(e) => setCustomTaskInput(e.detail.value || '')}
                className="custom-task-input"
              />
              <IonButton
                size="small"
                fill="solid"
                color="secondary"
                disabled={!customTaskInput.trim()}
                onClick={() => {
                  if (customTaskInput.trim()) {
                    setSelectedTask(customTaskInput.trim());
                    setSelectedTaskId(undefined);
                    setCustomTaskInput('');
                    setShowTaskModal(false);
                  }
                }}
              >
                Set
              </IonButton>
            </div>

            <div className="modal-section-label">Your Scheduled Tasks</div>
            <IonList className="modal-tasks-list" lines="full">
              {tasks.map((task: Task) => (
                <IonItem
                  key={task.id}
                  button
                  className={selectedTaskId === task.id ? 'task-item-selected' : ''}
                  onClick={() => {
                    setSelectedTask(task.title);
                    setSelectedTaskId(task.id);
                    setShowTaskModal(false);
                  }}
                >
                  <IonLabel>
                    <h2>{task.title}</h2>
                    <p>{task.time} {task.location ? `• ${task.location}` : ''}</p>
                  </IonLabel>
                  {selectedTaskId === task.id && (
                    <IonIcon icon={checkmarkOutline} slot="end" color="success" />
                  )}
                </IonItem>
              ))}
            </IonList>
          </div>
        </IonModal>

        {/* Settings & Presets Modal */}
        <IonModal
          isOpen={showSettingsModal}
          onDidDismiss={() => setShowSettingsModal(false)}
          className="focus-modal-sheet"
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75, 1]}
        >
          <div className="modal-sheet-content">
            <div className="modal-sheet-header">
              <h3>Timer Modes & Settings</h3>
              <IonButton fill="clear" onClick={() => setShowSettingsModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div className="modal-section-label">Duration Presets</div>
            <div className="presets-grid">
              {[
                { id: '25/5', title: 'Classic', desc: '25m Focus / 5m Break' },
                { id: '25/10', title: 'Extended', desc: '25m Focus / 10m Break' },
                { id: '50/10', title: 'Deep Work', desc: '50m Focus / 10m Break' },
                { id: '90/20', title: 'Ultra', desc: '90m Focus / 20m Break' },
                { id: 'custom', title: 'Custom', desc: 'Set your own intervals' },
              ].map((p) => (
                <div
                  key={p.id}
                  className={`preset-card ${tempPreset === p.id ? 'selected' : ''}`}
                  onClick={() => handlePresetChange(p.id as FocusTimerSettings['preset'])}
                >
                  <div className="preset-title">{p.title} ({p.id})</div>
                  <div className="preset-desc">{p.desc}</div>
                </div>
              ))}
            </div>

            {tempPreset === 'custom' && (
              <div className="custom-durations-row">
                <IonItem className="duration-input-item">
                  <IonLabel position="stacked">Focus (min)</IonLabel>
                  <IonInput
                    type="number"
                    min="1"
                    max="180"
                    value={tempFocusMins}
                    onIonInput={(e) => setTempFocusMins(Number(e.detail.value) || 25)}
                  />
                </IonItem>
                <IonItem className="duration-input-item">
                  <IonLabel position="stacked">Break (min)</IonLabel>
                  <IonInput
                    type="number"
                    min="1"
                    max="60"
                    value={tempBreakMins}
                    onIonInput={(e) => setTempBreakMins(Number(e.detail.value) || 5)}
                  />
                </IonItem>
              </div>
            )}

            <div className="modal-section-label" style={{ marginTop: '16px' }}>Preferences</div>
            <IonList lines="full" className="settings-toggle-list">
              <IonItem>
                <IonLabel>
                  <h2>Sound Chime</h2>
                  <p>Play uplifting chime when timer completes</p>
                </IonLabel>
                <IonToggle
                  slot="end"
                  checked={tempSound}
                  onIonChange={(e) => setTempSound(e.detail.checked)}
                />
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Auto-start Breaks</h2>
                  <p>Automatically start break countdown</p>
                </IonLabel>
                <IonToggle
                  slot="end"
                  checked={tempAutoStart}
                  onIonChange={(e) => setTempAutoStart(e.detail.checked)}
                />
              </IonItem>
            </IonList>

            <div className="modal-save-container">
              <IonButton expand="block" shape="round" color="secondary" onClick={saveSettings}>
                Save Settings
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Completion Toast with action button */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={6000}
          position="top"
          buttons={[
            ...(toastAction && toastActionText
              ? [
                  {
                    text: toastActionText,
                    role: 'info',
                    handler: () => {
                      toastAction();
                    },
                  },
                ]
              : []),
            {
              text: 'Dismiss',
              role: 'cancel',
            },
          ]}
        />

        {/* Warning Modal when switching timer mode/kind of time */}
        <IonAlert
          isOpen={showSwitchWarning}
          header="Restart Timer?"
          subHeader="Changing the timer will restart the current timer."
          message={`Are you sure you want to switch to ${
            pendingMode === 'pomodoro'
              ? 'Pomodoro'
              : pendingMode === 'shortBreak'
              ? 'Short Break'
              : 'Long Break'
          }? Your current timer progress will be lost.`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: cancelSwitchMode,
            },
            {
              text: 'Restart Timer',
              role: 'destructive',
              handler: confirmSwitchMode,
            },
          ]}
          onDidDismiss={cancelSwitchMode}
        />
      </IonContent>
    </IonPage>
  );
};

export default FocusTimer;
