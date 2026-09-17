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
  mailOutline,
  lockClosedOutline,
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
import { formatDisplayName } from '../data/user';
import { signInUser, sendPasswordReset, getReadableAuthErrorMessage } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';
import './Auth.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { user, login, updateUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleLogin = async () => {
    setTouched({
      email: true,
      password: true,
    });

    if (!isFormValid) {
      setToastMessage('Please enter a valid email and password (minimum 6 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isFirebaseConfigured) {
        const fbUser = await signInUser(email.trim(), password);
        const resolvedName = formatDisplayName(fbUser.displayName, fbUser.email || email.trim());
        updateUser({
          id: fbUser.uid,
          email: fbUser.email || email.trim(),
          fullName: resolvedName,
        });
        login(fbUser.uid);
      } else {
        const resolvedName = formatDisplayName('', email.trim());
        setStorageItem('isLoggedIn', true);
        updateUser({
          email: email.trim(),
          fullName: resolvedName,
        });
        login();
      }
      onLogin();
      setIsSubmitting(false);
      navigate('/app/home', { replace: true });
    } catch (err: unknown) {
      // Offline fallback for pre-filled demo account if network/auth fails
      if (email.trim().toLowerCase() === 'raven.rose@student.edu' && password === 'TempusWise@2026') {
        setStorageItem('isLoggedIn', true);
        login();
        onLogin();
        setIsSubmitting(false);
        navigate('/app/home', { replace: true });
        return;
      }

      setIsSubmitting(false);
      const errMsg = getReadableAuthErrorMessage(err);
      setToastMessage(errMsg);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setToastMessage('Please enter your email above to receive a password reset link.');
      return;
    }

    try {
      if (isFirebaseConfigured) {
        await sendPasswordReset(email.trim());
        setToastMessage(`Password reset link sent to ${email.trim()}! Please check your inbox.`);
      } else {
        setToastMessage('Password reset is unavailable in offline demo mode.');
      }
    } catch (err: unknown) {
      setToastMessage(getReadableAuthErrorMessage(err));
    }
  };

  const handleQuickDemoFill = () => {
    setEmail(user.email || 'raven.rose@student.edu');
    setPassword('TempusWise@2026');
    setTouched({
      email: true,
      password: true,
    });
  };

  return (
    <IonPage className="auth-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="auth-toolbar">
          <IonTitle className="auth-toolbar-title">Log In</IonTitle>
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
            <h2 className="auth-card-title">Welcome Back</h2>
            <p className="auth-card-subtitle">
              Sign in to manage your schedule, routines, and daily focus.
            </p>

            {/* Field 1: Email */}
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

            {/* Field 2: Password */}
            <div className="auth-input-group">
              <label className="auth-input-label">
                <IonIcon icon={lockClosedOutline} className="auth-input-label-icon" />
                Password
              </label>
              <div className={`auth-input-wrapper ${touched.password && !isPasswordValid ? 'has-error' : ''}`}>
                <IonInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
                  Password must be at least 6 characters.
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="auth-forgot-box">
              <span className="auth-forgot-link" onClick={handleForgotPassword}>
                Forgot Password?
              </span>
            </div>

            {/* Submit Button */}
            <IonButton
              expand="block"
              shape="round"
              className="auth-submit-btn"
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <IonSpinner name="crescent" style={{ color: '#FFFFFF' }} />
              ) : (
                <>
                  <span>Log In</span>
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

          {/* Switch to Sign Up */}
          <div className="auth-switch-box">
            Don't have an account?
            <span
              className="auth-switch-link"
              onClick={() => navigate('/signup')}
            >
              Sign Up
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

export default Login;
