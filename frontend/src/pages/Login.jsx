import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Divider, Stack, Link, Alert, Snackbar, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  // Auto-redirect if already logged in (e.g. after Google OAuth redirect)
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials.email, credentials.password);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: '24px' }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>
          Welcome Back
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField required type="email" name="email" label="Email" onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <TextField required type="password" name="password" label="Password" onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }} disableElevation>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
            <Box textAlign="center" mt={1}>
              <Link component={RouterLink} to="/forgot-password" sx={{ fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                Forgot Password?
              </Link>
            </Box>
          </Stack>
        </form>

        <Divider sx={{ my: 4 }}>OR</Divider>

        <Stack spacing={2}>
          <Button variant="outlined" startIcon={<GoogleIcon sx={{ color: '#DB4437' }} />} fullWidth onClick={() => handleOAuthLogin('google')} sx={{ borderRadius: '12px', py: 1.5, borderColor: '#e2e8f0', color: '#1e293b', bgcolor: '#fff', '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' } }}>
            Continue with Google
          </Button>
          <Button variant="contained" startIcon={<FacebookIcon />} fullWidth onClick={() => handleOAuthLogin('facebook')} sx={{ borderRadius: '12px', py: 1.5, bgcolor: '#1877F2', color: '#fff', '&:hover': { bgcolor: '#166fe5' }, boxShadow: 'none' }}>
            Continue with Facebook
          </Button>
        </Stack>

        <Typography align="center" sx={{ mt: 4 }}>
          Don't have an account? <Link component={RouterLink} to="/signup" sx={{ fontWeight: 600 }}>Sign Up</Link>
        </Typography>

        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Login;
