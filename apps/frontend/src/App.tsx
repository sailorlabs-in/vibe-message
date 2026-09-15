import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public pages
import { Landing } from './pages/public/Landing';
import { Login } from './pages/public/Login';
import { Signup } from './pages/public/Signup';
import { Docs } from './pages/public/Docs';
import { License } from './pages/public/License';
import { TermsOfService } from './pages/public/TermsOfService';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { ResetPassword } from './pages/public/ResetPassword';
import { VerifyEmail } from './pages/public/VerifyEmail';

// Admin pages
import { Dashboard } from './pages/admin/Dashboard';
import { Apps } from './pages/admin/Apps';
import { AppDetails } from './pages/admin/AppDetails';
import { CronJobs } from './pages/admin/CronJobs';
import Profile from './pages/admin/Profile';
import { Pending } from './pages/admin/Pending';

// Super admin pages
import { Users } from './pages/super/Users';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import Footer from './components/layout/Footer';

const ORIGINAL_DOCS_URL = 'https://vibemessage.sailorlabs.in/docs';
const ORIGINAL_TERMS_URL = 'https://vibemessage.sailorlabs.in/terms-of-service';
const ORIGINAL_LICENSE_URL = 'https://vibemessage.sailorlabs.in/license';

const ExternalDocsRedirect: React.FC = () => {
  React.useEffect(() => {
    window.location.replace(ORIGINAL_DOCS_URL);
  }, []);
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-theme-text-muted">
      Redirecting to documentation...
    </div>
  );
};

const ExternalTermsRedirect: React.FC = () => {
  React.useEffect(() => {
    window.location.replace(ORIGINAL_TERMS_URL);
  }, []);
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-theme-text-muted">
      Redirecting to Terms of Service...
    </div>
  );
};

const ExternalLicenseRedirect: React.FC = () => {
  React.useEffect(() => {
    window.location.replace(ORIGINAL_LICENSE_URL);
  }, []);
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-theme-text-muted">
      Redirecting to License Agreement...
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isSelfHosted } = useSystem();
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedBackground />
      <div className="min-h-screen transition-colors duration-300 pt-[100px] relative z-0 overflow-x-clip w-full max-w-full">
        <Header />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              isSelfHosted ? (
                <Navigate to={user ? '/dashboard' : '/login'} replace />
              ) : (
                <Landing />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/docs"
            element={isSelfHosted ? <ExternalDocsRedirect /> : <Docs />}
          />
          <Route path="/doc" element={<ExternalDocsRedirect />} />
          <Route
            path="/license"
            element={isSelfHosted ? <ExternalLicenseRedirect /> : <License />}
          />
          <Route
            path="/terms-of-service"
            element={isSelfHosted ? <ExternalTermsRedirect /> : <TermsOfService />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected routes */}
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <Pending />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireApproved>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/apps"
            element={
              <ProtectedRoute requireApproved>
                <Apps />
              </ProtectedRoute>
            }
          />

          <Route
            path="/apps/:id"
            element={
              <ProtectedRoute requireApproved>
                <AppDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cron-jobs"
            element={
              <ProtectedRoute requireApproved>
                <CronJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute requireApproved>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Super admin routes */}
          <Route
            path="/super/users"
            element={
              <ProtectedRoute requireApproved>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route
            path="*"
            element={
              <Navigate
                to={isSelfHosted ? (user ? '/dashboard' : '/login') : '/'}
                replace
              />
            }
          />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SystemProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </SystemProvider>
    </ThemeProvider>
  );
};

export default App;
