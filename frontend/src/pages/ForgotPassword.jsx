import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Redirect back to the reset password page on this site
      const redirectTo = `${window.location.origin}/reset-password`;
      await resetPassword(email, redirectTo);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={2} textAlign="center">
          Reset Password
        </Typography>
        <Typography color="text.secondary" mb={4} textAlign="center">
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </form>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2">
            Remembered your password? <Link to="/" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
