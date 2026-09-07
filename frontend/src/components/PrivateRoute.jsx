import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — redirects to /login if not authenticated.
 * If `role` prop is provided, also checks for exact role match.
 */
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on actual role
    const dashboardMap = {
      ADMIN: '/admin/dashboard',
      USER: '/user/stores',
      STORE_OWNER: '/owner/dashboard',
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
};

export default PrivateRoute;
