import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonModal,
  IonDatetime
} from '@ionic/react';
import { 
  arrowBackOutline, 
  calendarOutline, 
  timeOutline, 
  notificationsOutline, 
  chevronDownOutline 
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useTasks, Task } from '../data/TaskContext';
import './AddTask.css';

const AddTask: React.FC = () => {
  const navigate = useNavigate();
  const { addTask } = useTasks();

  const [title, setTitle] = useState('');
  
  // Date state initialized dynamically to today
  const [dateIso, setDateIso] = useState(() => new Date().toISOString());
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Time state initialized dynamically to current rounded time
  const [timeIso, setTimeIso] = useState(() => new Date().toISOString());
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;
    return `${displayHours}:${displayMins} ${ampm}`;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [category, setCategory] = useState<'Study' | 'Work' | 'Personal'>('Personal');
  const [reminder, setReminder] = useState('15 minutes before');
  const [notes, setNotes] = useState('');

  const handleDateChange = (val: string) => {
    setDateIso(val);
    const cleanDate = val.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const formatted = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    setDate(formatted);
  };

  const handleTimeChange = (val: string) => {
    setTimeIso(val);
    let timeStr = val;
    if (timeStr.includes('T')) {
      timeStr = timeStr.split('T')[1];
    }
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const mFormatted = m < 10 ? `0${m}` : m;
    setTime(`${h}:${mFormatted} ${ampm}`);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      date,
      time,
      priority,
      category,
      reminder,
      notes,
      completed: false,
    };

    addTask(newTask);
    navigate('/app/schedule');
  };

  return (
    <IonPage className="add-task-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="add-task-toolbar">
          <IonButtons slot="start">
            <IonButton 
              className="add-task-back-btn" 
              onClick={() => navigate(-1)}
            >
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle className="add-task-title">Add Task</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="add-task-content">
        <div className="add-task-scroll-container">
          
          {/* Task Title */}
          <div className="form-group">
            <label>Task Title</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="e.g. Complete Engineering Assignment" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Date Picker Trigger */}
          <div className="form-group">
            <label>Date</label>
            <div 
              className="input-wrapper with-icon clickable-field" 
              onClick={() => setShowDatePicker(true)}
            >
              <input 
                type="text" 
                value={date}
                readOnly
                placeholder="Select date"
                className="picker-input"
              />
              <IonIcon icon={calendarOutline} className="input-icon" />
            </div>
          </div>

          {/* Time Picker Trigger */}
          <div className="form-group">
            <label>Time</label>
            <div 
              className="input-wrapper with-icon clickable-field" 
              onClick={() => setShowTimePicker(true)}
            >
              <input 
                type="text" 
                value={time}
                readOnly
                placeholder="Select time"
                className="picker-input"
              />
              <IonIcon icon={timeOutline} className="input-icon" />
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <div className="priority-chips">
              <button 
                type="button"
                className={`priority-chip low ${priority === 'low' ? 'active' : ''}`}
                onClick={() => setPriority('low')}
              >
                Low
              </button>
              <button 
                type="button"
                className={`priority-chip medium ${priority === 'medium' ? 'active' : ''}`}
                onClick={() => setPriority('medium')}
              >
                Medium
              </button>
              <button 
                type="button"
                className={`priority-chip high ${priority === 'high' ? 'active' : ''}`}
                onClick={() => setPriority('high')}
              >
                High
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <div className="category-chips">
              <button 
                type="button"
                className={`category-chip ${category === 'Study' ? 'active' : ''}`}
                onClick={() => setCategory('Study')}
              >
                Study
              </button>
              <button 
                type="button"
                className={`category-chip ${category === 'Work' ? 'active' : ''}`}
                onClick={() => setCategory('Work')}
              >
                Work
              </button>
              <button 
                type="button"
                className={`category-chip ${category === 'Personal' ? 'active' : ''}`}
                onClick={() => setCategory('Personal')}
              >
                Personal
              </button>
            </div>
          </div>

          {/* Reminder */}
          <div className="form-group">
            <label>Reminder</label>
            <div className="input-wrapper with-icon left-icon">
              <IonIcon icon={notificationsOutline} className="input-icon-left" />
              <select 
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="picker-input"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: 'inherit',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                  paddingLeft: '48px',
                  paddingRight: '40px',
                  paddingTop: '14px',
                  paddingBottom: '14px'
                }}
              >
                <option value="None">None</option>
                <option value="At time of event">At time of event</option>
                <option value="5 minutes before">5 minutes before</option>
                <option value="10 minutes before">10 minutes before</option>
                <option value="15 minutes before">15 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="1 day before">1 day before</option>
              </select>
              <IonIcon icon={chevronDownOutline} className="input-icon" />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes (Optional)</label>
            <div className="input-wrapper textarea-wrapper">
              <textarea 
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              ></textarea>
            </div>
          </div>

          {/* Save Button */}
          <div className="save-button-container">
            <button type="button" className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>

        </div>

        {/* Date Picker Modal */}
        <IonModal 
          isOpen={showDatePicker} 
          onDidDismiss={() => setShowDatePicker(false)}
          className="datetime-picker-modal"
        >
          <div className="datetime-modal-card">
            <div className="datetime-modal-header">
              <h4>Select Date</h4>
              <IonButton fill="clear" size="small" onClick={() => setShowDatePicker(false)}>
                Done
              </IonButton>
            </div>
            <IonDatetime
              presentation="date"
              value={dateIso}
              preferWheel={false}
              onIonChange={(e) => {
                if (e.detail.value) {
                  handleDateChange(e.detail.value as string);
                }
              }}
            />
          </div>
        </IonModal>

        {/* Time Picker Modal */}
        <IonModal 
          isOpen={showTimePicker} 
          onDidDismiss={() => setShowTimePicker(false)}
          className="datetime-picker-modal"
        >
          <div className="datetime-modal-card">
            <div className="datetime-modal-header">
              <h4>Select Time</h4>
              <IonButton fill="clear" size="small" onClick={() => setShowTimePicker(false)}>
                Done
              </IonButton>
            </div>
            <IonDatetime
              presentation="time"
              value={timeIso}
              preferWheel={true}
              onIonChange={(e) => {
                if (e.detail.value) {
                  handleTimeChange(e.detail.value as string);
                }
              }}
            />
          </div>
        </IonModal>

        {/* Background Waves — fixed */}
        <div slot="fixed" className="add-task-waves-bg">
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

export default AddTask;
