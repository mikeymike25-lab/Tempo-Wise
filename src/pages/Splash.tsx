import React, { useEffect } from 'react';
import { IonContent, IonPage, IonText } from '@ionic/react';
import { useNavigate } from 'react-router-dom';

const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center" color="primary">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <IonText color="light">
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Tempus Wise</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Make Time Work for You.</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;
