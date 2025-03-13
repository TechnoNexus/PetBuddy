import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  TextField
} from '@mui/material';

import PetsIcon from '@mui/icons-material/Pets';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

const Profile = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

useEffect(() => {
    const savedTab = sessionStorage.getItem('activeProfileTab');
    if (savedTab) {
      setTabValue(parseInt(savedTab));
    }
  }, []);

  const [userProfile, setUserProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    avatar: user?.avatar || 'https://via.placeholder.com/150',
    bio: 'Animal lover and proud pet parent. Looking to expand my furry family!'
  });

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userProfile)
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch('http://localhost:8000/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile({ ...userProfile, avatar: data.avatarUrl });
        }
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    }
  };

  const [myPets] = useState([
    {
      id: 1,
      name: "Max",
      type: "Dog",
      adoptionDate: "2022-06-15",
      image: "https://via.placeholder.com/100"
    },
    {
      id: 2,
      name: "Luna",
      type: "Cat",
      adoptionDate: "2023-01-20",
      image: "https://via.placeholder.com/100"
    }
  ]);

  const [adoptionHistory] = useState([
    {
      id: 1,
      petName: "Max",
      status: "Approved",
      date: "2022-06-15",
      image: "https://via.placeholder.com/100"
    },
    {
      id: 2,
      petName: "Luna",
      status: "Pending",
      date: "2023-01-20",
      image: "https://via.placeholder.com/100"
    }
  ]);

  const [orders] = useState([
  {
    orderId: "ORD123456",
    date: "2024-01-15",
    total: 54.98,
    items: [
      {
        id: 1,
        name: "Premium Dog Food",
        quantity: 1,
        price: 29.99,
        image: "https://via.placeholder.com/100"
      },
      {
        id: 2,
        name: "Pet Collar",
        quantity: 2,
        price: 12.49,
        image: "https://via.placeholder.com/100"
      }
    ]
  },
  {
    orderId: "ORD123457",
    date: "2024-01-10",
    total: 89.97,
    items: [
      {
        id: 3,
        name: "Cat Tree",
        quantity: 1,
        price: 89.97,
        image: "https://via.placeholder.com/100"
      }
    ]
  }
]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
<Paper sx={{ p: 3, textAlign: 'center' }}>
  <Avatar
    src={userProfile.avatar}
    sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
  />
  <Typography variant="h5" gutterBottom>
    {`${userProfile.firstName} ${userProfile.lastName}`}
  </Typography>
  <Typography variant="body1" color="text.secondary" paragraph>
    {userProfile.bio}
  </Typography>
  <Divider sx={{ my: 2 }} />

  {isEditing ? (
    <List>
      <ListItem>
        <TextField
          fullWidth
          label="Email"
          value={userProfile.email}
          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
        />
      </ListItem>
      <ListItem>
        <TextField
          fullWidth
          label="Phone"
          value={userProfile.phone}
          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
        />
      </ListItem>
      <ListItem>
        <TextField
          fullWidth
          label="Location"
          value={userProfile.location}
          onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
        />
      </ListItem>
      <ListItem>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Bio"
          value={userProfile.bio}
          onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
        />
      </ListItem>
    </List>
  ) : (
    <List>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <EmailIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Email" secondary={userProfile.email} />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <PhoneIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Phone" secondary={userProfile.phone} />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <LocationOnIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Location" secondary={userProfile.location} />
      </ListItem>
    </List>
  )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={isEditing ? handleSaveProfile : handleEditProfile}
                type="button"  // Add this to prevent form submission
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
<Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="My Pets" />
              <Tab label="Adoption History" />
              <Tab label="Orders" />
              <Tab label="Settings" />
            </Tabs>

            {/* My Pets Tab */}
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {myPets.map((pet) => (
                  <Grid item xs={12} sm={6} key={pet.id}>
                    <Card>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={pet.image}
                          sx={{ width: 80, height: 80, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6">{pet.name}</Typography>
                          <Typography color="text.secondary">{pet.type}</Typography>
                          <Typography variant="body2">
                            Adopted on: {new Date(pet.adoptionDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Adoption History Tab */}
            {tabValue === 1 && (
              <List>
                {adoptionHistory.map((adoption) => (
                  <ListItem key={adoption.id} divider>
                    <ListItemAvatar>
                      <Avatar src={adoption.image}>
                        <PetsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={adoption.petName}
                      secondary={`Status: ${adoption.status} • Date: ${new Date(adoption.date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}

        {/* Orders Tab */}
        {tabValue === 2 && (
  <Grid container spacing={2}>
    {orders.map((order) => (
      <Grid item xs={12} key={order.orderId}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Order #{order.orderId}</Typography>
              <Typography color="primary">${order.total.toFixed(2)}</Typography>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              {new Date(order.date).toLocaleDateString()}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <List>
              {order.items.map((item) => (
                <ListItem key={item.id}>
                  <ListItemAvatar>
                    <Avatar src={item.image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
)}

            {/* Settings Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Change Password
                </Button>
                <Button variant="outlined" color="error">
                  Delete Account
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
