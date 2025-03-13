import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

const SignUp = () => {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.detail || 'Signup failed');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  const handleFacebookSignUp = () => {
    window.location.href = 'http://localhost:8000/auth/facebook';
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              required
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              required
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
            <TextField
              required
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              required
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              helperText="Password must be at least 8 characters with uppercase, number, and special character"
            />
            <TextField
              required
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Sign Up
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Stack spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignUp}
            fullWidth
          >
            Continue with Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={handleFacebookSignUp}
            fullWidth
          >
            Continue with Facebook
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">
          Account created successfully! Redirecting to login...
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignUp;
