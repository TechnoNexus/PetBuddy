import { Card, CardContent, CardMedia, Typography, Button, CardActions, Box, Chip } from '@mui/material';

const PetCard = ({ pet, onViewDetails }) => {
  return (
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
  height="200"
  image={pet.photos?.[0] || pet.image || "https://via.placeholder.com/300"}
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
            <Chip label="Vaccinated" color="success" sx={{ mr: 1 }} />
          )}
          {pet.neutered && (
            <Chip label="Neutered" color="info" />
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          variant="contained"
          onClick={onViewDetails}
          sx={{ mr: 1 }}
        >
          View Details
        </Button>
        <Button size="small" variant="outlined">
          Contact Owner
        </Button>
      </CardActions>
    </Card>
  );
};

export default PetCard;
