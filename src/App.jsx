import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TwoFactorVerify from './pages/TwoFactorVerify';
import ClientDashboard from './pages/ClientDashboard';
import TherapistDashboard from './pages/TherapistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-2fa" element={<TwoFactorVerify />} />

            <Route path="/client/*" element={
              <ProtectedRoute allowedRoles={['CLIENT']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />

            <Route path="/therapist/*" element={
              <ProtectedRoute allowedRoles={['THERAPIST']}>
                <TherapistDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
