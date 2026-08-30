import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleRoute } from './components/shared/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { TeamPage } from './pages/TeamPage';
import { LeaveApprovalsPage } from './pages/LeaveApprovalsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { NotificationsPage } from './pages/NotificationsPage';

import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#191c1d',
            border: '1px solid #c7c4d8',
            fontSize: '12px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(25, 28, 29, 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#00684a',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ba1a1a',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/employees" element={<Navigate to="/app/admin/employees" replace />} />
              <Route path="/attendance" element={<Navigate to="/app/attendance" replace />} />
              <Route path="/leaves" element={<Navigate to="/app/leaves" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

              <Route path="/app/dashboard" element={<DashboardPage />} />
              <Route path="/app/attendance" element={<AttendancePage />} />
              <Route path="/app/leaves" element={<LeavePage />} />
              <Route path="/app/leaves/:id" element={<LeavePage />} />
              <Route path="/app/profile" element={<ProfilePage />} />
              <Route path="/app/notifications" element={<NotificationsPage />} />
              <Route path="/app/settings" element={<SettingsPage />} />

              <Route
                path="/app/team"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <TeamPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/team/attendance"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <TeamPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/leave-approvals"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <LeaveApprovalsPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/app/admin"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/admin/employees"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <EmployeesPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/admin/employees/:id"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <EmployeesPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/admin/attendance"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <AttendancePage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/admin/leaves"
                element={
                  <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <LeaveApprovalsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/app/admin/departments"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <DepartmentsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AuditLogsPage />
                  </RoleRoute>
                }
              />
            </Route>
          </Route>

          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

