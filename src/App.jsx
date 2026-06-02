import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useStore from './store/useStore';
import Layout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import PerformanceAnalysis from './pages/PerformanceAnalysis/PerformanceAnalysis';
import StudyPlanner from './pages/StudyPlanner/StudyPlanner';
import ProgressTracking from './pages/ProgressTracking/ProgressTracking';
import Settings from './pages/Settings/Settings';

// Full-screen loader shown while Zustand Persist reads from localStorage.
// Uses only inline CSS so it can never be affected by LoginPage.css global overrides.
function HydrationLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '4px solid #cdd2da',
          borderTopColor: '#0066ff',
          animation: 'sapas-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes sapas-spin { to { transform: rotate(360deg); } }`}</style>
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: '#44474e',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        Loading SAPAS…
      </p>
    </div>
  );
}

/**
 * useHasHydrated — uses Zustand's own persist middleware API instead of a
 * custom _hasHydrated field in state. This is more reliable because:
 *  1. It doesn't depend on onRehydrateStorage order.
 *  2. It reads from the middleware directly, not from serialised/deserialised state.
 *  3. The lazy initialiser checks synchronously so there's no unnecessary flash.
 */
function useHasHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());

  useEffect(() => {
    // Already hydrated by the time the effect runs (common case after first visit)
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    // Subscribe to the completion event for the rare case where hydration is still pending
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}

/**
 * ProtectedRoute — blocks rendering until both:
 *  1. Zustand persist has finished reading from localStorage (hydrated)
 *  2. isAuthenticated is confirmed true
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const hydrated = useHasHydrated();

  if (!hydrated) return <HydrationLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

/**
 * PublicRouteInner — uses a DEFERRED redirect via useEffect+useNavigate instead of
 * a synchronous <Navigate> render. This is critical: if PublicRoute uses <Navigate>
 * synchronously when isAuthenticated flips true, React renders the Dashboard in the
 * SAME render pass as the state change — before the store has fully committed. The
 * deferred navigate fires AFTER that render pass completes, so the Dashboard always
 * mounts with stable, fully-committed Zustand state.
 */
function PublicRouteInner({ children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const hydrated = useHasHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated) return <HydrationLoader />;
  // While the deferred navigate is pending, return null (avoid rendering login page flash)
  if (isAuthenticated) return null;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRouteInner><LandingPage /></PublicRouteInner>} />
        <Route path="/login" element={<PublicRouteInner><LoginPage /></PublicRouteInner>} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<PerformanceAnalysis />} />
          <Route path="planner" element={<StudyPlanner />} />
          <Route path="progress" element={<ProgressTracking />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
