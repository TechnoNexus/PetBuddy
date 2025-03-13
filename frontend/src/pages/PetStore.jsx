import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  Box,
  IconButton,
  Badge
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Cart from '../components/Cart';

const PetStore = () => {
  const [category, setCategory] = useState('food');
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };

  const products = {
    food: [
      {
        id: 1,
        name: "Premium Dog Food",
        price: 29.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119",
        description: "High-quality nutrition for adult dogs"
      },
      {
        id: 2,
        name: "Cat Food - Salmon",
        price: 24.99,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1571566882372-1598d88abd90",
        description: "Wild-caught salmon recipe"
      }
    ],
    clothes: [
      {
        id: 3,
        name: "Winter Dog Jacket",
        price: 34.99,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1576578985983-0b5d0e44f521",
        description: "Warm and waterproof"
      },
      {
        id: 4,
        name: "Cat Sweater",
        price: 19.99,
        rating: 4.0,
        image: "https://images.unsplash.com/photo-1636654129379-e7ae6f30c6c0",
        description: "Soft and comfortable"
      }
    ],
    accessories: [
      {
        id: 5,
        name: "Leather Collar",
        price: 15.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1599233068953-7f75bbd6c8c7",
        description: "Genuine leather, durable"
      },
      {
        id: 6,
        name: "Interactive Toy",
        price: 12.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1577347209434-357d19994646",
        description: "Keeps pets entertained"
      }
    ]
  };

return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">
          Pet Store
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setCartOpen(true)}
        >
          <Badge badgeContent={cartItems.length} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Box>

      <Cart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <Tabs
        value={category}
        onChange={(e, newValue) => setCategory(newValue)}
        sx={{ mb: 4 }}
      >
        <Tab label="Food" value="food" />
        <Tab label="Clothes" value="clothes" />
        <Tab label="Accessories" value="accessories" />
      </Tabs>

      <Grid container spacing={4}>
        {products[category].map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={product.rating} precision={0.1} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({product.rating})
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${product.price}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PetStore;