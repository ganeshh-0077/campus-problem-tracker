import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GalaxyBackground } from './components/GalaxyBackground';

const DashboardRouter: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role === 'Admin') {
    return <AdminDashboard />;
  }
  if (profile?.role === 'Staff') {
    return <StaffDashboard />;
  }
  // Default to Student dashboard
  return <StudentDashboard />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative min-h-screen transition-colors duration-300 overflow-x-hidden">
          {/* Interactive Galaxy & Twinkling Ambient Starfield */}
          <GalaxyBackground />

          {/* Foreground Application Content */}
          <div className="relative z-10">
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Root Role-Based Dashboard */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
