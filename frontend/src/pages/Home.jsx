import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedPets } from '../services/api';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  MenuItem,
  Stack,
  alpha
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({ species: '', location: '' });

  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await getFeaturedPets();
        const petsData = response.data.pets || [];
        const mappedPets = petsData.map(pet => ({
          ...pet,
          image: pet.photos && pet.photos.length > 0 ? pet.photos[0].url : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800",
        }));
        setFeaturedPets(mappedPets);
      } catch (error) {
        console.error('Failed to fetch featured pets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <Box className="animate-fade-in">
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        mb: 8,
        borderRadius: { xs: 0, lg: '0 0 40px 40px' },
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                Find Your Perfect <br/>Furry Companion
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, opacity: 0.9, maxWidth: '500px' }}>
                Adopt, don't shop. Give a loving home to a pet in need and make a friend for life.
              </Typography>

              <Card className="glass-panel" sx={{ p: 3, maxWidth: '500px', borderRadius: '24px', border: 'none' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField select label="Pet Type" value={searchParams.species} onChange={(e) => setSearchParams({...searchParams, species: e.target.value})} fullWidth variant="filled" sx={{ '& .MuiFilledInput-root': { bgcolor: 'white', borderRadius: '12px' }, '& .MuiFilledInput-underline:before': { display: 'none' }, '& .MuiFilledInput-underline:after': { display: 'none' } }}>
                    <MenuItem value="dog">Dogs</MenuItem>
                    <MenuItem value="cat">Cats</MenuItem>
                    <MenuItem value="other">Other Pets</MenuItem>
                  </TextField>
                  <TextField label="Location" value={searchParams.location} onChange={(e) => setSearchParams({...searchParams, location: e.target.value})} fullWidth variant="filled" sx={{ '& .MuiFilledInput-root': { bgcolor: 'white', borderRadius: '12px' }, '& .MuiFilledInput-underline:before': { display: 'none' }, '& .MuiFilledInput-underline:after': { display: 'none' } }} />
                  <Button variant="contained" size="large" onClick={() => navigate('/pets', { state: searchParams })} sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' }, borderRadius: '12px', minWidth: '120px' }} disableElevation>
                    Search
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Pets Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>Featured Pets</Typography>
          <Typography variant="subtitle1" color="text.secondary">Meet our adorable companions waiting for a home</Typography>
        </Box>
        {loading ? (
          <Typography align="center" color="text.secondary">Loading featured pets...</Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredPets.map((pet) => (
              <Grid item key={pet.id} xs={12} sm={6} md={4}>
                <Card className="hover-lift" sx={{ borderRadius: '24px', overflow: 'hidden', border: 'none', cursor: 'pointer' }} onClick={() => navigate(`/pets/${pet.id}`)}>
                  <CardMedia component="img" height="280" image={pet.image} alt={pet.name} />
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{pet.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                      {pet.breed || pet.species} • {pet.age} yrs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Info Sections */}
      <Box sx={{ background: 'linear-gradient(to bottom, #ffffff, #f8fafc)', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 3, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#7c3aed', 0.1), color: 'primary.main' }}>
                <FavoriteIcon fontSize="large" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Why Adopt?</Typography>
              <Typography color="text.secondary">Give a loving home to pets in need. Adoption saves lives and creates lasting bonds.</Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 3, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#f43f5e', 0.1), color: 'secondary.main' }}>
                <PetsIcon fontSize="large" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>How It Works</Typography>
              <Typography color="text.secondary">Browse pets, submit an application, meet your potential companion, and welcome them home.</Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 3, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                <SupportAgentIcon fontSize="large" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Support</Typography>
              <Typography color="text.secondary">Get guidance on pet care, training tips, and post-adoption support from our community.</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
