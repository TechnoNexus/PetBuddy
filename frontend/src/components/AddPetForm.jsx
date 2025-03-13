import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Container,
  Typography,
  MenuItem,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import PhotoUpload from './PhotoUpload';

const AddPetForm = () => {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: '',
    photos: []
  });

  const handleChange = (e) => {
    setPetData({
      ...petData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotosChange = (photos) => {
    setPetData({ ...petData, photos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(petData).forEach(key => {
      if (key === 'photos') {
        petData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      } else {
        formData.append(key, petData[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:8000/api/pets/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setOpenSnackbar(true);

      // Updated navigation using the correct data structure
      setTimeout(() => {
        navigate(`/pets/${data.data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating pet:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add a New Pet
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              name="name"
              label="Pet Name"
              value={petData.name}
              onChange={handleChange}
            />
            <TextField
              required
              select
              name="species"
              label="Species"
              value={petData.species}
              onChange={handleChange}
            >
              <MenuItem value="dog">Dog</MenuItem>
              <MenuItem value="cat">Cat</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              required
              name="breed"
              label="Breed"
              value={petData.breed}
              onChange={handleChange}
            />
            <TextField
              required
              name="age"
              label="Age"
              type="number"
              value={petData.age}
              onChange={handleChange}
            />
            <TextField
              required
              name="description"
              label="Description"
              multiline
              rows={4}
              value={petData.description}
              onChange={handleChange}
            />
            <PhotoUpload onPhotosChange={handlePhotosChange} />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Add Pet
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Pet successfully added!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddPetForm;
