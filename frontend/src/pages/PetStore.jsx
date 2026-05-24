import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Tabs, Tab, Card, CardMedia, CardContent, CardActions, Button, Rating, Box, IconButton, Badge, Paper
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
        return prevItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  const handleCheckout = () => navigate('/checkout', { state: { cartItems } });

  const products = {
    food: [
      { id: 1, name: "Premium Dog Food", price: 29.99, rating: 4.5, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119", description: "High-quality nutrition for adult dogs" },
      { id: 2, name: "Cat Food - Salmon", price: 24.99, rating: 4.8, image: "https://images.unsplash.com/photo-1571566882372-1598d88abd90", description: "Wild-caught salmon recipe" }
    ],
    clothes: [
      { id: 3, name: "Winter Dog Jacket", price: 34.99, rating: 4.3, image: "https://images.unsplash.com/photo-1576578985983-0b5d0e44f521", description: "Warm and waterproof" },
      { id: 4, name: "Cat Sweater", price: 19.99, rating: 4.0, image: "https://images.unsplash.com/photo-1636654129379-e7ae6f30c6c0", description: "Soft and comfortable" }
    ],
    accessories: [
      { id: 5, name: "Leather Collar", price: 15.99, rating: 4.6, image: "https://images.unsplash.com/photo-1599233068953-7f75bbd6c8c7", description: "Genuine leather, durable" },
      { id: 6, name: "Interactive Toy", price: 12.99, rating: 4.7, image: "https://images.unsplash.com/photo-1577347209434-357d19994646", description: "Keeps pets entertained" }
    ]
  };

  return (
    <Box className="animate-fade-in" sx={{ pb: 8 }}>
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6, mb: 6, borderRadius: '0 0 40px 40px' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
              Pet Store
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Everything your furry friend needs, in one place.
            </Typography>
          </Box>
          <IconButton onClick={() => setCartOpen(true)} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }, width: 64, height: 64, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <Badge badgeContent={cartItems.length} color="primary" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
              <ShoppingCartIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
            </Badge>
          </IconButton>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Cart open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onRemove={handleRemoveFromCart} onCheckout={handleCheckout} />

        <Paper sx={{ mb: 5, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
          <Tabs value={category} onChange={(e, newValue) => setCategory(newValue)} centered variant="fullWidth" sx={{ '& .MuiTab-root': { py: 3, fontWeight: 600, fontSize: '1rem' } }}>
            <Tab label="Food & Treats" value="food" />
            <Tab label="Apparel" value="clothes" />
            <Tab label="Accessories" value="accessories" />
          </Tabs>
        </Paper>

        <Grid container spacing={4}>
          {products[category].map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card className="hover-lift" sx={{ borderRadius: '24px', overflow: 'hidden', border: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia component="img" height="240" image={product.image} alt={product.name} />
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{product.name}</Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>${product.price}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{product.description}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={product.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: 'text.secondary' }}>({product.rating})</Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button size="large" variant="contained" fullWidth onClick={() => handleAddToCart(product)} sx={{ borderRadius: '12px' }} disableElevation>
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PetStore;