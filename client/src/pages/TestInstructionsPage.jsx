import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { Alert } from '../components/Alert.jsx';
import {
  Clock,
  Award,
  HelpCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  FileText
} from 'lucide-react';

export function TestInstructionsPage({ testId, onStartAttempt, onBack }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadInstructions() {
      try {
        setLoading(true);
        const res = await api.tests.getInstructions(testId);
        if (res?.test) {
          setTest(res.test);
        }
      } catch (err) {
        setError(err.message || 'Failed to load test instructions.');
      } finally {
        setLoading(false);
      }
    }
    loadInstructions();
  }, [testId]);

  const handleConfirmStart = async () => {
    setStarting(true);
    try {
      const res = await api.attempts.start(testId);
      if (res?.attempt) {
        onStartAttempt(res.attempt.id);
      }
    } catch (err) {
      setError(err.message || 'Could not start examination attempt.');
      setShowConfirmModal(false);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--color-violet)',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Preparing examination instructions...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <Alert type="error" message={error || 'Test not found'} />
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Return to Tests
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Back Link */}
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '20px'
          }}
        >
          <ArrowLeft size={16} />
          Back to Catalogue
        </button>

        <Alert type="error" message={error} />

        {/* Main Card */}
        <div className="card" style={{ padding: '36px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '24px',
            marginBottom: '28px'
          }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-violet">{test.subject}</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {test.code}
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {test.title}
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {test.description}
              </p>
            </div>
          </div>

          {/* Test Meta Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-violet)', fontSize: '0.8125rem', fontWeight: 600 }}>
                <Clock size={16} />
                Duration
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                {test.durationMinutes} Minutes
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-teal)', fontSize: '0.8125rem', fontWeight: 600 }}>
                <HelpCircle size={16} />
                Questions
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                {test.questionCount} MCQs
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-amber)', fontSize: '0.8125rem', fontWeight: 600 }}>
                <Award size={16} />
                Total Marks
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                {test.totalMarks} Marks
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-indigo)', fontSize: '0.8125rem', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                Passing Score
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                {test.passMarks ? `${test.passMarks} Marks` : '50%'}
              </div>
            </div>
          </div>

          {/* Instructions List */}
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--color-violet)" />
              Candidate Instructions & Guidelines
            </h3>

            <div style={{
              backgroundColor: 'var(--bg-page)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '20px 24px'
            }}>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {test.instructions?.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
                <li><strong>Authoritative Countdown:</strong> The examination deadline is locked on the server. Navigating away or refreshing your browser will not pause or extend your allotted time.</li>
                <li><strong>Live Answer Persistence:</strong> Every selected answer choice is saved directly to the database. You can freely jump between questions using the Question Navigator.</li>
                <li><strong>Automatic Submission:</strong> When your timer expires, the server immediately locks the attempt and calculates your official score.</li>
              </ol>
            </div>
          </div>

          {/* Action Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px'
          }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Attempt Limit: {test.completedAttemptsCount || 0} of {test.attemptLimit} used
            </div>

            {test.hasActiveAttempt ? (
              <button
                onClick={() => onStartAttempt(test.activeAttemptId)}
                className="btn btn-teal"
                style={{ padding: '12px 28px', fontSize: '1rem' }}
              >
                <RotateCcw size={18} />
                Resume Active Examination
              </button>
            ) : test.canStart ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '1rem' }}
              >
                <Play size={18} />
                I Agree & Begin Examination
              </button>
            ) : (
              <div className="badge badge-error" style={{ padding: '8px 14px' }}>
                Attempt Limit Reached
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Examination Start"
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--color-amber-soft)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            color: '#8a5c0b',
            fontSize: '0.875rem',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              The <strong>{test.durationMinutes}-minute official countdown</strong> will begin the moment you click Start.
            </div>
          </div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Ensure you have a stable network connection and adequate time to complete the test. Are you ready to proceed?
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => setShowConfirmModal(false)}
            className="btn btn-outline"
            disabled={starting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmStart}
            disabled={starting}
            className="btn btn-primary"
          >
            {starting ? 'Initializing Attempt...' : 'Start Examination'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
