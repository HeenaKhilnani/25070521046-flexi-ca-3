import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export function CountdownTimer({ deadline, serverTime, onExpire }) {
  // Compute initial delta between server and local clock to prevent device clock drift
  const [clockOffset] = useState(() => {
    if (!serverTime) return 0;
    return new Date(serverTime).getTime() - Date.now();
  });

  const calculateRemaining = () => {
    if (!deadline) return 0;
    const authoritativeNow = Date.now() + clockOffset;
    const diff = new Date(deadline).getTime() - authoritativeNow;
    return Math.max(0, diff);
  };

  const [remainingMs, setRemainingMs] = useState(calculateRemaining);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingMs(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(timer);
        if (typeof onExpire === 'function') {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, clockOffset]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  const isUrgent = remainingMs <= 60 * 1000 && remainingMs > 0; // < 1 min
  const isWarning = remainingMs <= 5 * 60 * 1000 && !isUrgent; // < 5 mins

  const formattedTime = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let bg = 'var(--bg-surface)';
  let border = 'var(--border-subtle)';
  let textColor = 'var(--text-main)';
  let iconColor = 'var(--color-violet)';

  if (isUrgent) {
    bg = 'var(--color-error-soft)';
    border = 'var(--color-error)';
    textColor = 'var(--color-error)';
    iconColor = 'var(--color-error)';
  } else if (isWarning) {
    bg = 'var(--color-amber-soft)';
    border = 'var(--color-amber)';
    textColor = '#b2750e';
    iconColor = '#b2750e';
  }

  return (
    <div
      className={isUrgent ? 'pulse-urgent' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        border: `1.5px solid ${border}`,
        color: textColor,
        fontWeight: 700,
        fontSize: '1rem',
        fontFamily: 'var(--font-mono)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all var(--transition-fast)'
      }}
      title="Remaining Examination Time"
    >
      {isUrgent ? (
        <AlertTriangle size={18} color={iconColor} />
      ) : (
        <Clock size={18} color={iconColor} />
      )}
      <span>{formattedTime}</span>
      {isUrgent && (
        <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Final Minute!
        </span>
      )}
    </div>
  );
}
