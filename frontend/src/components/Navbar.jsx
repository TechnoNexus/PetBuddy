import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PetBuddy
        </Typography>
        <Button color="inherit" component={Link} to="/home">Home</Button>
        <Button color="inherit" component={Link} to="/pets">Pets</Button>
        <Button color="inherit" component={Link} to="/profile">Profile</Button>
        <Button color="inherit" component={Link} to="/chat">Messages</Button>
        <Button color="inherit" component={Link} to="/adoption">Adopt</Button>
        <Button color="inherit" component={Link} to="/">Login</Button>
        <Button color="inherit" component={Link} to="/signup">SignUp</Button>
        <Button color="inherit" component={Link} to="/store">Store</Button>
        <Button color="inherit" component={Link} to="/admin/users">Admin</Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pets/add')}
          sx={{ ml: 2 }}
        >
          Add Pet
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
