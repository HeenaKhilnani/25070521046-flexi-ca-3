import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from '../components/Alert.jsx';
import { User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export function RegisterPage({ onNavigate }) {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid college or personal email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(formData);
      onNavigate('dashboard');
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Failed to create student account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--navbar-height))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--bg-page)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '940px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Left Branded Panel */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-midnight) 0%, var(--color-indigo) 100%)',
          color: '#FFFFFF',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 19V5l9 10V5h5v14l-9-10v10H5z" fill="#FFFFFF" />
                </svg>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>NEXTTEST</span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px' }}>
              Join the collegiate digital testing standard.
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, marginBottom: '32px' }}>
              Create your verified student account to access university course assessments, take timed tests, and build an authoritative performance record.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.85)' }}>
                <CheckCircle size={18} color="var(--color-teal)" />
                <span>Instant server-verified results</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.85)' }}>
                <CheckCircle size={18} color="var(--color-teal)" />
                <span>Synchronized authoritative deadline timers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.85)' }}>
                <CheckCircle size={18} color="var(--color-teal)" />
                <span>Comprehensive attempt history & review</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '32px', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            Prepared for collegiate examination & academic assessment.
          </div>
        </div>

        {/* Right Form Panel */}
        <div style={{ padding: '48px 40px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Student Registration
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Enter your student details to register your exam account.
            </p>
          </div>

          <Alert type="error" message={generalError} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: '10px' }}
            >
              {submitting ? 'Creating Student Account...' : 'Register Account'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              style={{ color: 'var(--color-violet)', fontWeight: 700 }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
