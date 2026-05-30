import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import { Box, CircularProgress } from '@mui/material';

/**
 * Wraps a route and only renders children if the current
 * user has role = 'admin' in the backend app_users table.
 * Otherwise redirects to the home page for login.
 */
export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'admin' | 'denied'

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (authLoading) return;
      
      if (!user) {
        if (!cancelled) setStatus('denied');
        return;
      }
      
      try {
        const { data: profile } = await getMyProfile();
        if (!cancelled) {
          setStatus(profile?.role === 'admin' ? 'admin' : 'denied');
        }
      } catch (err) {
        if (!cancelled) setStatus('denied');
      }
    };

    check();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  if (status === 'loading' || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#7c3aed' }} />
      </Box>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return children;
}
