import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientDashboard from './pages/patient/Dashboard';
import ExerciseRoom from './pages/patient/ExerciseRoom';
import HealthLog from './pages/patient/HealthLog';
import Diet from './pages/patient/Diet';
import Chat from './pages/patient/Chat';
import Appointments from './pages/patient/Appointments';
import Profile from './pages/patient/Profile';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Landing from './pages/Landing';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor' : '/dashboard'} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Patient Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/exercise" element={<ProtectedRoute allowedRoles={['patient']}><ExerciseRoom /></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute allowedRoles={['patient']}><HealthLog /></ProtectedRoute>} />
      <Route path="/diet" element={<ProtectedRoute allowedRoles={['patient']}><Diet /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute allowedRoles={['patient']}><Chat /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={['patient', 'doctor']}><Appointments /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
