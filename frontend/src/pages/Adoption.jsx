import { useState, useEffect } from 'react';
import AdoptionForm from '../components/AdoptionForm';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem
} from '@mui/material';

const Adoption = () => {

  const [pets] = useState([
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
      image: "https://via.placeholder.com/300",
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
      image: "https://via.placeholder.com/300",
      vaccinated: true,
      neutered: true
    },
    {
      id: 4,
      name: "Milo",
      species: "Cat",
      breed: "Persian",
      age: 1,
      description: "Playful and affectionate kitten",
      image: "https://via.placeholder.com/300",
      vaccinated: true,
      neutered: false
    }
  ]);

  const [filteredPets, setFilteredPets] = useState(pets);
const [filters, setFilters] = useState({
    species: '',
    age: '',
    breed: ''
});
const [selectedPet, setSelectedPet] = useState(null);
const [isFormOpen, setIsFormOpen] = useState(false);

  const getAgeCategory = (age) => {
    if (age <= 1) return 'puppy';
    if (age <= 3) return 'young';
    return 'adult';
  };

  useEffect(() => {
    const filtered = pets.filter(pet => {
      const matchesSpecies = !filters.species || pet.species === filters.species;
      const matchesBreed = !filters.breed || pet.breed.toLowerCase().includes(filters.breed.toLowerCase());
      const matchesAge = !filters.age || getAgeCategory(pet.age) === filters.age;
      return matchesSpecies && matchesBreed && matchesAge;
    });
    setFilteredPets(filtered);
  }, [filters, pets]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>Adopt a Pet</Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Species"
            value={filters.species}
            onChange={(e) => setFilters({...filters, species: e.target.value})}
          >
            <MenuItem value="">All Species</MenuItem>
            <MenuItem value="Dog">Dogs</MenuItem>
            <MenuItem value="Cat">Cats</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Age"
            value={filters.age}
            onChange={(e) => setFilters({...filters, age: e.target.value})}
          >
            <MenuItem value="">All Ages</MenuItem>
            <MenuItem value="puppy">Puppy/Kitten (0-1 year)</MenuItem>
            <MenuItem value="young">Young (1-3 years)</MenuItem>
            <MenuItem value="adult">Adult (3+ years)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search by Breed"
            value={filters.breed}
            onChange={(e) => setFilters({...filters, breed: e.target.value})}
            placeholder="Enter breed name..."
          />
        </Grid>
      </Grid>

      {/* Pet Grid */}
      <Grid container spacing={4}>
        {filteredPets.map((pet) => (
          <Grid item key={pet.id} xs={12} sm={6} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}>
              <CardMedia
                component="img"
                height="250"
                image={pet.image}
                alt={pet.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {pet.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {pet.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {pet.vaccinated && (
                    <Chip
                      label="Vaccinated"
                      color="success"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {pet.neutered && (
                    <Chip
                      label="Neutered"
                      color="info"
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button
  size="large"
  variant="contained"
  fullWidth
  sx={{
    borderRadius: 2,
    py: 1
  }}
  onClick={() => {
    setSelectedPet(pet);
    setIsFormOpen(true);
  }}
>
  Adopt Me
</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <AdoptionForm
  open={isFormOpen}
  handleClose={() => setIsFormOpen(false)}
  pet={selectedPet}
/>
    </Container>
  );
};

export default Adoption;
