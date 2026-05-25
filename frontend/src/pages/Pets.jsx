import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPets } from '../services/api';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import PetCard from '../components/PetCard';

const Pets = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ species: '', breed: '', age: '', location: '' });

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await getPets();
        // Extract pets array from response (PetListResponse schema)
        const petsData = response.data.pets || [];
        
        // Map over them to ensure image structure is handled correctly if needed by PetCard
        const mappedPets = petsData.map(pet => ({
          ...pet,
          image: pet.photos && pet.photos.length > 0 ? pet.photos[0].url : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800",
        }));
        
        setPets(mappedPets);
      } catch (error) {
        console.log('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet => {
    return (
      (!filters.species || pet.species.toLowerCase() === filters.species.toLowerCase()) &&
      (!filters.breed || pet.breed.toLowerCase().includes(filters.breed.toLowerCase())) &&
      (!filters.age || pet.age.toString() === filters.age) &&
      (!filters.location || pet.location?.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const clearFilters = () => {
    setFilters({ species: '', breed: '', age: '', location: '' });
  };

  return (
    <Box className="animate-fade-in" sx={{ pb: 8 }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mb: 6, borderRadius: '0 0 40px 40px', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
            Our Lovable Pets
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            Use the filters below to find the perfect companion for your home and lifestyle.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Filters Section */}
        <Paper className="glass-panel" sx={{ p: 4, mb: 6, borderRadius: '24px', border: 'none' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Species</InputLabel>
                <Select name="species" value={filters.species} label="Species" onChange={handleFilterChange} sx={{ borderRadius: '12px' }}>
                  <MenuItem value="dog">Dogs</MenuItem>
                  <MenuItem value="cat">Cats</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Breed" name="breed" value={filters.breed} onChange={handleFilterChange} InputProps={{ sx: { borderRadius: '12px' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Age Range</InputLabel>
                <Select name="age" value={filters.age} label="Age Range" onChange={handleFilterChange} sx={{ borderRadius: '12px' }}>
                  <MenuItem value="1">1 year</MenuItem>
                  <MenuItem value="2">2 years</MenuItem>
                  <MenuItem value="3">3 years</MenuItem>
                  <MenuItem value="4">4+ years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Location" name="location" value={filters.location} onChange={handleFilterChange} InputProps={{ sx: { borderRadius: '12px' } }} />
            </Grid>
          </Grid>

          {/* Active Filters */}
          <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <Chip key={key} label={`${key}: ${value}`} onDelete={() => setFilters(prev => ({ ...prev, [key]: '' }))} sx={{ fontWeight: 500, borderRadius: '8px' }} color="primary" variant="outlined" />
              )
            ))}
            {Object.values(filters).some(Boolean) && (
              <Chip label="Clear All" onClick={clearFilters} color="secondary" sx={{ fontWeight: 500, borderRadius: '8px' }} />
            )}
          </Stack>
        </Paper>

        {/* Pet Cards Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">Loading pets...</Typography>
          </Box>
        ) : filteredPets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" color="text.secondary">No pets found matching your criteria.</Typography>
            <Button variant="text" onClick={clearFilters} sx={{ mt: 2 }}>Clear Filters</Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredPets.map((pet) => (
              <Grid item key={pet.id} xs={12} sm={6} md={4}>
                <PetCard pet={pet} onViewDetails={() => navigate(`/pets/${pet.id}`)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Pets;