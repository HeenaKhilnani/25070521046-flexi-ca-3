import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ScoreRing } from '../components/ScoreRing.jsx';
import { Alert } from '../components/Alert.jsx';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

export function ResultsPage({ attemptId, onNavigate }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await api.attempts.getResult(attemptId);
        if (res?.result) {
          setResult(res.result);
          // Expand all by default
          const allExp = {};
          (res.result.questionBreakdown || []).forEach((_, idx) => {
            allExp[idx] = true;
          });
          setExpandedQuestions(allExp);
        }
      } catch (err) {
        setError(err.message || 'Failed to load examination result.');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  const toggleQuestion = (idx) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const formatTime = (secs) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--color-teal)',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Compiling official score report...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <Alert type="error" message={error || 'Result record unavailable.'} />
        <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 60px 0', backgroundColor: 'var(--bg-page)' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Results Banner Header */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-violet">{result.subject}</span>
              <span className={`badge ${result.passed ? 'badge-teal' : 'badge-error'}`}>
                {result.passed ? 'Examination Passed' : 'Did Not Meet Threshold'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {result.testTitle}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Official examination final report evaluated by NEXTEST Node.js scoring engine.
            </p>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Marks Obtained: </span>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.125rem' }}>
                  {result.score} / {result.totalMarks}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Duration: </span>
                <strong style={{ color: 'var(--text-main)' }}>{formatTime(result.timeTakenSeconds)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Submitted: </span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {new Date(result.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
            </div>
          </div>

          {/* Circular Score Gauge */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScoreRing
              percentage={result.percentage}
              size={150}
              passed={result.passed}
            />
          </div>
        </div>

        {/* Breakdown Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '36px'
        }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-teal-soft)',
              color: 'var(--color-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CORRECT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{result.correctCount}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-soft)',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <XCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INCORRECT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{result.incorrectCount}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-amber-soft)',
              color: '#8a5c0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNANSWERED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{result.unansweredCount}</div>
            </div>
          </div>
        </div>

        {/* Question-by-Question Review Section */}
        {result.allowReview && result.questionBreakdown?.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={20} color="var(--color-violet)" />
                Detailed Question Review & Explanations
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {result.questionBreakdown.length} Questions Evaluated
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.questionBreakdown.map((item, idx) => {
                const isExpanded = expandedQuestions[idx] !== false;
                return (
                  <div key={item.id || idx} className="card" style={{ padding: '24px' }}>
                    {/* Item Top bar */}
                    <div
                      onClick={() => toggleQuestion(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.isCorrect ? (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-teal-soft)',
                            color: 'var(--color-teal)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <CheckCircle size={18} />
                          </div>
                        ) : item.isUnanswered ? (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-amber-soft)',
                            color: '#8a5c0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <HelpCircle size={18} />
                          </div>
                        ) : (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-error-soft)',
                            color: 'var(--color-error)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <XCircle size={18} />
                          </div>
                        )}

                        <div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Question {idx + 1}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginLeft: '8px',
                            color: item.isCorrect ? 'var(--color-teal)' : item.isUnanswered ? '#8a5c0b' : 'var(--color-error)'
                          }}>
                            +{item.marksAwarded} / {item.marksPossible} Marks
                          </span>
                        </div>
                      </div>

                      {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                        {/* Question Text */}
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.5 }}>
                          {item.questionText}
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {item.options?.map((opt) => {
                            const isCorrectOpt = opt.id === item.correctOptionId;
                            const isStudentOpt = opt.id === item.studentAnswer;

                            let optBg = 'var(--bg-page)';
                            let optBorder = '1px solid var(--border-subtle)';
                            let optColor = 'var(--text-main)';

                            if (isCorrectOpt) {
                              optBg = 'var(--color-teal-soft)';
                              optBorder = '1.5px solid var(--color-teal)';
                              optColor = 'var(--color-success)';
                            } else if (isStudentOpt && !item.isCorrect) {
                              optBg = 'var(--color-error-soft)';
                              optBorder = '1.5px solid var(--color-error)';
                              optColor = 'var(--color-error)';
                            }

                            return (
                              <div
                                key={opt.id}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: optBg,
                                  border: optBorder,
                                  color: optColor,
                                  fontSize: '0.875rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <div>
                                  <strong style={{ marginRight: '6px', textTransform: 'uppercase' }}>{opt.id}.</strong>
                                  {opt.text}
                                </div>
                                <div>
                                  {isCorrectOpt && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-teal)' }}>
                                      Correct Answer ✓
                                    </span>
                                  )}
                                  {isStudentOpt && !isCorrectOpt && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-error)' }}>
                                      Your Choice ✗
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation box */}
                        {item.explanation && (
                          <div style={{
                            backgroundColor: 'rgba(113, 87, 232, 0.08)',
                            borderLeft: '3px solid var(--color-violet)',
                            padding: '12px 16px',
                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)'
                          }}>
                            <strong style={{ color: 'var(--color-violet)' }}>Concept Explanation: </strong>
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px'
        }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn btn-outline"
          >
            Return to Dashboard
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="btn btn-primary"
          >
            View All Past Attempts
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
