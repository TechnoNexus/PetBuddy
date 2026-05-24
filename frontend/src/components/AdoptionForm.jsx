import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox
} from '@mui/material';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add API call here
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Adoption Application for {pet?.name}
        </Typography>
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
              disabled={!formData.agreeToTerms}
            >
              Submit Application
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default AdoptionForm;
