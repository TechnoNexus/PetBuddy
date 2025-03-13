import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  Link,
  Alert,
  Snackbar
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new URLSearchParams();
  formData.append('username', credentials.email);  // Backend expects 'username'
  formData.append('password', credentials.password);

  try {
    const response = await fetch('http://localhost:8000/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.access_token);
      navigate('/home');
    } else {
      setError(data.detail);
    }
  } catch (error) {
    setError('Network error occurred');
  }
};


  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              required
              type="email"
              name="email"
              label="Email"
              onChange={handleChange}
            />
            <TextField
              required
              type="password"
              name="password"
              label="Password"
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Log In
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Stack spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            fullWidth
          >
            Continue with Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<FacebookIcon />}
            fullWidth
          >
            Continue with Facebook
          </Button>
        </Stack>

        <Typography align="center" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/signup">
            Sign Up
          </Link>
        </Typography>
         <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError('')}
        >
          <Alert severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Login;
