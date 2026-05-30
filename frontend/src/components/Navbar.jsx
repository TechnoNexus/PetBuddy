import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleMobileNav = (path) => {
    handleCloseNavMenu();
    navigate(path);
  };

  const handleMobileLogout = async () => {
    handleCloseNavMenu();
    await logout();
    navigate('/');
  };

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
          
          {/* Mobile Menu Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.label} onClick={() => handleMobileNav(item.path)}>
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
              <Divider />
              {user ? (
                [
                  <MenuItem key="profile" onClick={() => handleMobileNav('/profile')}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleMobileLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                ]
              ) : (
                <MenuItem key="login" onClick={() => handleMobileNav('/')}>
                  <Typography textAlign="center">Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo */}
          <PetsIcon sx={{ color: 'primary.main', mr: 1, display: { xs: 'none', md: 'flex' }, fontSize: 32 }} />
          <PetsIcon sx={{ color: 'primary.main', mr: 1, display: { xs: 'flex', md: 'none' }, fontSize: 32 }} />
          <Typography 
            variant="h5" 
            component={Link} 
            to="/home"
            sx={{ 
              flexGrow: { xs: 0, md: 1 }, 
              fontWeight: 700, 
              letterSpacing: '-0.5px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { color: 'primary.main' }
            }}
          >
            PetBuddy
          </Typography>
          
          {/* Mobile Spacer (pushes Add Pet to right) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />

          {/* Desktop Menu */}
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
            
            {user ? (
              <>
                <Button color="inherit" component={Link} to="/profile" sx={{ fontWeight: 500 }}>Profile</Button>
                <Button color="inherit" onClick={async () => { await logout(); navigate('/'); }} sx={{ fontWeight: 500 }}>Logout</Button>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 500 }}>Login</Button>
            )}
            
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
          
          {/* Mobile Add Pet Icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
             <IconButton color="primary" onClick={() => navigate('/pets/add')}>
               <AddIcon />
             </IconButton>
          </Box>
          
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
