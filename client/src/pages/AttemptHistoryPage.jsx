import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Alert } from '../components/Alert.jsx';
import { CheckSquare, ArrowRight, Clock, Award, BookOpen } from 'lucide-react';

export function AttemptHistoryPage({ onSelectAttempt, onNavigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.attempts.getHistory();
        if (res?.history) {
          setHistory(res.history);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attempt history.');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatTime = (secs) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div style={{ padding: '40px 0 60px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <CheckSquare size={16} />
            Academic Transcripts & History
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Examination Attempt History
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Verified records of all your completed online assessments persisted in MongoDB.
          </p>
        </div>

        <Alert type="error" message={error} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-medium)',
              borderTopColor: 'var(--color-teal)',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading assessment records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <CheckSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              No examination records found
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto', fontSize: '0.875rem' }}>
              You haven't submitted any examinations yet. Head to the Available Tests section to begin your first assessment.
            </p>
            <button
              onClick={() => onNavigate('available')}
              className="btn btn-primary"
            >
              <BookOpen size={16} />
              Browse Available Tests
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Assessment</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Date Attempted</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Time Taken</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Score</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Percentage</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((a) => (
                    <tr
                      key={a.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color var(--transition-fast)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                          {a.testTitle}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {a.testCode}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>• Attempt #{a.attemptNumber}</span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>
                        {new Date(a.submittedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>
                        {formatTime(a.timeTakenSeconds)}
                      </td>
                      <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {a.score} / {a.totalMarks}
                      </td>
                      <td style={{ padding: '18px 20px', fontWeight: 800 }}>
                        <span style={{ color: a.passed ? 'var(--color-teal)' : 'var(--color-error)' }}>
                          {a.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span className={`badge ${a.passed ? 'badge-teal' : 'badge-error'}`}>
                          {a.status === 'timed_out' ? 'Timed Out' : a.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => onSelectAttempt(a.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                        >
                          View Result
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
