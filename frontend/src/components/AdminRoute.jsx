import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Box, CircularProgress } from '@mui/material';

/**
 * Wraps a route and only renders children if the current
 * Supabase user has role = 'admin' in the profiles table.
 * Otherwise redirects to /admin/login.
 */
export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'admin' | 'denied'

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) setStatus('denied');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!cancelled) {
        setStatus(profile?.role === 'admin' ? 'admin' : 'denied');
      }
    };

    check();
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#7c3aed' }} />
      </Box>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
