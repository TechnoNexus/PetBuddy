import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Divider, Stack, Snackbar, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const SignUp = () => {
  const navigate = useNavigate();
  const { user, signup } = useAuth();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: ''
  });

  // Auto-redirect if already logged in (e.g. after Google OAuth redirect)
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      setOpenSnackbar(true);
      setTimeout(() => navigate('/'), 2000);
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
          Create Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField required name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <TextField required name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <TextField required type="email" name="email" label="Email" value={formData.email} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <TextField required type="password" name="password" label="Password" value={formData.password} onChange={handleChange} helperText="Password must be at least 8 characters" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <TextField required type="password" name="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }} disableElevation>
              {loading ? 'Creating...' : 'Sign Up'}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 4 }}>OR</Divider>

        <Stack spacing={2}>
          <Button variant="outlined" startIcon={<GoogleIcon sx={{ color: '#DB4437' }} />} onClick={() => handleOAuthLogin('google')} fullWidth sx={{ borderRadius: '12px', py: 1.5, borderColor: '#e2e8f0', color: '#1e293b', bgcolor: '#fff', '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' } }}>
            Continue with Google
          </Button>
          <Button variant="contained" startIcon={<FacebookIcon />} onClick={() => handleOAuthLogin('facebook')} fullWidth sx={{ borderRadius: '12px', py: 1.5, bgcolor: '#1877F2', color: '#fff', '&:hover': { bgcolor: '#166fe5' }, boxShadow: 'none' }}>
            Continue with Facebook
          </Button>
        </Stack>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" variant="filled">Account created successfully! Redirecting to login...</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Snackbar>
    </Container>
  );
};

export default SignUp;
