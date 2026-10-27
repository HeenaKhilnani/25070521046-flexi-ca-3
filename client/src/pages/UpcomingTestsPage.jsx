import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { TestCard } from '../components/TestCard.jsx';
import { Alert } from '../components/Alert.jsx';
import { Calendar, Clock, Lock, Info } from 'lucide-react';

export function UpcomingTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUpcoming() {
      try {
        setLoading(true);
        const res = await api.tests.getUpcoming();
        if (res?.tests) {
          setTests(res.tests);
        }
      } catch (err) {
        setError(err.message || 'Failed to load upcoming tests.');
      } finally {
        setLoading(false);
      }
    }
    loadUpcoming();
  }, []);

  return (
    <div style={{ padding: '40px 0 60px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-amber)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <Calendar size={16} />
            Academic Examination Timetable
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Upcoming Examinations
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Assessments scheduled for future opening. These tests cannot be started before the official start timestamp.
          </p>
        </div>

        {/* Security / Policy Notice */}
        <div style={{
          backgroundColor: 'var(--color-amber-soft)',
          border: '1px solid var(--color-amber)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
          color: '#8a5c0b'
        }}>
          <Lock size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
            <strong>Server-Enforced Access Policy:</strong> Examination engines enforce strict start timestamps on the Node.js backend. Even direct API calls are rejected with HTTP 403 until the opening threshold is reached.
          </div>
        </div>

        <Alert type="error" message={error} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-medium)',
              borderTopColor: 'var(--color-amber)',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading scheduled assessments...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              No upcoming examinations scheduled
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              All current departmental examinations are currently active in the Available Tests tab.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                isUpcoming={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
