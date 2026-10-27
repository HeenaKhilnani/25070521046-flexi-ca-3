import React from 'react';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-midnight)',
      color: 'rgba(255, 255, 255, 0.65)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '40px 0 30px 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em'
              }}>
                NEXTEST
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                backgroundColor: 'rgba(24, 182, 164, 0.2)',
                color: 'var(--color-teal)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                STUDENT PORTAL
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Prepare. Attempt. Progress. Modern digital examination & evaluation platform.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              color: '#FFFFFF'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-teal)' }} />
              MongoDB Driver (No ODM)
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              color: '#FFFFFF'
            }}>
              Node.js HTTP Server (No Express)
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              color: '#FFFFFF'
            }}>
              React + Vite
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '20px',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.4)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} NEXTEST. Designed for Academic Evaluation & Assessment.
          </div>
          <div>
            Database managed & inspected via MongoDB Compass.
          </div>
        </div>
      </div>
    </footer>
  );
}
