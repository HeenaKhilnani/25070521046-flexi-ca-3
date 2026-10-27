import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { CountdownTimer } from '../components/CountdownTimer.jsx';
import { QuestionNavigator } from '../components/QuestionNavigator.jsx';
import { Modal } from '../components/Modal.jsx';
import { Alert } from '../components/Alert.jsx';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Clock,
  HelpCircle
} from 'lucide-react';

export function TestTakingPage({ attemptId, onFinished, onNavigate }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local copy of saved responses { [qId]: optionId }
  const [responses, setResponses] = useState({});

  // Autosave status: 'saved' | 'saving' | 'error'
  const [saveStatus, setSaveStatus] = useState('saved');

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-submit modal (when timer expires)
  const [autoSubmitting, setAutoSubmitting] = useState(false);

  // Fetch active attempt
  useEffect(() => {
    async function loadAttempt() {
      try {
        setLoading(true);
        const res = await api.attempts.get(attemptId);
        if (res?.isFinalized) {
          // Already submitted or timed out -> jump to result
          onFinished(attemptId);
          return;
        }

        if (res?.attempt) {
          setAttempt(res.attempt);
          setResponses(res.attempt.savedResponses || {});
        }
      } catch (err) {
        setError(err.message || 'Failed to load test attempt.');
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  // Handle selecting an option for current question
  const handleSelectOption = async (optionId) => {
    if (!attempt || submitting || autoSubmitting) return;

    const currentQuestion = attempt.questions[currentIndex];
    if (!currentQuestion) return;

    const updatedResponses = {
      ...responses,
      [currentQuestion.id]: optionId
    };

    setResponses(updatedResponses);
    setSaveStatus('saving');

    try {
      await api.attempts.save(attemptId, {
        [currentQuestion.id]: optionId
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Autosave error:', err);
      if (err.status === 408) {
        // Deadline expired on server!
        handleTimeoutExpire();
      } else {
        setSaveStatus('error');
      }
    }
  };

  // Safe retry for failed saves
  const retrySave = async () => {
    setSaveStatus('saving');
    try {
      await api.attempts.save(attemptId, responses);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  // Final submit handler
  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      await api.attempts.submit(attemptId, responses);
      setShowSubmitModal(false);
      onFinished(attemptId);
    } catch (err) {
      setError(err.message || 'Submission failed. Please retry.');
      setSubmitting(false);
    }
  };

  // Timeout handler triggered when countdown hits 0
  const handleTimeoutExpire = async () => {
    if (autoSubmitting || submitting) return;
    setAutoSubmitting(true);
    try {
      await api.attempts.submit(attemptId, responses);
      onFinished(attemptId);
    } catch {
      // Even if error, result is auto-finalized on backend
      onFinished(attemptId);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--color-violet)',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
          Synchronizing examination with server...
        </p>
      </div>
    );
  }

  if (!attempt || !attempt.questions || attempt.questions.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <Alert type="error" message={error || 'Unable to load examination questions.'} />
        <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const questions = attempt.questions;
  const currentQ = questions[currentIndex];
  const selectedOption = responses[currentQ.id];

  const totalAnswered = Object.keys(responses).filter((k) => responses[k]).length;
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - totalAnswered;
  const progressPercent = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column' }}>
      {/* Examination Top Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 0',
        boxShadow: 'var(--shadow-xs)',
        position: 'sticky',
        top: 'var(--navbar-height)',
        zIndex: 90
      }}>
        <div className="container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Exam Title & Subject */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-violet">{attempt.subject}</span>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {attempt.testTitle}
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ({attempt.testCode})
            </span>
          </div>

          {/* Autosave Status, Timer & Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Autosave indicator */}
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {saveStatus === 'saved' && (
                <span style={{ color: 'var(--color-teal)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={15} />
                  Saved
                </span>
              )}
              {saveStatus === 'saving' && (
                <span style={{ color: 'var(--color-violet)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <RefreshCw size={14} className="spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'error' && (
                <button
                  onClick={retrySave}
                  style={{ color: 'var(--color-error)', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                  title="Click to retry saving answers"
                >
                  <AlertTriangle size={15} />
                  Retry Sync
                </button>
              )}
            </div>

            {/* Countdown Timer */}
            <CountdownTimer
              deadline={attempt.deadline}
              serverTime={attempt.serverTime}
              onExpire={handleTimeoutExpire}
            />

            {/* Submit Exam Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn btn-teal"
              style={{ padding: '8px 18px', fontSize: '0.875rem' }}
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--bg-muted)', marginTop: '12px' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: 'var(--color-teal)',
            transition: 'width 300ms ease-out'
          }} />
        </div>
      </div>

      {/* Examination Content Grid */}
      <div className="container" style={{ padding: '32px 24px', flex: 1 }}>
        <Alert type="error" message={error} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '28px',
          alignItems: 'start'
        }}>
          {/* Main Question Panel */}
          <div className="card" style={{ padding: '36px' }}>
            {/* Question Top Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--color-violet)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase'
              }}>
                Question {currentIndex + 1} of {totalQuestions}
              </div>
              <div className="badge badge-amber">
                {currentQ.marks || 5} Marks
              </div>
            </div>

            {/* Question Text */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.5,
              marginBottom: '28px'
            }}>
              {currentQ.questionText}
            </h2>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
              {currentQ.options?.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid var(--color-violet)'
                        : '1px solid var(--border-medium)',
                      backgroundColor: isSelected
                        ? 'var(--color-lavender-soft)'
                        : 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 10px rgba(113, 87, 232, 0.15)' : 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {/* Radio Indicator */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid var(--color-violet)' : '2px solid var(--border-medium)',
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      flexShrink: 0,
                      transition: 'all var(--transition-fast)'
                    }} />

                    {/* Option Text */}
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--color-violet)' : 'var(--text-main)',
                      lineHeight: 1.4
                    }}>
                      <strong style={{ marginRight: '8px', textTransform: 'uppercase' }}>
                        {opt.id}.
                      </strong>
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Nav Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '20px'
            }}>
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn btn-outline"
                style={{ padding: '10px 18px' }}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {selectedOption ? 'Answer recorded' : 'Select an option to record answer'}
              </div>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="btn btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="btn btn-teal"
                  style={{ padding: '10px 22px' }}
                >
                  <Send size={16} />
                  Review & Submit
                </button>
              )}
            </div>
          </div>

          {/* Right Question Navigator Palette */}
          <div>
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              savedResponses={responses}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
            />
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => !submitting && setShowSubmitModal(false)}
        title="Submit Examination"
      >
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Please review your completion status before confirming submission. Once submitted, your answers are finalized and graded on the server.
          </p>

          {/* Summary Box */}
          <div style={{
            backgroundColor: 'var(--bg-page)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Questions:</span>
              <strong style={{ color: 'var(--text-main)' }}>{totalQuestions}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Answered:</span>
              <strong style={{ color: 'var(--color-teal)' }}>{totalAnswered}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Unanswered:</span>
              <strong style={{ color: unansweredCount > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                {unansweredCount}
              </strong>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-amber-soft)',
              color: '#8a5c0b',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                You have <strong>{unansweredCount} unanswered questions</strong>. You can return to answer them before submitting.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => setShowSubmitModal(false)}
            disabled={submitting}
            className="btn btn-outline"
          >
            Return to Questions
          </button>
          <button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="btn btn-teal"
          >
            {submitting ? 'Grading & Submitting...' : 'Confirm Final Submission'}
          </button>
        </div>
      </Modal>

      {/* Auto-submission modal when time runs out */}
      <Modal
        isOpen={autoSubmitting}
        title="Time Expired!"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Clock size={48} color="var(--color-error)" style={{ margin: '0 auto 16px auto' }} />
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
            Examination Deadline Reached
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Your allotted time has concluded. The server is auto-finalizing and grading your responses...
          </p>
        </div>
      </Modal>
    </div>
  );
}
