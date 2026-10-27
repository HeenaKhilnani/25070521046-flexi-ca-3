import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { TestCard } from '../components/TestCard.jsx';
import { Alert } from '../components/Alert.jsx';
import { Search, BookOpen, Filter } from 'lucide-react';

export function AvailableTestsPage({ onSelectTest, onSelectAttempt, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const res = await api.tests.getAvailable();
        if (res?.tests) {
          setTests(res.tests);
        }
      } catch (err) {
        setError(err.message || 'Failed to load available tests.');
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const categories = ['All', 'Data Structures', 'Database Systems', 'Programming Fundamentals'];

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAction = (actionType, test) => {
    if (actionType === 'instructions') {
      onSelectTest(test.id);
    } else if (actionType === 'resume') {
      if (test.userStatus?.activeAttemptId) {
        onSelectAttempt(test.userStatus.activeAttemptId);
      } else {
        onSelectTest(test.id);
      }
    } else if (actionType === 'result') {
      if (test.userStatus?.completedAttemptId) {
        onSelectAttempt(test.userStatus.completedAttemptId, true);
      }
    }
  };

  return (
    <div style={{ padding: '40px 0 60px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-violet)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <BookOpen size={16} />
            Assessment Catalogue
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Available Assessments
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Eligible examinations open for immediate attempt. Your responses are saved in real-time.
          </p>
        </div>

        <Alert type="error" message={error} />

        {/* Search & Category Filter Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by test title or code (e.g. DS-201)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px' }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === cat ? 'var(--color-violet)' : 'var(--bg-page)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--color-violet)' : 'var(--border-subtle)'}`,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-medium)',
              borderTopColor: 'var(--color-violet)',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading examinations...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              No tests match your filter
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '0.875rem' }}>
              Try adjusting your search terms or clearing the category filter to see available assessments.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
