import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/store/verify-session?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    verifySession();
  }, [sessionId]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      {status === 'loading' && (
        <Box>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5">Verifying your payment...</Typography>
        </Box>
      )}
      {status === 'success' && (
        <Box>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>Payment Successful!</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your purchase. Your order has been placed and is being processed.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/store')}>
            Return to Store
          </Button>
        </Box>
      )}
      {status === 'error' && (
        <Box>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>Verification Failed</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We could not verify your payment session. If you have been charged, please contact support.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/store')}>
            Return to Store
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default OrderSuccess;
