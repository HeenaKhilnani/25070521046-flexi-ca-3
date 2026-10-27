import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Clock, Award, BarChart3, Database } from 'lucide-react';

export function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, var(--color-midnight) 0%, var(--color-indigo) 100%)',
        color: '#FFFFFF',
        padding: '72px 0 96px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(113, 87, 232, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-80px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(24, 182, 164, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Tagline Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--color-lavender)',
            marginBottom: '24px',
            letterSpacing: '0.04em'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-teal)' }} />
            PREPARE. ATTEMPT. PROGRESS.
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '850px',
            margin: '0 auto 20px auto'
          }}>
            Your next achievement <br />
            <span style={{
              background: 'linear-gradient(90deg, #FFFFFF 20%, var(--color-lavender) 60%, var(--color-teal) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              starts right here.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            NEXTEST is a modern collegiate examination portal featuring server-authoritative
            countdown timing, auto-saving responses, instant evaluation, and detailed progress analytics.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '64px'
          }}>
            <button
              onClick={() => onNavigate('register')}
              className="btn btn-primary"
              style={{
                fontSize: '1.0625rem',
                padding: '14px 28px',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Get Started Now
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="btn btn-outline"
              style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                fontSize: '1.0625rem',
                padding: '14px 28px',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Sign In to Account
            </button>
          </div>

          {/* Interactive UI Dashboard Preview Illustration (Real React/CSS component) */}
          <div style={{
            maxWidth: '920px',
            margin: '0 auto',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            color: 'var(--text-main)',
            textAlign: 'left'
          }}>
            {/* Window bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '18px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}>
                NEXTEST Student Examination Suite
              </div>
              <span className="badge badge-teal">Live Preview</span>
            </div>

            {/* Dashboard Mock Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FEATURED ASSESSMENT</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, margin: '6px 0 4px 0' }}>Data Structures & Algorithms</div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>25 Mins</span> • <span>30 Marks</span> • <span>Available Now</span>
                </div>
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-violet)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'inline-block'
                }}>
                  Start Assessment →
                </div>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'conic-gradient(var(--color-teal) 0% 88%, var(--color-teal-soft) 88% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    color: 'var(--color-teal)'
                  }}>
                    88%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OVERALL PROGRESS</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pass Rate: 100%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real MongoDB Persistent Records</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Designed for Collegiate Excellence
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              A distraction-free, reliable examination environment tailored specifically for university students.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
            {/* Step 1 */}
            <div className="card">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-lavender-soft)',
                color: 'var(--color-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>
                1. Authoritative Timed Tests
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Deadlines and attempt start times are calculated and enforced directly on the Node.js server. Page refreshes never reset the clock.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-teal-soft)',
                color: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>
                2. Real-Time Answer Autosave
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every option selected is persisted immediately to MongoDB. Jump between questions freely without fear of losing progress.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-amber-soft)',
                color: '#b2750e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>
                3. Instant Server-Side Results
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Correct answers are stored securely on the backend. Upon submission, official scores, pass/fail status, and explanations are calculated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* College Technology Architecture Note */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-page)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{
            maxWidth: '820px',
            margin: '0 auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(37, 42, 90, 0.08)',
                color: 'var(--color-indigo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Database size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Strict Engineering Compliance
              </h3>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              NEXTEST is engineered strictly to collegiate specifications: plain Node.js HTTP server without Express,
              direct MongoDB driver without Mongoose, and persistence inspected directly via MongoDB Compass.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-teal">MongoDB Compass Compatible</span>
              <span className="badge badge-violet">Node.js Built-In HTTP</span>
              <span className="badge badge-neutral">React 18 & Vite</span>
              <span className="badge badge-amber">Secure Bcrypt Hashing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
