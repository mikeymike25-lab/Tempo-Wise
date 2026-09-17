import React from 'react';

interface ProgressRingProps {
  percentage: number;
  radius?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subtitle?: string;
  fontSize?: string;
  children?: React.ReactNode;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  percentage, 
  radius = 50, 
  stroke = 8, 
  color = 'var(--ion-color-secondary, #74C69D)',
  trackColor = '#E8F5E9',
  label,
  subtitle,
  fontSize,
  children
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 2px 6px rgba(116, 198, 157, 0.45))'
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '0 8px',
        pointerEvents: 'none'
      }}>
        {children ? children : (
          <>
            <span style={{
              fontSize: fontSize || (radius >= 60 ? '1.85rem' : '1.2rem'),
              fontWeight: 800,
              color: 'var(--ion-color-primary, #1B4332)',
              lineHeight: 1.05,
              letterSpacing: '-0.5px'
            }}>
              {percentage}%
            </span>
            {subtitle && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--ion-color-medium, #6B7280)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '3px'
              }}>
                {subtitle}
              </span>
            )}
            {label && (
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--ion-color-medium, #6B7280)',
                marginTop: '2px'
              }}>
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
