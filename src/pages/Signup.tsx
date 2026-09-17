import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  checkmarkCircle,
  timeOutline,
  leafOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { setStorageItem } from '../data/storage';
import { useUser } from '../data/UserContext';
import { signUpUser, getReadableAuthErrorMessage } from '../services/authService';
import { seedInitialUserData } from '../services/firestoreService';
import { isFirebaseConfigured } from '../services/firebase';
import './Auth.css';

interface SignupProps {
  onLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { updateUser, login } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field touched tracking
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', hint: 'Enter at least 6 characters' };
    if (pass.length < 6) return { score: 1, label: 'Too short', hint: 'Minimum 6 characters required' };

    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', hint: 'Add numbers or special characters' };
      case 2:
        return { score: 2, label: 'Fair', hint: 'Good start, add uppercase & symbols' };
      case 3:
        return { score: 3, label: 'Good', hint: 'Strong password! Safe to use' };
      case 4:
      default:
        return { score: 4, label: 'Strong', hint: 'Great combination of characters' };
    }
  };

  const strength = calculatePasswordStrength(password);

  // Validation checks
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmMatch = confirmPassword.length > 0 && confirmPassword === password;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmMatch;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSignup = async () => {
    // Mark all touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid) {
      setToastMessage('Please complete all fields according to validation requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isFirebaseConfigured) {
        const fbUser = await signUpUser(email.trim(), password, name.trim());
        const uid = fbUser.uid;
        // Seed initial starter data in Firestore for this new user
        await seedInitialUserData(uid, name.trim(), email.trim());
        updateUser({
          id: uid,
          fullName: name.trim(),
          email: email.trim(),
          title: 'Student / Working Professional',
        });
        login(uid);
      } else {
        // Local storage demo fallback
        setStorageItem('isLoggedIn', true);
        updateUser({
          fullName: name.trim(),
          email: email.trim(),
          title: 'Student / Working Professional',
        });
        login();
      }

      onLogin();
      setIsSubmitting(false);
      navigate('/app/home', { replace: true });
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errMsg = getReadableAuthErrorMessage(err);
      setToastMessage(errMsg);
    }
  };

  const handleQuickDemoFill = () => {
    setName('Raven Rose');
    setEmail('raven.rose@student.edu');
    setPassword('TempusWise@2026');
    setConfirmPassword('TempusWise@2026');
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
  };

  return (
    <IonPage className="auth-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="auth-toolbar">
          <IonTitle className="auth-toolbar-title">Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="auth-content">
        <div slot="fixed" className="auth-ambient-glow"></div>

        <div className="auth-scroll-container">
          {/* Brand Header */}
          <div className="auth-brand-header">
            <div className="auth-logo-badge">
              <IonIcon icon={timeOutline} />
              <IonIcon icon={leafOutline} className="auth-logo-sub-icon" />
            </div>
            <h1 className="auth-brand-title">Tempus Wise</h1>
            <p className="auth-brand-tagline">Make Time Work for You.</p>
          </div>

          {/* Form Card */}
          <div className="auth-card">
            <h2 className="auth-card-title">Create an Account</h2>
            <p className="auth-card-subtitle">
              Start mastering your schedule, routines, and focus sessions today.
            </p>

            {/* Field 1: Name */}
            <div className="auth-input-group">
              <label className="auth-input-label">
                <IonIcon icon={personOutline} className="auth-input-label-icon" />
                Full Name
              </label>
              <div className={`auth-input-wrapper ${touched.name && !isNameValid ? 'has-error' : ''}`}>
                <IonInput
                  type="text"
                  placeholder="e.g. Raven Rose"
                  className="auth-input-field"
                  value={name}
                  onIonInput={(e) => setName(e.detail.value || '')}
                  onIonBlur={() => handleBlur('name')}
                />
                {touched.name && isNameValid && (
                  <IonIcon icon={checkmarkCircle} style={{ color: '#15803D', fontSize: '18px' }} />
                )}
              </div>
              {touched.name && !isNameValid && (
                <div className="auth-error-msg">
                  <IonIcon icon={alertCircleOutline} />
                  Please enter your full name (at least 2 characters).
                </div>
              )}
            </div>

            {/* Field 2: Email */}
            <div className="auth-input-group">
              <label className="auth-input-label">
                <IonIcon icon={mailOutline} className="auth-input-label-icon" />
                Email Address
              </label>
              <div className={`auth-input-wrapper ${touched.email && !isEmailValid ? 'has-error' : ''}`}>
                <IonInput
                  type="email"
                  placeholder="e.g. name@university.edu"
                  className="auth-input-field"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value || '')}
                  onIonBlur={() => handleBlur('email')}
                />
                {touched.email && isEmailValid && (
                  <IonIcon icon={checkmarkCircle} style={{ color: '#15803D', fontSize: '18px' }} />
                )}
              </div>
              {touched.email && !isEmailValid && (
                <div className="auth-error-msg">
                  <IonIcon icon={alertCircleOutline} />
                  Please enter a valid email address.
                </div>
              )}
            </div>

            {/* Field 3: Password */}
            <div className="auth-input-group">
              <label className="auth-input-label">
                <IonIcon icon={lockClosedOutline} className="auth-input-label-icon" />
                Password
              </label>
              <div className={`auth-input-wrapper ${touched.password && !isPasswordValid ? 'has-error' : ''}`}>
                <IonInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className="auth-input-field"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value || '')}
                  onIonBlur={() => handleBlur('password')}
                />
                <IonButton
                  fill="clear"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} slot="icon-only" />
                </IonButton>
              </div>

              {touched.password && !isPasswordValid && (
                <div className="auth-error-msg">
                  <IonIcon icon={alertCircleOutline} />
                  Password must be at least 6 characters long.
                </div>
              )}

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <div className="password-strength-container">
                  <div className="password-strength-header">
                    <span className="password-strength-title">Password Strength</span>
                    <span className={`password-strength-label strength-${strength.score}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="password-strength-bars">
                    <div
                      className={`password-bar-segment ${
                        strength.score >= 1 ? (strength.score === 1 ? 'active-weak' : strength.score === 2 ? 'active-medium' : strength.score === 3 ? 'active-good' : 'active-strong') : ''
                      }`}
                    />
                    <div
                      className={`password-bar-segment ${
                        strength.score >= 2 ? (strength.score === 2 ? 'active-medium' : strength.score === 3 ? 'active-good' : 'active-strong') : ''
                      }`}
                    />
                    <div
                      className={`password-bar-segment ${
                        strength.score >= 3 ? (strength.score === 3 ? 'active-good' : 'active-strong') : ''
                      }`}
                    />
                    <div
                      className={`password-bar-segment ${
                        strength.score >= 4 ? 'active-strong' : ''
                      }`}
                    />
                  </div>
                  <p className="password-hint-text">{strength.hint}</p>
                </div>
              )}
            </div>

            {/* Field 4: Confirm Password */}
            <div className="auth-input-group">
              <label className="auth-input-label">
                <IonIcon icon={shieldCheckmarkOutline} className="auth-input-label-icon" />
                Confirm Password
              </label>
              <div
                className={`auth-input-wrapper ${
                  touched.confirmPassword && (!confirmPassword || confirmPassword !== password) ? 'has-error' : ''
                }`}
              >
                <IonInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-type your password"
                  className="auth-input-field"
                  value={confirmPassword}
                  onIonInput={(e) => setConfirmPassword(e.detail.value || '')}
                  onIonBlur={() => handleBlur('confirmPassword')}
                />
                <IonButton
                  fill="clear"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} slot="icon-only" />
                </IonButton>
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div
                  className={`password-match-indicator ${
                    isConfirmMatch ? 'matched' : 'unmatched'
                  }`}
                >
                  <IonIcon icon={isConfirmMatch ? checkmarkCircle : alertCircleOutline} />
                  {isConfirmMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
              {touched.confirmPassword && !confirmPassword && (
                <div className="auth-error-msg">
                  <IonIcon icon={alertCircleOutline} />
                  Please confirm your password.
                </div>
              )}
            </div>

            {/* Submit Button */}
            <IonButton
              expand="block"
              shape="round"
              className="auth-submit-btn"
              onClick={handleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <IonSpinner name="crescent" style={{ color: '#FFFFFF' }} />
              ) : (
                <>
                  <span>Sign Up</span>
                  <IonIcon icon={arrowForwardOutline} slot="end" />
                </>
              )}
            </IonButton>

            {/* Quick Demo Autofill */}
            <div className="auth-demo-pill">
              <IonButton
                fill="outline"
                size="small"
                className="auth-demo-btn"
                onClick={handleQuickDemoFill}
              >
                Quick Demo Auto-fill
              </IonButton>
            </div>
          </div>

          {/* Switch to Login */}
          <div className="auth-switch-box">
            Already have an account?
            <span
              className="auth-switch-link"
              onClick={() => navigate('/login')}
            >
              Log In
            </span>
          </div>
        </div>

        {/* Background Waves anchored to the bottom of the viewport — fixed */}
        <div slot="fixed" className="auth-waves-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(116, 198, 157, 0.2)" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.3)" d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="rgba(116, 198, 157, 0.45)" d="M0,288L80,277.3C160,267,320,245,480,245.3C640,245,800,267,960,277.3C1120,288,1280,288,1360,288L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Feedback Toast */}
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

export default Signup;
