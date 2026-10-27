import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Alert } from '../components/Alert.jsx';
import { User, Mail, Calendar, Edit2, Check, LogOut, Award, TrendingUp } from 'lucide-react';

export function ProfilePage({ onNavigate }) {
  const { student, logout, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Edit name state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student?.name || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.students.getProfile();
        if (res?.profile) {
          setProfileData(res.profile);
          setEditName(res.profile.name);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile(editName.trim());
      setProfileData((prev) => ({ ...prev, name: editName.trim() }));
      setIsEditing(false);
      setSuccess('Profile name updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update name.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  const stats = profileData?.stats || { totalAttempts: 0, avgPercentage: 0, passedCount: 0 };

  return (
    <div style={{ padding: '40px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Student Profile & Settings
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage your student credentials and view your academic record.
          </p>
        </div>

        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        {/* Profile Identity Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            paddingBottom: '28px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '28px'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-violet)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(113, 87, 232, 0.35)',
              flexShrink: 0
            }}>
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'S'}
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              {isEditing ? (
                <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '280px', padding: '8px 12px' }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                  >
                    <Check size={16} />
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setEditName(profileData?.name || ''); }}
                    className="btn btn-outline"
                    style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {profileData?.name || student?.name}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      color: 'var(--color-violet)',
                      padding: '4px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    title="Edit Name"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                <Mail size={15} />
                <span>{profileData?.email || student?.email}</span>
              </div>
            </div>

            <span className="badge badge-teal">Verified Student</span>
          </div>

          {/* Account Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Account Created
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Active'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Assessment Storage
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                MongoDB Persistent Collection
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Session Authentication
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                Secure HTTP-Only Cookie
              </div>
            </div>
          </div>
        </div>

        {/* Academic Performance Summary */}
        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px' }}>
            Academic Performance Summary
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {stats.totalAttempts}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                Tests Completed
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-teal)' }}>
                {stats.passedCount}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                Passed Examinations
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-page)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-violet)' }}>
                {stats.avgPercentage}%
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                Average Percentage
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Card */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ color: 'var(--color-error)', borderColor: 'rgba(217, 72, 95, 0.3)' }}
          >
            <LogOut size={16} />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
