import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from '../components/Alert.jsx';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
        maxWidth: '460px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 36px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-indigo) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(113, 87, 232, 0.35)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 19V5l9 10V5h5v14l-9-10v10H5z" fill="#FFFFFF" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Student Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Access your online assessments and results
          </p>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit}>
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
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '10px' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px'
        }}>
          New to NEXTEST?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ color: 'var(--color-violet)', fontWeight: 700 }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
