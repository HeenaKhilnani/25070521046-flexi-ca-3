import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { AvailableTestsPage } from './pages/AvailableTestsPage.jsx';
import { UpcomingTestsPage } from './pages/UpcomingTestsPage.jsx';
import { TestInstructionsPage } from './pages/TestInstructionsPage.jsx';
import { TestTakingPage } from './pages/TestTakingPage.jsx';
import { ResultsPage } from './pages/ResultsPage.jsx';
import { AttemptHistoryPage } from './pages/AttemptHistoryPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';

function MainApp() {
  const { student, loading, isAuthenticated } = useAuth();

  // Active page state
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);

  // Sync initial page based on auth state once loaded
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setCurrentPage((prev) => (prev === 'landing' || prev === 'login' || prev === 'register' ? 'dashboard' : prev));
      } else {
        setCurrentPage((prev) => (prev === 'dashboard' || prev === 'instructions' || prev === 'test-taking' || prev === 'results' || prev === 'history' || prev === 'profile' ? 'landing' : prev));
      }
    }
  }, [loading, isAuthenticated]);

  const handleNavigate = (page) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const handleSelectTest = (testId) => {
    setSelectedTestId(testId);
    handleNavigate('instructions');
  };

  const handleStartAttempt = (attemptId) => {
    setSelectedAttemptId(attemptId);
    handleNavigate('test-taking');
  };

  const handleSelectAttempt = (attemptId, viewResult = false) => {
    setSelectedAttemptId(attemptId);
    if (viewResult) {
      handleNavigate('results');
    } else {
      handleNavigate('test-taking');
    }
  };

  const handleTestFinished = (attemptId) => {
    setSelectedAttemptId(attemptId);
    handleNavigate('results');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-midnight)',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(13deg, var(--color-violet) 0%, var(--color-indigo) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 19V5l9 10V5h5v14l-9-10v10H5z" fill="#FFFFFF" />
            </svg>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>NEXTEST</div>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
            Initializing examination portal...
          </div>
        </div>
      </div>
    );
  }

  // During active test taking, we hide the standard navigation to preserve full test focus
  const isTestTakingMode = currentPage === 'test-taking';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isTestTakingMode && (
        <Navbar activePage={currentPage} setActivePage={handleNavigate} />
      )}

      <main style={{ flex: 1 }}>
        {currentPage === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'register' && (
          <RegisterPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onSelectTest={handleSelectTest}
            onSelectAttempt={handleSelectAttempt}
          />
        )}

        {currentPage === 'available' && (
          <AvailableTestsPage
            onSelectTest={handleSelectTest}
            onSelectAttempt={handleSelectAttempt}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'upcoming' && (
          <UpcomingTestsPage />
        )}

        {currentPage === 'instructions' && (
          <TestInstructionsPage
            testId={selectedTestId}
            onStartAttempt={handleStartAttempt}
            onBack={() => handleNavigate('available')}
          />
        )}

        {currentPage === 'test-taking' && (
          <TestTakingPage
            attemptId={selectedAttemptId}
            onFinished={handleTestFinished}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'results' && (
          <ResultsPage
            attemptId={selectedAttemptId}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'history' && (
          <AttemptHistoryPage
            onSelectAttempt={(aId) => handleSelectAttempt(aId, true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}
      </main>

      {!isTestTakingMode && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
