import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPets, scavengeInternet } from '../services/api';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  Paper,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Dialog,
  DialogContent,
  IconButton,
  Divider
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import PetCard from '../components/PetCard';
import AdoptionForm from '../components/AdoptionForm';

const Pets = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ species: '', breed: '', age: '', location: '' });
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [hasSearchedAi, setHasSearchedAi] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAiPet, setSelectedAiPet] = useState(null);

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
      (!filters.breed || pet.breed?.toLowerCase().includes(filters.breed.toLowerCase())) &&
      (!filters.age || pet.age?.toString() === filters.age) &&
      (!filters.location || pet.location?.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const clearFilters = () => {
    setFilters({ species: '', breed: '', age: '', location: '' });
  };

  const searchAiPets = async () => {
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiError('');
    setHasSearchedAi(true);
    try {
      const response = await scavengeInternet(aiQuery.trim(), 'pets');
      setAiResults(Array.isArray(response.data.results) ? response.data.results : []);
    } catch (error) {
      console.error('AI pet search failed:', error);
      setAiError(error.response?.data?.detail || error.message || 'AI search failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const openAdoptionForm = (pet) => {
    setSelectedPet({
      ...pet,
      id: undefined,
      pet_source: 'external',
      external_url: pet.url,
      age: pet.age === 'Unknown' ? undefined : pet.age,
    });
    setIsFormOpen(true);
  };

  const openListing = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
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
        <Paper className="glass-panel" sx={{ p: 4, mb: 6, borderRadius: '24px', border: 'none' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Search Pets</Typography>
              <Typography variant="body2" color="text.secondary">Browse PetBuddy listings or search external adoption sources.</Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={aiMode} onChange={(event) => setAiMode(event.target.checked)} color="primary" />}
              label={<Stack direction="row" spacing={1} alignItems="center"><AutoAwesomeIcon fontSize="small" /><span>AI Internet Search</span></Stack>}
              sx={{ m: 0 }}
            />
          </Stack>

          {aiMode ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="What are you looking for?"
                placeholder="Husky in Hamilton"
                value={aiQuery}
                onChange={(event) => setAiQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') searchAiPets();
                }}
                InputProps={{ sx: { borderRadius: '12px' } }}
              />
              <Button
                variant="contained"
                startIcon={aiLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={searchAiPets}
                disabled={aiLoading || !aiQuery.trim()}
                sx={{ borderRadius: '12px', minWidth: 150 }}
              >
                Search
              </Button>
            </Stack>
          ) : (
            <>
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
            </>
          )}
        </Paper>

        {aiMode ? (
          <>
            {aiError && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{aiError}</Alert>}
            {aiLoading ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Searching adoption sources...</Typography>
              </Box>
            ) : hasSearchedAi && aiResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h5" color="text.secondary">No AI results found for this search.</Typography>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {aiResults.map((pet, index) => (
                  <Grid item key={pet.id || pet.url || index} xs={12} sm={6} md={4}>
                    <Card className="hover-lift" onClick={() => setSelectedAiPet(pet)} sx={{ height: '100%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: 'none', cursor: 'pointer' }}>
                      {pet.image ? (
                        <Box component="img" src={pet.image} alt={pet.name} sx={{ width: '100%', height: 250, objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ height: 250, bgcolor: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', gap: 1 }}>
                          <ImageNotSupportedIcon />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Source photo unavailable</Typography>
                        </Box>
                      )}
                      <CardContent sx={{ p: 3, flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{pet.name}</Typography>
                        <Typography variant="subtitle2" color="primary.main" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1, mb: 1 }}>
                          {pet.breed || pet.species || 'Adoptable Pet'}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1, gap: 0.5 }}>
                          {pet.age && pet.age !== 'Unknown' && <Chip label={pet.age} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />}
                          {pet.gender && pet.gender !== 'Unknown' && <Chip label={pet.gender} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{pet.shelter || pet.location || 'Location unavailable'}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {pet.description || 'Click for more details.'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0, gap: 1, flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        <Button fullWidth variant="contained" onClick={() => setSelectedAiPet(pet)} sx={{ borderRadius: '12px' }}>
                          View Details
                        </Button>
                        <Button fullWidth variant="outlined" endIcon={<OpenInNewIcon />} onClick={() => openListing(pet.url)} sx={{ borderRadius: '12px', mx: '0 !important' }} disabled={!pet.url}>
                          View Source Listing
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        ) : loading ? (
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

      {/* AI Pet Detail Dialog */}
      <Dialog
        open={!!selectedAiPet}
        onClose={() => setSelectedAiPet(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', maxHeight: '90vh' } }}
      >
        {selectedAiPet && (
          <>
            {selectedAiPet.image ? (
              <Box component="img" src={selectedAiPet.image} alt={selectedAiPet.name}
                sx={{ width: '100%', height: 300, objectFit: 'cover' }} />
            ) : (
              <Box sx={{ height: 200, bgcolor: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <ImageNotSupportedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={700}>Source photo unavailable</Typography>
              </Box>
            )}
            <IconButton onClick={() => setSelectedAiPet(null)}
              sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
              <CloseIcon />
            </IconButton>

            <DialogContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>{selectedAiPet.name}</Typography>
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                {selectedAiPet.breed || selectedAiPet.species || 'Adoptable Pet'}
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                {selectedAiPet.age && selectedAiPet.age !== 'Unknown' && (
                  <Chip label={selectedAiPet.age} size="small" sx={{ fontWeight: 600 }} />
                )}
                {selectedAiPet.gender && selectedAiPet.gender !== 'Unknown' && (
                  <Chip label={selectedAiPet.gender} size="small" sx={{ fontWeight: 600 }} />
                )}
                {selectedAiPet.species && (
                  <Chip label={selectedAiPet.species} size="small" sx={{ fontWeight: 600 }} />
                )}
                {selectedAiPet.color && selectedAiPet.color !== 'Unknown' && (
                  <Chip label={selectedAiPet.color} size="small" sx={{ fontWeight: 600 }} />
                )}
                {selectedAiPet.vaccinated === true && (
                  <Chip label="Vaccinated" size="small" color="success" sx={{ fontWeight: 600 }} />
                )}
                {selectedAiPet.neutered === true && (
                  <Chip label="Neutered" size="small" color="info" sx={{ fontWeight: 600 }} />
                )}
                {selectedAiPet.fee && (
                  <Chip label={selectedAiPet.fee} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                )}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                {selectedAiPet.shelter && (
                  <Typography variant="body2" color="primary.main" fontWeight={700}>{selectedAiPet.shelter}</Typography>
                )}
                {selectedAiPet.shelter && selectedAiPet.location && (
                  <Typography variant="body2" color="text.disabled">•</Typography>
                )}
                {selectedAiPet.location && (
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{selectedAiPet.location}</Typography>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>About {selectedAiPet.name}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                {selectedAiPet.description || 'No description available. Visit the source listing for details.'}
              </Typography>

              {selectedAiPet.details && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Adoption Details</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                    {selectedAiPet.details}
                  </Typography>
                </>
              )}

              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Button fullWidth variant="contained" onClick={() => { setSelectedAiPet(null); openAdoptionForm(selectedAiPet); }}
                  sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}>
                  Apply for Adoption
                </Button>
                <Button fullWidth variant="outlined" endIcon={<OpenInNewIcon />} onClick={() => openListing(selectedAiPet.url)}
                  disabled={!selectedAiPet.url} sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}>
                  View Source Listing
                </Button>
                {selectedAiPet.contact && (
                  <Button fullWidth variant="outlined" color="success"
                    onClick={() => window.open(`tel:${selectedAiPet.contact}`)}
                    sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}>
                    Contact: {selectedAiPet.contact}
                  </Button>
                )}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>

      <AdoptionForm
        open={isFormOpen}
        handleClose={() => setIsFormOpen(false)}
        pet={selectedPet}
      />
    </Box>
  );
};

export default Pets;
