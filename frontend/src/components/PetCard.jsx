import { Card, CardContent, CardMedia, Typography, Button, CardActions, Box, Chip } from '@mui/material';

const PetCard = ({ pet, onViewDetails }) => {
  return (
    <Card className="hover-lift" sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '20px',
      overflow: 'hidden',
      border: 'none',
      backgroundColor: 'background.paper'
    }}>
      <Box sx={{ position: 'relative', paddingTop: '75%' }}>
        <CardMedia
          component="img"
          image={pet.photos?.[0] || pet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"}
          alt={pet.name}
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
          {pet.vaccinated && <Chip label="Vaccinated" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600, color: 'success.main' }} />}
          {pet.neutered && <Chip label="Neutered" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600, color: 'info.main' }} />}
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            {pet.name}
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
            {pet.age} {pet.age === 1 ? 'yr' : 'yrs'}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px', mb: 2, fontWeight: 600 }}>
          {pet.breed}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {pet.description}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 3, pt: 0, gap: 1.5, flexDirection: 'column' }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onViewDetails}
          sx={{ borderRadius: '12px', py: 1 }}
          disableElevation
        >
          View Details
        </Button>
        <Button 
          fullWidth 
          variant="outlined" 
          color="secondary"
          sx={{ borderRadius: '12px', borderOpacity: 0.5, mx: '0 !important', py: 1 }}
        >
          Contact Shelter
        </Button>
      </CardActions>
    </Card>
  );
};

export default PetCard;
