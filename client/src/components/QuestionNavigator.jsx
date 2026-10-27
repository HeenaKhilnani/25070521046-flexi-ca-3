import React from 'react';
import { Check } from 'lucide-react';

export function QuestionNavigator({
  questions = [],
  currentIndex = 0,
  savedResponses = {},
  onSelectIndex
}) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Question Navigator
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {Object.keys(savedResponses).filter(k => savedResponses[k]).length} of {questions.length} Answered
        </span>
      </div>

      {/* Grid of Question Numbers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(savedResponses[q.id]);

          let bg = 'var(--bg-surface)';
          let color = 'var(--text-secondary)';
          let border = '1px solid var(--border-medium)';
          let shadow = 'none';

          if (isCurrent) {
            border = '2px solid var(--color-violet)';
            bg = isAnswered ? 'var(--color-teal)' : 'var(--color-lavender-soft)';
            color = isAnswered ? '#FFFFFF' : 'var(--color-violet)';
            shadow = '0 0 10px rgba(113, 87, 232, 0.4)';
          } else if (isAnswered) {
            bg = 'var(--color-teal)';
            border = '1px solid var(--color-teal)';
            color = '#FFFFFF';
          }

          return (
            <button
              key={q.id || idx}
              onClick={() => onSelectIndex(idx)}
              style={{
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: bg,
                border: border,
                color: color,
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadow,
                transition: 'all var(--transition-fast)'
              }}
              title={`Jump to Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: 'var(--color-teal)'
          }} />
          <span>Answered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: 'var(--color-lavender-soft)',
            border: '2px solid var(--color-violet)'
          }} />
          <span>Current Question</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)'
          }} />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
