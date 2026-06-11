import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetById } from '../services/api';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AdoptionForm from '../components/AdoptionForm';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await getPetById(id);
        const data = response.data;
        
        // Map backend response to UI structure
        setPet({
          id: data.id,
          name: data.name,
          species: data.species,
          breed: data.breed || data.species,
          age: data.age,
          description: data.description,
          location: data.location || "Hamilton, Ontario",
          images: data.photos && data.photos.length > 0 
            ? data.photos.map(p => p.url) 
            : ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"],
          details: {
            weight: data.weight ? `${data.weight} kg` : "Unknown",
            color: data.color || "Unknown",
            gender: data.gender || "Unknown",
            trained: data.trained ? "Yes" : "No",
            health: data.health_info || "Excellent"
          },
          vaccinated: data.vaccinated,
          neutered: data.neutered,
          owner: {
            id: data.owner_id,
            name: data.owner?.first_name || "Shelter",
            rating: 4.8,
            responseTime: "Usually responds within 1 hour"
          }
        });
      } catch (error) {
        console.error("Failed to fetch pet details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleAdoptClick = () => {
    setIsFormOpen(true);
  };

  const handleContactOwner = () => {
  navigate(`/chat`, {
    state: {
      recipientId: pet.owner.id,
      recipientName: pet.owner.name,
      petName: pet.name
    }
  });
};

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">Loading pet details...</Typography>
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Pet not found</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/pets')}>Back to Pets</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container columns={12} spacing={6}>
        {/* Left Panel - Image Gallery */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Box
              component="img"
              src={pet.images[selectedImage]}
              alt={pet.name}
              sx={{
                width: '100%',
                aspectRatio: '4/3',
                objectFit: 'cover',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                mb: 2,
                transition: 'transform 0.3s ease',
              }}
            />
            {pet.images.length > 1 && (
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 } }}>
                {pet.images.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    component="img"
                    src={img}
                    alt={`${pet.name} thumbnail ${index + 1}`}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: selectedImage === index ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      opacity: selectedImage === index ? 1 : 0.7,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      '&:hover': { opacity: 1 }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Grid>

        {/* Right Panel - Info & Actions */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            {/* Header */}
            <Typography variant="h2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, mb: 0.5, letterSpacing: '-0.5px' }}>
              {pet.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 3 }}>
              {pet.location}
            </Typography>

            {/* Glassmorphic Pills */}
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 4 }}>
              {[
                { label: pet.breed, color: '#f3e8ff', textColor: '#7e22ce' },
                { label: `${pet.age} years`, color: '#e0f2fe', textColor: '#0369a1' },
                { label: pet.species, color: '#dcfce7', textColor: '#15803d' },
                pet.neutered && { label: 'Neutered', color: 'rgba(255,255,255,0.15)', textColor: 'text.primary' },
                pet.vaccinated && { label: 'Vaccinated', color: 'rgba(255,255,255,0.15)', textColor: 'text.primary' },
              ].filter(Boolean).map((chip, idx) => (
                <Chip
                  key={idx}
                  label={chip.label}
                  sx={{
                    backgroundColor: chip.color,
                    color: chip.textColor,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: '12px',
                    px: 1,
                    py: 2.5,
                    backdropFilter: 'blur(10px)',
                    border: chip.color.includes('rgba') ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                />
              ))}
            </Stack>

            {/* Persistent Core CTA Row */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '24px', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<FavoriteIcon />}
                onClick={handleAdoptClick}
                sx={{
                  mb: 2,
                  py: 1.8,
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(139, 92, 246, 0.4)',
                  }
                }}
              >
                Start Adoption Application
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={handleContactOwner}
                sx={{
                  py: 1.5,
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': { borderWidth: '2px' }
                }}
              >
                Chat with Shelter Staff
              </Button>
            </Paper>

            {/* Story Body */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 2 }}>
                Meet {pet.name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                {pet.description || "This beautiful pet is looking for a loving home."}
              </Typography>
            </Box>

            <Divider sx={{ my: 4, opacity: 0.6 }} />

            {/* Details Table */}
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 3 }}>
              Pet Details
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(pet.details).map(([key, value]) => (
                <Grid item xs={6} key={key}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <Typography color="text.secondary" sx={{ textTransform: 'capitalize', fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                      {key}
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <AdoptionForm
        open={isFormOpen}
        handleClose={() => setIsFormOpen(false)}
        pet={pet}
      />
    </Container>
  );
};

export default PetDetail;
