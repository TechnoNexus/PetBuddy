import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId, orderDetails } = state;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Order Successful!
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Order ID: {orderId}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" paragraph>
          Thank you for your purchase! We'll send you a confirmation email shortly.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" href="/store" sx={{ mr: 2 }}>
            Continue Shopping
          </Button>
          <Button
  variant="outlined"
  onClick={() => {
    sessionStorage.setItem('activeProfileTab', '2');
    navigate('/profile');
  }}
>
  View Orders
</Button>

        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccess;
