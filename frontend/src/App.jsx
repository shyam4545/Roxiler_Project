import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAddUserPage from './pages/admin/AdminAddUserPage';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminAddStorePage from './pages/admin/AdminAddStorePage';

// Normal User Pages
import UserStoresPage from './pages/user/UserStoresPage';
import UserProfilePage from './pages/user/UserProfilePage';

// Store Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Smart root redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>}
          />
          <Route
            path="/admin/users"
            element={<PrivateRoute role="ADMIN"><AdminUsersPage /></PrivateRoute>}
          />
          <Route
            path="/admin/users/new"
            element={<PrivateRoute role="ADMIN"><AdminAddUserPage /></PrivateRoute>}
          />
          <Route
            path="/admin/users/:id"
            element={<PrivateRoute role="ADMIN"><AdminUserDetail /></PrivateRoute>}
          />
          <Route
            path="/admin/stores"
            element={<PrivateRoute role="ADMIN"><AdminStoresPage /></PrivateRoute>}
          />
          <Route
            path="/admin/stores/new"
            element={<PrivateRoute role="ADMIN"><AdminAddStorePage /></PrivateRoute>}
          />

          {/* Normal User */}
          <Route
            path="/user/stores"
            element={<PrivateRoute role="USER"><UserStoresPage /></PrivateRoute>}
          />
          <Route
            path="/user/profile"
            element={<PrivateRoute role="USER"><UserProfilePage /></PrivateRoute>}
          />

          {/* Store Owner */}
          <Route
            path="/owner/dashboard"
            element={<PrivateRoute role="STORE_OWNER"><OwnerDashboard /></PrivateRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
