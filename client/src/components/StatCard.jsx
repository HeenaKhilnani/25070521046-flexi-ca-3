import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'violet' }) {
  const colorMap = {
    violet: {
      bg: 'var(--color-lavender-soft)',
      accent: 'var(--color-violet)'
    },
    teal: {
      bg: 'var(--color-teal-soft)',
      accent: 'var(--color-teal)'
    },
    amber: {
      bg: 'var(--color-amber-soft)',
      accent: 'var(--color-amber)'
    },
    navy: {
      bg: 'rgba(37, 42, 90, 0.08)',
      accent: 'var(--color-indigo)'
    }
  };

  const scheme = colorMap[color] || colorMap.violet;

  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <div>
        <div style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '6px'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '4px'
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>

      {Icon && (
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: scheme.bg,
          color: scheme.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
