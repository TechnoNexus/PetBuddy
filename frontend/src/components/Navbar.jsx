import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import AddIcon from '@mui/icons-material/Add';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Pets', path: '/pets' },
    { label: 'Adopt', path: '/adoption' },
    { label: 'Store', path: '/store' },
    { label: 'Messages', path: '/chat' },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        color: 'text.primary',
        mb: 4,
        top: 0,
        zIndex: 1100
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: '70px' }}>
          <PetsIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
          <Typography 
            variant="h5" 
            component={Link} 
            to="/home"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              letterSpacing: '-0.5px',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { color: 'primary.main' }
            }}
          >
            PetBuddy
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button 
                key={item.label}
                color="inherit" 
                component={Link} 
                to={item.path}
                sx={{ 
                  fontWeight: 500,
                  opacity: location.pathname === item.path ? 1 : 0.6,
                  '&:hover': { opacity: 1, backgroundColor: 'rgba(124, 58, 237, 0.05)' }
                }}
              >
                {item.label}
              </Button>
            ))}
            
            <Box sx={{ width: '1px', height: '24px', bgcolor: 'divider', mx: 1 }} />
            
            <Button color="inherit" component={Link} to="/profile" sx={{ fontWeight: 500 }}>Profile</Button>
            <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 500 }}>Login</Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/pets/add')}
              sx={{ ml: 2, borderRadius: '20px', px: 3 }}
              disableElevation
            >
              Add Pet
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
