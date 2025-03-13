import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  ImageList,
  ImageListItem,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import AdoptionForm from '../components/AdoptionForm';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const pet = {
    id,
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    age: 2,
    description: "Friendly and energetic dog, great with kids. Loves to play fetch and go for long walks. Already trained in basic commands.",
    images: [
      "https://via.placeholder.com/800x600",
      "https://via.placeholder.com/800x600",
      "https://via.placeholder.com/800x600"
    ],
    details: {
      weight: "30kg",
      color: "Golden",
      gender: "Male",
      trained: "Yes",
      health: "Excellent"
    },
    owner: {
      id: 1,
      name: "John Doe",
      rating: 4.8,
      responseTime: "Usually responds within 1 hour"
    }
  };

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <img
              src={pet.images[selectedImage]}
              alt={pet.name}
              style={{ width: '100%', borderRadius: 8, maxHeight: 500, objectFit: 'cover' }}
            />
          </Box>
          <ImageList cols={3} gap={8}>
            {pet.images.map((img, index) => (
              <ImageListItem
                key={index}
                onClick={() => setSelectedImage(index)}
                sx={{
                  cursor: 'pointer',
                  border: selectedImage === index ? 2 : 0,
                  borderColor: 'primary.main',
                  borderRadius: 1
                }}
              >
                <img
                  src={img}
                  alt={`${pet.name} ${index + 1}`}
                  style={{ borderRadius: 4 }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>{pet.name}</Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {pet.breed} • {pet.age} years old
            </Typography>

            <Box sx={{ my: 2 }}>
              <Chip label="Vaccinated" color="success" sx={{ mr: 1 }} />
              <Chip label="Neutered" color="info" />
            </Box>

            <Typography variant="body1" paragraph>
              {pet.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Details</Typography>
            {Object.entries(pet.details).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {key}:
                </Typography>
                <Typography>{value}</Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Owner</Typography>
            <Typography variant="body1">{pet.owner.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {pet.owner.responseTime}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 2 }}
                onClick={handleAdoptClick}
              >
                Apply for Adoption
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleContactOwner}
              >
                Contact Owner
              </Button>
            </Box>
          </Paper>
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
