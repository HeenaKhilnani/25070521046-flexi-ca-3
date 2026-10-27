import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { BookOpen, Calendar, CheckSquare, User, LogOut, Menu, X } from 'lucide-react';

export function Navbar({ activePage, setActivePage }) {
  const { student, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      backgroundColor: 'var(--color-midnight)',
      color: 'var(--text-inverse)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--navbar-height)'
      }}>
        {/* Brand Wordmark & Geometric Logo */}
        <div
          onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-indigo) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(113, 87, 232, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 19V5l9 10V5h5v14l-9-10v10H5z" fill="#FFFFFF" />
              <circle cx="19" cy="5" r="2.5" fill="var(--color-teal)" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #FFFFFF 0%, var(--color-lavender) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                NEXTEST
              </span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'rgba(24, 182, 164, 0.15)',
                color: 'var(--color-teal)',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.04em'
              }}>
                STUDENT
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
              Prepare. Attempt. Progress.
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleNav('dashboard')}
              style={{
                color: activePage === 'dashboard' ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: activePage === 'dashboard' ? 700 : 500,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activePage === 'dashboard' ? 'rgba(24, 182, 164, 0.12)' : 'transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNav('available')}
              style={{
                color: activePage === 'available' ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: activePage === 'available' ? 700 : 500,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activePage === 'available' ? 'rgba(24, 182, 164, 0.12)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BookOpen size={16} />
              Available Tests
            </button>
            <button
              onClick={() => handleNav('upcoming')}
              style={{
                color: activePage === 'upcoming' ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: activePage === 'upcoming' ? 700 : 500,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activePage === 'upcoming' ? 'rgba(24, 182, 164, 0.12)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={16} />
              Upcoming Tests
            </button>
            <button
              onClick={() => handleNav('history')}
              style={{
                color: activePage === 'history' ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: activePage === 'history' ? 700 : 500,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activePage === 'history' ? 'rgba(24, 182, 164, 0.12)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckSquare size={16} />
              My History
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => handleNav('landing')}
              style={{
                color: activePage === 'landing' ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: 500
              }}
            >
              Overview
            </button>
          </div>
        )}

        {/* User Actions / Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={() => handleNav('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                title="View Profile"
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-violet)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem'
                }}>
                  {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {student?.name?.split(' ')[0] || 'Student'}
                </span>
              </div>
              <button
                onClick={logout}
                style={{
                  color: 'rgba(255, 255, 255, 0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)'
                }}
                title="Sign out of account"
              >
                <LogOut size={16} />
                <span className="hide-mobile">Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => handleNav('login')}
                className="btn btn-outline"
                style={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '8px 16px',
                  fontSize: '0.875rem'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="btn btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.875rem'
                }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
