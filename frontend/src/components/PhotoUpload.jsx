import { useState } from 'react';
import {
  Box,
  Button,
  ImageList,
  ImageListItem,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const PhotoUpload = ({ onPhotosChange }) => {
  const [photos, setPhotos] = useState([]);

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos.map(photo => photo.file));
  };

  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos.map(photo => photo.file));
  };

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        multiple
        id="photo-upload"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />
      <label htmlFor="photo-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<AddPhotoAlternateIcon />}
          sx={{ mb: 2 }}
        >
          Upload Photos
        </Button>
      </label>

      <ImageList cols={3} gap={8}>
        {photos.map((photo, index) => (
          <ImageListItem key={index} sx={{ position: 'relative' }}>
            <img
              src={photo.preview}
              alt={`Pet photo ${index + 1}`}
              loading="lazy"
              style={{ height: 200, objectFit: 'cover' }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
              onClick={() => removePhoto(index)}
            >
              <DeleteIcon />
            </IconButton>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default PhotoUpload;
