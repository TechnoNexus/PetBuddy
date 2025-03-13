import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack
} from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    species: '',
    location: ''
  });

  const featuredPets = [
    {
      id: 1,
      name: "Luna",
      image: "https://via.placeholder.com/300",
      breed: "Siamese Cat",
      age: 1
    },
    {
      id: 2,
      name: "Max",
      image: "https://via.placeholder.com/300",
      breed: "Golden Retriever",
      age: 2
    },
    {
      id: 3,
      name: "Bella",
      image: "https://via.placeholder.com/300",
      breed: "Persian Cat",
      age: 3
    }
  ];

  const handleSearch = () => {
    navigate('/pets', { state: searchParams });
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Perfect Pet Companion
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Adopt, don't shop. Give a loving home to a pet in need.
          </Typography>

          {/* Search Section */}
          <Card sx={{ p: 3, maxWidth: 'sm' }}>
            <Stack spacing={2}>
              <TextField
                select
                label="Pet Type"
                value={searchParams.species}
                onChange={(e) => setSearchParams({...searchParams, species: e.target.value})}
                fullWidth
              >
                <MenuItem value="dog">Dogs</MenuItem>
                <MenuItem value="cat">Cats</MenuItem>
                <MenuItem value="other">Other Pets</MenuItem>
              </TextField>

              <TextField
                label="Location"
                value={searchParams.location}
                onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                fullWidth
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{ bgcolor: 'secondary.main' }}
              >
                Search Pets
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* Featured Pets Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Featured Pets
        </Typography>
        <Grid container spacing={4}>
          {featuredPets.map((pet) => (
            <Grid item key={pet.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-4px)', transition: '0.3s' }
                }}
                onClick={() => navigate(`/pets/${pet.id}`)}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={pet.image}
                  alt={pet.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {pet.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {pet.breed} • {pet.age} years old
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Info Sections */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom>
                Why Adopt?
              </Typography>
              <Typography>
                Give a loving home to pets in need. Adoption saves lives and creates lasting bonds.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom>
                How It Works
              </Typography>
              <Typography>
                Browse pets, submit an application, meet your potential companion, and welcome them home.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom>
                Support
              </Typography>
              <Typography>
                Get guidance on pet care, training tips, and post-adoption support from our community.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
