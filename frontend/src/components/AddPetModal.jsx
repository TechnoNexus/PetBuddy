import { Modal, Box, Typography, TextField, Button, Stack } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AddPetModal = ({ open, handleClose, addPet }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newPet = {
      name: formData.get('name'),
      breed: formData.get('breed'),
      age: parseInt(formData.get('age')),
      description: formData.get('description'),
      imageUrl: 'https://via.placeholder.com/200'
    };
    addPet(newPet);
    event.target.reset();
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Add New Pet
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField required name="name" label="Pet Name" />
            <TextField required name="breed" label="Breed" />
            <TextField
              required
              name="age"
              label="Age"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              required
              name="description"
              label="Description"
              multiline
              rows={4}
            />
            <Button type="submit" variant="contained">Add Pet</Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default AddPetModal;
