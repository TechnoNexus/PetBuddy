import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
  IconButton,
  Box,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Cart = ({ open, onClose, items, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Shopping Cart
        </Typography>
        <List>
          {items.map((item) => (
            <ListItem key={item.id}>
              <ListItemAvatar>
                <Avatar src={item.image} />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={`$${item.price} x ${item.quantity}`}
              />
              <IconButton onClick={() => onRemove(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">
            Total: ${total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={onCheckout}
            disabled={items.length === 0}
          >
            Checkout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Cart;
