import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import MembershipPage from './pages/MembershipPage';

const Router = () => {
  const [route, setRoute] = useState(window.location.pathname || '/');
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const handleLocationChange = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', handleLocationChange);
    // Intersection for all link clicks to avoid full page reloads if possible
    // but we'll stick to a simple listener for this project structure
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-neon">LOADING SYSTEM...</div>;

  // Cleanup route from accidental hashes if any still exist
  const currentPath = route.replace('#', '');

  // Redirect authenticated user from landing to dashboard
  if (currentPath === '/' && isAuthenticated) {
    window.history.pushState({}, '', '/dashboard');
    setRoute('/dashboard');
    return null;
  }

  const protectedRoutes = ['/dashboard', '/onboarding', '/plan', '/profile', '/history', '/admin', '/membership'];
  const isProtected = protectedRoutes.some(path => currentPath.startsWith(path));

  if (isProtected && !isAuthenticated) {
    window.history.pushState({}, '', '/login');
    setRoute('/login');
    return null;
  }

  if (currentPath === '/admin' && user?.role !== 'admin') {
    window.history.pushState({}, '', '/dashboard');
    setRoute('/dashboard');
    return null;
  }

  // Prevents admin from accessing user pages
  if (user?.role === 'admin' && ['/dashboard', '/plan', '/history', '/profile', '/onboarding'].includes(currentPath)) {
    window.history.pushState({}, '', '/admin');
    setRoute('/admin');
    return null;
  }

  const renderContent = () => {
    switch (currentPath) {
      case '/login':
        return <AuthPage initialMode="login" />;
      case '/signup':
        return <AuthPage initialMode="signup" />;
      case '/onboarding':
        return <OnboardingPage />;
      case '/dashboard':
        return <DashboardPage />;
      case '/plan':
        return <PlanPage />;
      case '/profile':
        return <ProfilePage />;
      case '/history':
        return <HistoryPage />;
      case '/admin':
        return <AdminDashboard />;
      case '/membership':
        return <MembershipPage />;
      case '/':
      default:
        return <LandingPage />;
    }
  };

  return <Layout>{renderContent()}</Layout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;
