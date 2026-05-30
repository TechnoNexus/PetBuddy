import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { submitAdoptionApplication } from '../services/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflow: 'auto'
};

const AdoptionForm = ({ open, handleClose, pet }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    hasOtherPets: false,
    otherPetsDetails: '',
    housingType: '',
    agreeToTerms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to submit an adoption application.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        pet_id: pet?.id,
        pet_name: pet?.name,
        pet_source: pet?.pet_source || 'internal',
        external_url: pet?.external_url,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        experience: formData.experience,
        has_other_pets: formData.hasOtherPets,
        other_pets_details: formData.otherPetsDetails,
        housing_type: formData.housingType,
        agreed_to_terms: formData.agreeToTerms
      };
      await submitAdoptionApplication(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Adoption Application for {pet?.name}
          </Typography>
          
          {!user && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              You must be logged in to submit an adoption application. Please log in first.
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                required
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <TextField
                required
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <TextField
                required
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <TextField
                required
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              <TextField
                required
                label="Previous Pet Experience"
                multiline
                rows={3}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasOtherPets}
                    onChange={(e) => setFormData({...formData, hasOtherPets: e.target.checked})}
                  />
                }
                label="Do you have other pets?"
              />
              {formData.hasOtherPets && (
                <TextField
                  label="Other Pets Details"
                  multiline
                  rows={2}
                  value={formData.otherPetsDetails}
                  onChange={(e) => setFormData({...formData, otherPetsDetails: e.target.value})}
                />
              )}
              <TextField
                required
                label="Housing Type"
                select
                value={formData.housingType}
                onChange={(e) => setFormData({...formData, housingType: e.target.value})}
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
              </TextField>
              <FormControlLabel
                required
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  />
                }
                label="I agree to the terms and conditions"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!formData.agreeToTerms || loading || !user}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>
      <Snackbar open={success} autoHideDuration={2000}>
        <Alert severity="success" sx={{ width: '100%' }}>Application submitted successfully!</Alert>
      </Snackbar>
    </>
  );
};

export default AdoptionForm;
