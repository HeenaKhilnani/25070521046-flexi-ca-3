import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export function Alert({ type = 'error', message, title, children }) {
  if (!message && !children) return null;

  const styles = {
    error: {
      bg: 'var(--color-error-soft)',
      border: 'var(--color-error)',
      text: '#9f1d35',
      icon: AlertCircle
    },
    success: {
      bg: 'var(--color-success-soft)',
      border: 'var(--color-success)',
      text: '#0f5b49',
      icon: CheckCircle2
    },
    warning: {
      bg: 'var(--color-amber-soft)',
      border: 'var(--color-amber)',
      text: '#8a5c0b',
      icon: AlertTriangle
    },
    info: {
      bg: 'var(--color-lavender-soft)',
      border: 'var(--color-violet)',
      text: 'var(--color-violet)',
      icon: Info
    }
  };

  const scheme = styles[type] || styles.error;
  const Icon = scheme.icon;

  return (
    <div style={{
      backgroundColor: scheme.bg,
      borderLeft: `4px solid ${scheme.border}`,
      color: scheme.text,
      padding: '14px 18px',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px'
    }}>
      <Icon size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ fontSize: '0.875rem' }}>
        {title && <div style={{ fontWeight: 700, marginBottom: '2px' }}>{title}</div>}
        <div>{message || children}</div>
      </div>
    </div>
  );
}
