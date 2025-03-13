import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack
} from '@mui/material';
import PetCard from '../components/PetCard';

const Pets = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    species: '',
    breed: '',
    age: '',
    location: ''
  });


  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      age: 2,
      description: "Friendly and energetic dog, great with kids",
      image: "https://via.placeholder.com/300",
      vaccinated: true,
      neutered: true
    },
    {
      id: 2,
      name: "Luna",
      species: "Cat",
      breed: "Siamese",
      age: 1,
      description: "Gentle and loving cat, perfect for a quiet home",
      image:   "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", // Siamese
      vaccinated: true,
      neutered: false
    },
    {
      id: 3,
      name: "Rocky",
      species: "Dog",
      breed: "German Shepherd",
      age: 4,
      description: "Loyal and protective, great guard dog",
      image:   "https://images.unsplash.com/photo-1517849845537-4d257902454a", // Husky
      vaccinated: true,
      neutered: true
    }
  ]);

useEffect(() => {
  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/pets/');
      const data = await response.json();
      // Combine backend pets with existing pets
      const backendPets = data.pets.map(pet => ({
        ...pet,
        image: pet.photos?.[0] || "https://via.placeholder.com/300",
        vaccinated: true,
        neutered: true
      }));
      setPets(prevPets => [...prevPets, ...backendPets]);
    } catch (error) {
      console.log('Error fetching pets:', error);
    }
  };
  fetchPets();
}, []);

  const filteredPets = pets.filter(pet => {
  return (
    (!filters.species || pet.species.toLowerCase() === filters.species.toLowerCase()) &&
    (!filters.breed || pet.breed.toLowerCase().includes(filters.breed.toLowerCase())) &&
    (!filters.age || pet.age.toString() === filters.age) &&
    (!filters.location || pet.location.toLowerCase().includes(filters.location.toLowerCase()))
  );
});


  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      species: '',
      breed: '',
      age: '',
      location: ''
    });
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
        Pet Listings
      </Typography>

      {/* Filters Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Species</InputLabel>
              <Select
                name="species"
                value={filters.species}
                label="Species"
                onChange={handleFilterChange}
              >
                <MenuItem value="dog">Dogs</MenuItem>
                <MenuItem value="cat">Cats</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Breed"
              name="breed"
              value={filters.breed}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Age</InputLabel>
              <Select
                name="age"
                value={filters.age}
                label="Age"
                onChange={handleFilterChange}
              >
                <MenuItem value="puppy">Puppy/Kitten</MenuItem>
                <MenuItem value="young">Young</MenuItem>
                <MenuItem value="adult">Adult</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>

        {/* Active Filters */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {Object.entries(filters).map(([key, value]) => (
            value && (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => {
                  setFilters(prev => ({ ...prev, [key]: '' }));
                }}
              />
            )
          ))}
          {Object.values(filters).some(Boolean) && (
            <Chip
              label="Clear All"
              onClick={clearFilters}
              color="secondary"
            />
          )}
        </Stack>
      </Box>

      {/* Pet Cards Grid */}
      <Grid container spacing={4}>
  {filteredPets.map((pet) => (
    <Grid item key={pet.id} xs={12} sm={6} md={4}>
      <PetCard
        pet={pet}
        onViewDetails={() => navigate(`/pets/${pet.id}`)}
      />
    </Grid>
  ))}
</Grid>
    </Container>
  );
};

export default Pets;