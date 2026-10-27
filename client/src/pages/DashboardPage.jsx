import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatCard } from '../components/StatCard.jsx';
import { ScoreRing } from '../components/ScoreRing.jsx';
import { Alert } from '../components/Alert.jsx';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Play,
  RotateCcw,
  Award,
  Sparkles
} from 'lucide-react';

export function DashboardPage({ onNavigate, onSelectTest, onSelectAttempt }) {
  const { student } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.attempts.getDashboard();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--color-violet)',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Loading student metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || { availableCount: 0, upcomingCount: 0, completedCount: 0, avgScore: 0 };
  const featured = data?.featuredTest;
  const recentAttempts = data?.recentAttempts || [];
  const upcomingTests = data?.upcomingTests || [];
  const activeAttempt = data?.activeAttempt;

  return (
    <div style={{ padding: '40px 0 60px 0' }}>
      <div className="container">
        {/* Personalized Welcome Banner */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-violet)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '4px'
            }}>
              <Sparkles size={16} />
              Collegiate Assessment Portal
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Welcome back, {student?.name || 'Student'}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track your scheduled examinations, active attempts, and academic progress.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onNavigate('available')}
              className="btn btn-primary"
            >
              <BookOpen size={16} />
              Browse Tests
            </button>
          </div>
        </div>

        <Alert type="error" message={error} />

        {/* Active In-Progress Attempt Banner */}
        {activeAttempt && (
          <div style={{
            background: 'linear-gradient(90deg, #11152B 0%, #252A5A 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(24, 182, 164, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(24, 182, 164, 0.2)',
                color: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <RotateCcw size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Examination in Progress
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {activeAttempt.testTitle}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Your answers are saved. Resume before the official deadline.
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectAttempt(activeAttempt.attemptId)}
              className="btn btn-teal"
              style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
            >
              <RotateCcw size={18} />
              Resume Active Test Now
            </button>
          </div>
        )}

        {/* Top 4 Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <StatCard
            title="Available Tests"
            value={stats.availableCount}
            subtitle="Ready to attempt now"
            icon={BookOpen}
            color="violet"
          />
          <StatCard
            title="Upcoming Tests"
            value={stats.upcomingCount}
            subtitle="Scheduled by department"
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Completed Attempts"
            value={stats.completedCount}
            subtitle="Graded & recorded"
            icon={CheckCircle}
            color="teal"
          />
          <StatCard
            title="Average Score"
            value={stats.completedCount > 0 ? `${stats.avgScore}%` : 'N/A'}
            subtitle={stats.completedCount > 0 ? `${stats.passedCount} tests passed` : 'No attempts yet'}
            icon={TrendingUp}
            color="navy"
          />
        </div>

        {/* Featured Test & Progress Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Featured Available Test */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <span className="badge badge-violet">Featured Assessment</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {featured ? featured.code : 'EXAM-PORTAL'}
                </span>
              </div>

              {featured ? (
                <>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {featured.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    {featured.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="var(--color-violet)" />
                      <span>{featured.durationMinutes} mins</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={16} color="var(--color-amber)" />
                      <span>{featured.totalMarks} Marks</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  No new assessments currently featured.
                </div>
              )}
            </div>

            {featured && (
              <button
                onClick={() => onSelectTest(featured.id)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <Play size={16} />
                Start This Assessment
              </button>
            )}
          </div>

          {/* Academic Accuracy Ring */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px', width: '100%', textAlign: 'left' }}>
              Academic Performance
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '24px', width: '100%', textAlign: 'left' }}>
              Based on official server-graded attempts
            </p>

            <div style={{ margin: '10px 0 20px 0' }}>
              <ScoreRing
                percentage={stats.avgScore || 0}
                size={160}
                passed={stats.avgScore >= 50 || stats.completedCount === 0}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '24px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px',
              width: '100%',
              justifyContent: 'space-around',
              fontSize: '0.8125rem'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Exams Passed</div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-teal)' }}>
                  {stats.passedCount}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Total Attempts</div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)' }}>
                  {stats.completedCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Upcoming Tests & Recent Attempts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Upcoming Tests Widget */}
          <div className="card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Upcoming Schedule
              </h3>
              <button
                onClick={() => onNavigate('upcoming')}
                style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-violet)' }}
              >
                View All
              </button>
            </div>

            {upcomingTests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No scheduled examinations at this moment.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingTests.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Opens: {new Date(t.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className="badge badge-amber">Locked</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Attempts Widget */}
          <div className="card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Recent Attempts
              </h3>
              <button
                onClick={() => onNavigate('history')}
                style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-violet)' }}
              >
                Full History
              </button>
            </div>

            {recentAttempts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <p>You haven't completed any assessments yet.</p>
                <button
                  onClick={() => onNavigate('available')}
                  className="btn btn-secondary"
                  style={{ marginTop: '12px', fontSize: '0.8125rem' }}
                >
                  Start Your First Test
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentAttempts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAttempt(a.id)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    className="card-interactive"
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {a.testTitle}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Score: {a.score} / {a.totalMarks} ({a.percentage}%)
                      </div>
                    </div>
                    <span className={`badge ${a.passed ? 'badge-teal' : 'badge-error'}`}>
                      {a.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
