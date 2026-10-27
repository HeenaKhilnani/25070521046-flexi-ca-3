import React from 'react';

export function ScoreRing({ percentage = 0, size = 160, strokeWidth = 14, passed = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const color = passed ? 'var(--color-teal)' : 'var(--color-error)';
  const trackColor = passed ? 'var(--color-teal-soft)' : 'var(--color-error-soft)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Center percentage label */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{
          fontSize: size > 120 ? '2.25rem' : '1.5rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1
        }}>
          {clamped}%
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginTop: '4px'
        }}>
          {passed ? 'Passed' : 'Needs Review'}
        </span>
      </div>
    </div>
  );
}
