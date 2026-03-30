import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { logout, setCredentials } from '../store/authSlice';
import { authApi } from '../api/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await authApi.refreshToken(refreshToken);
      dispatch(
        setCredentials({
          token: res.access_token,
          user: res.user,
          refreshToken: res.refresh_token,
        })
      );
      return true;
    } catch {
      dispatch(logout());
      return false;
    }
  };

  const hasRole = (role: string) => user?.role === role;
  const isStudent = () => hasRole('student');
  const isAdmin = () => hasRole('institute_admin');
  const isSuperAdmin = () => hasRole('super_admin');

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    handleLogout,
    refreshSession,
    hasRole,
    isStudent,
    isAdmin,
    isSuperAdmin,
  };
};
