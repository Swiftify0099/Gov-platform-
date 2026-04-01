import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './store';
import { fetchCurrentUser } from './store/authSlice';
import './i18n';

import { Navbar } from './components/common/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/student/DashboardPage';
import { ExamPage } from './pages/student/ExamPage';
import { ResultsPage } from './pages/student/ResultsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading profile...</div>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated]);

  const isExamPage = window.location.pathname.startsWith('/exam/');

  return (
    <BrowserRouter>
      {!isExamPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          isAuthenticated
            ? (user?.role === 'super_admin' ? <Navigate to="/superadmin" />
               : user?.role === 'institute_admin' ? <Navigate to="/admin" />
               : <Navigate to="/dashboard" />)
            : <Navigate to="/login" />
        } />
        <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/exam/:assignmentId" element={<ProtectedRoute roles={['student']}><ExamPage /></ProtectedRoute>} />
        <Route path="/results/:submissionId" element={<ProtectedRoute roles={['student']}><ResultsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['institute_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
