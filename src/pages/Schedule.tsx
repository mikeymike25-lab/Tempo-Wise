import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonButton,
  IonIcon,
  IonDatetime
} from '@ionic/react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  add, 
  calendarOutline, 
  listOutline, 
  timeOutline, 
  chevronDownOutline, 
  locationOutline,
  notificationsOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import './Schedule.css';
import { useTasks } from '../data/TaskContext';
import { useUser } from '../data/UserContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { getTasksByDate, updateTask } = useTasks();
  const { user } = useUser();

  const today = useMemo(() => new Date(), []);

  // Selected Month & Year (defaults to prototype's September 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // September (0-indexed)
  const [activeDate, setActiveDate] = useState<string>('16');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'strip' | 'calendar'>('strip');

  const dateScrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic calculation of days in the currently selected month & year
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const monthDates = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateObj = new Date(selectedYear, selectedMonth, dayNum);
      const isToday = 
        selectedYear === today.getFullYear() &&
        selectedMonth === today.getMonth() &&
        dayNum === today.getDate();
      return {
        day: DAYS_OF_WEEK[dateObj.getDay()],
        date: dayNum.toString(),
        isToday,
      };
    });
  }, [selectedYear, selectedMonth, daysInMonth, today]);

  // Formatted date string (e.g. "September 16, 2026")
  const displayDateLabel = `${MONTH_NAMES[selectedMonth]} ${activeDate}, ${selectedYear}`;
  // ISO date for IonDatetime (e.g. "2026-09-16")
  const selectedIsoDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${activeDate.padStart(2, '0')}`;

  const currentSchedules = getTasksByDate(activeDate, displayDateLabel);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Center active date in scroll strip
  useEffect(() => {
    const scrollToActive = (behavior: ScrollBehavior = 'smooth') => {
      if (viewMode === 'strip' && dateScrollRef.current) {
        const activeElement = dateScrollRef.current.querySelector('.date-cell.active') as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior,
            inline: 'center',
            block: 'nearest',
          });
        }
      }
    };

    scrollToActive('auto');
    const timer = setTimeout(() => scrollToActive('smooth'), 120);
    return () => clearTimeout(timer);
  }, [activeDate, viewMode, selectedMonth, selectedYear]);

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    const newDaysInMonth = new Date(selectedYear, newMonth + 1, 0).getDate();
    const currentNum = parseInt(activeDate, 10) || 1;
    if (currentNum > newDaysInMonth) {
      setActiveDate(newDaysInMonth.toString());
    }
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    const newDaysInMonth = new Date(newYear, selectedMonth + 1, 0).getDate();
    const currentNum = parseInt(activeDate, 10) || 1;
    if (currentNum > newDaysInMonth) {
      setActiveDate(newDaysInMonth.toString());
    }
  };

  const handleGoToToday = () => {
    const t = new Date();
    setSelectedYear(t.getFullYear());
    setSelectedMonth(t.getMonth());
    setActiveDate(t.getDate().toString());
  };

  const handleCalendarDateSelect = (isoVal: string) => {
    const cleanDate = isoVal.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    setSelectedYear(year);
    setSelectedMonth(month - 1);
    setActiveDate(day.toString());
  };

  return (
    <IonPage className="schedule-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="schedule-toolbar">
          <div slot="start" style={{ width: '48px' }}></div>
          <IonTitle className="ion-text-center" style={{ fontWeight: 'bold' }}>My Schedule</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              className="schedule-view-toggle-btn"
              onClick={() => setViewMode(prev => prev === 'calendar' ? 'strip' : 'calendar')}
              title={viewMode === 'calendar' ? 'Switch to Week View' : 'Switch to Calendar View'}
            >
              <IonIcon icon={viewMode === 'calendar' ? listOutline : calendarOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="schedule-content">
        <div className="schedule-scroll-container">
          {/* Month & Year Dropdown Header */}
          <div className="month-header-wrapper" ref={dropdownRef}>
            <button 
              type="button"
              className={`month-header-btn ${isDropdownOpen ? 'is-open' : ''}`}
              onClick={() => setIsDropdownOpen(prev => !prev)}
              aria-label="Select month and year"
              aria-expanded={isDropdownOpen}
            >
              <span className="month-header-text">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <IonIcon 
                icon={chevronDownOutline} 
                className={`month-header-chevron ${isDropdownOpen ? 'rotated' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="month-year-backdrop" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="month-year-dropdown-card">
                  <div className="dropdown-card-header">
                    <span className="dropdown-card-title">Select Month & Year</span>
                    <button 
                      type="button" 
                      className="dropdown-today-chip"
                      onClick={handleGoToToday}
                    >
                      Today
                    </button>
                  </div>

                  {/* Dropdown Select Controls Row */}
                  <div className="dropdown-selects-row">
                    <div className="dropdown-select-group">
                      <label htmlFor="month-select-input" className="dropdown-select-label">Month</label>
                      <div className="select-input-wrapper">
                        <select
                          id="month-select-input"
                          value={selectedMonth}
                          onChange={(e) => handleMonthChange(Number(e.target.value))}
                          className="styled-date-select"
                        >
                          {MONTH_NAMES.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                          ))}
                        </select>
                        <IonIcon icon={chevronDownOutline} className="select-caret-icon" />
                      </div>
                    </div>

                    <div className="dropdown-select-group">
                      <label htmlFor="year-select-input" className="dropdown-select-label">Year</label>
                      <div className="select-input-wrapper">
                        <select
                          id="year-select-input"
                          value={selectedYear}
                          onChange={(e) => handleYearChange(Number(e.target.value))}
                          className="styled-date-select"
                        >
                          {AVAILABLE_YEARS.map((yr) => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                        <IonIcon icon={chevronDownOutline} className="select-caret-icon" />
                      </div>
                    </div>
                  </div>

                  {/* 12-Month Quick-Select Chips */}
                  <div className="month-chips-grid">
                    {MONTH_SHORT.map((shortName, idx) => {
                      const isSelected = selectedMonth === idx;
                      const isCurrent = 
                        today.getMonth() === idx && 
                        today.getFullYear() === selectedYear;
                      return (
                        <button
                          key={shortName}
                          type="button"
                          className={`month-grid-chip ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                          onClick={() => handleMonthChange(idx)}
                        >
                          {shortName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer with Done button */}
                  <div className="dropdown-card-footer">
                    <button
                      type="button"
                      className="dropdown-done-action-btn"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Date View: Full Month Calendar vs Date Strip */}
          {viewMode === 'calendar' ? (
            <div className="calendar-view-container">
              <div className="calendar-card">
                <IonDatetime
                  presentation="date"
                  value={selectedIsoDate}
                  firstDayOfWeek={user.preferences?.weekStartDay === 'Sunday' ? 0 : 1}
                  preferWheel={false}
                  onIonChange={(e) => {
                    if (e.detail.value) {
                      handleCalendarDateSelect(e.detail.value as string);
                    }
                  }}
                />
              </div>
              <div className="calendar-selected-banner">
                <span>Selected: <strong>{displayDateLabel}</strong></span>
              </div>
            </div>
          ) : (
            <div className="date-selector-row" ref={dateScrollRef}>
              {monthDates.map((item, index) => {
                const isItemActive = activeDate === item.date;
                return (
                  <div 
                    key={index} 
                    className={`date-cell ${isItemActive ? 'active' : ''} ${item.isToday ? 'is-today' : ''}`}
                    onClick={() => {
                      setActiveDate(item.date);
                    }}
                  >
                    <span className="day-name">{item.isToday ? 'Today' : item.day}</span>
                    <span className="day-number">{item.date}</span>
                    {item.isToday && <span className="today-dot"></span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Agenda Header */}
          <div className="schedule-agenda-header">
            <div className="agenda-title-group">
              <span className="agenda-subtitle">Timeline Agenda</span>
              <h3 className="agenda-day-heading">{displayDateLabel}</h3>
            </div>
            <div className="agenda-count-badge">
              {currentSchedules.length} {currentSchedules.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* Schedule List */}
          {currentSchedules.length > 0 ? (
            <div className="schedule-timeline-list">
              {currentSchedules.map((entry) => {
                const priorityClass = entry.priority || 'low';
                const isCompleted = !!entry.completed;

                return (
                  <div key={entry.id} className={`schedule-timeline-item ${isCompleted ? 'is-completed' : ''}`}>
                    {/* Timeline Node & Time */}
                    <div className="timeline-marker-col">
                      <div className="timeline-time-label">{entry.time}</div>
                      <div className={`timeline-node-dot ${priorityClass}`}></div>
                      <div className="timeline-line"></div>
                    </div>

                    {/* Schedule Card */}
                    <div className="timeline-card-col">
                      <div className={`schedule-enhanced-card priority-${priorityClass} ${isCompleted ? 'card-done' : ''}`}>
                        <div className="schedule-card-top-row">
                          <div className="schedule-card-title-group">
                            <h4 className="schedule-card-title">{entry.title}</h4>
                          </div>

                          <div className="schedule-card-status-group">
                            {entry.priority && (
                              <span className={`schedule-priority-pill ${entry.priority}`}>
                                {entry.priority.toUpperCase()}
                              </span>
                            )}
                            <button
                              type="button"
                              className={`schedule-check-btn ${isCompleted ? 'checked' : ''}`}
                              onClick={() => {
                                updateTask({
                                  ...entry,
                                  completed: !entry.completed,
                                });
                              }}
                              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                            >
                              <IonIcon icon={checkmarkCircleOutline} />
                            </button>
                          </div>
                        </div>

                        {/* Location & Time Meta */}
                        <div className="schedule-card-meta-row">
                          {entry.location && (
                            <span className="schedule-meta-badge location">
                              <IonIcon icon={locationOutline} />
                              <span>{entry.location}</span>
                            </span>
                          )}
                          <span className="schedule-meta-badge time">
                            <IonIcon icon={timeOutline} />
                            <span>{entry.time}</span>
                          </span>
                          {entry.reminder && (
                            <span className="schedule-meta-badge reminder">
                              <IonIcon icon={notificationsOutline} />
                              <span>{entry.reminder}</span>
                            </span>
                          )}
                        </div>

                        {/* Notes Preview if present */}
                        {entry.notes && (
                          <div className="schedule-card-notes">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="schedule-empty-state">
              <div className="empty-icon-container">
                <IonIcon icon={timeOutline} />
              </div>
              <h4>No tasks scheduled</h4>
              <p>You have a clear schedule for this day. Tap below to add a class, meeting, or study session.</p>
            </div>
          )}
        </div>

        {/* Background Waves — fixed */}
        <div slot="fixed" className="schedule-waves-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(116, 198, 157, 0.15)" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.25)" d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.35)" d="M0,288L80,277.3C160,267,320,245,480,245.3C640,245,800,267,960,277.3C1120,288,1280,288,1360,288L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Floating Action Button - Pill shaped */}
        <div className="floating-pill-container">
          <button className="pill-button" onClick={() => navigate('/app/add-task')}>
            <IonIcon icon={add} style={{ marginRight: '8px' }} />
            Add Schedule
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Schedule;
