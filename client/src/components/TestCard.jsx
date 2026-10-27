import React from 'react';
import { Clock, HelpCircle, Award, ArrowRight, Lock, Play, RotateCcw, CheckCircle } from 'lucide-react';

export function TestCard({ test, isUpcoming = false, onAction }) {
  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Data Structures':
        return 'badge-violet';
      case 'Database Systems':
        return 'badge-teal';
      case 'Computer Networks':
        return 'badge-amber';
      default:
        return 'badge-neutral';
    }
  };

  const status = test.userStatus || {};

  return (
    <div className="card card-interactive" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div>
        {/* Top Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '14px'
        }}>
          <span className={`badge ${getSubjectColor(test.subject)}`}>
            {test.subject}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 600
          }}>
            {test.code}
          </span>
        </div>

        {/* Title & Description */}
        <h3 style={{
          fontSize: '1.1875rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          lineHeight: 1.3,
          marginBottom: '8px'
        }}>
          {test.title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '20px'
        }}>
          {test.description}
        </p>

        {/* Key Examination Meta Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={16} color="var(--color-violet)" />
            <span>{test.durationMinutes} mins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HelpCircle size={16} color="var(--color-teal)" />
            <span>{test.questionCount} Questions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Award size={16} color="var(--color-amber)" />
            <span>{test.totalMarks} Marks</span>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {isUpcoming ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              <Lock size={15} />
              Opens {new Date(test.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span className="badge badge-amber">Upcoming</span>
          </div>
        ) : (
          <>
            {status.hasActiveAttempt ? (
              <button
                onClick={() => onAction('resume', test)}
                className="btn btn-primary"
                style={{ width: '100%', backgroundColor: 'var(--color-teal)' }}
              >
                <RotateCcw size={16} />
                Resume Active Attempt
              </button>
            ) : status.hasCompleted && !status.canAttempt ? (
              <button
                onClick={() => onAction('result', test)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                <CheckCircle size={16} />
                View Completed Result
              </button>
            ) : (
              <button
                onClick={() => onAction('instructions', test)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Play size={16} />
                Start Assessment
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
