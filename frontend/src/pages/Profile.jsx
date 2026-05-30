import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import {
  Container, Grid, Paper, Typography, Avatar, Button, Box, Tabs, Tab, Divider, List, ListItem, ListItemText, ListItemAvatar, Card, CardContent, TextField, CircularProgress
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { getMyAdoptionApplications } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [adoptionHistory, setAdoptionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const savedTab = sessionStorage.getItem('activeProfileTab');
    if (savedTab) setTabValue(parseInt(savedTab));
  }, []);

  useEffect(() => {
    if (tabValue === 1 && user) {
      fetchAdoptions();
    }
  }, [tabValue, user]);

  const fetchAdoptions = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await getMyAdoptionApplications();
      setAdoptionHistory(data);
    } catch (e) {
      console.error("Failed to fetch adoptions", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const [userProfile, setUserProfile] = useState({
    firstName: user?.user_metadata?.first_name || user?.user_metadata?.firstName || 'Guest',
    lastName: user?.user_metadata?.last_name || user?.user_metadata?.lastName || 'User',
    email: user?.email || 'guest@example.com',
    phone: user?.user_metadata?.phone || '+1 234 567 8900',
    location: user?.user_metadata?.location || 'New York, NY',
    bio: user?.user_metadata?.bio || 'Animal lover and proud pet parent. Looking to expand my furry family!',
    petPreferences: user?.user_metadata?.petPreferences || 'No specific preferences',
    avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.avatar || 'https://ui-avatars.com/api/?name=Guest+User&background=7c3aed&color=fff&size=150'
  });

  const handleEditProfile = () => setIsEditing(true);
  const handleSaveProfile = async () => { 
    setIsEditing(false); 
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: userProfile.phone,
          location: userProfile.location,
          bio: userProfile.bio,
          petPreferences: userProfile.petPreferences,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName
        }
      });
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (e) {
      alert("Failed to update profile.");
      console.error(e);
    }
  };

  const myPets = user?.user_metadata?.myPets || [
    { id: 1, name: "Max", type: "Dog", adoptionDate: "2022-06-15", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&q=80" },
    { id: 2, name: "Luna", type: "Cat", adoptionDate: "2023-01-20", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&q=80" }
  ];

  const orders = user?.user_metadata?.orders || [
    { orderId: "ORD123456", date: "2024-01-15", total: 54.98, items: [{ id: 1, name: "Premium Dog Food", quantity: 1, price: 29.99, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100&q=80" }] }
  ];

  return (
    <Box className="animate-fade-in" sx={{ pb: 8 }}>
      <Box sx={{ height: '200px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '0 0 40px 40px', mb: '-100px' }} />
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', borderRadius: '24px', position: 'relative', zIndex: 10, border: 'none' }}>
              <Avatar src={userProfile.avatar} sx={{ width: 140, height: 140, mx: 'auto', mb: 3, border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{`${userProfile.firstName} ${userProfile.lastName}`}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3, px: 2 }}>{userProfile.bio}</Typography>
              <Divider sx={{ my: 3 }} />

              {isEditing ? (
                <List sx={{ textAlign: 'left' }}>
                  <ListItem sx={{ px: 0, py: 1 }}><TextField fullWidth size="small" label="Email" value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} /></ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}><TextField fullWidth size="small" label="Phone" value={userProfile.phone} onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})} /></ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}><TextField fullWidth size="small" label="Location" value={userProfile.location} onChange={(e) => setUserProfile({...userProfile, location: e.target.value})} /></ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}><TextField fullWidth size="small" multiline rows={3} label="Bio" value={userProfile.bio} onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})} /></ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}><TextField fullWidth size="small" label="Pet Preferences" value={userProfile.petPreferences} onChange={(e) => setUserProfile({...userProfile, petPreferences: e.target.value})} /></ListItem>
                </List>
              ) : (
                <List sx={{ textAlign: 'left' }}>
                  <ListItem sx={{ px: 0 }}><ListItemAvatar><Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: 'primary.main' }}><EmailIcon /></Avatar></ListItemAvatar><ListItemText primary="Email" secondary={userProfile.email} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} /></ListItem>
                  <ListItem sx={{ px: 0 }}><ListItemAvatar><Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: 'primary.main' }}><PhoneIcon /></Avatar></ListItemAvatar><ListItemText primary="Phone" secondary={userProfile.phone} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} /></ListItem>
                  <ListItem sx={{ px: 0 }}><ListItemAvatar><Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: 'primary.main' }}><LocationOnIcon /></Avatar></ListItemAvatar><ListItemText primary="Location" secondary={userProfile.location} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} /></ListItem>
                  <ListItem sx={{ px: 0 }}><ListItemAvatar><Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: 'primary.main' }}><PetsIcon /></Avatar></ListItemAvatar><ListItemText primary="Pet Preferences" secondary={userProfile.petPreferences} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} /></ListItem>
                </List>
              )}
              <Button variant={isEditing ? "contained" : "outlined"} fullWidth sx={{ mt: 3, borderRadius: '12px', py: 1.5 }} onClick={isEditing ? handleSaveProfile : handleEditProfile} disableElevation>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
              <Button variant="outlined" color="error" fullWidth sx={{ mt: 2, borderRadius: '12px', py: 1.5 }} onClick={async () => { await logout(); navigate('/'); }}>
                Log Out
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, borderRadius: '24px', overflow: 'hidden', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', mt: { xs: 0, md: '100px' } }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(0,0,0,0.01)' }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="fullWidth" sx={{ '& .MuiTab-root': { py: 2.5, fontWeight: 600 } }}>
                  <Tab label="My Pets" />
                  <Tab label="Adoption History" />
                  <Tab label="Orders" />
                </Tabs>
              </Box>

              <Box sx={{ p: 4 }}>
                {tabValue === 0 && (
                  <Grid container spacing={3}>
                    {myPets.map((pet) => (
                      <Grid item xs={12} sm={6} key={pet.id}>
                        <Card className="hover-lift" sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                          <Avatar src={pet.image} sx={{ width: 80, height: 80, mr: 2, borderRadius: '12px' }} />
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{pet.name}</Typography>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>{pet.type}</Typography>
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>Adopted: {new Date(pet.adoptionDate).toLocaleDateString()}</Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {tabValue === 1 && (
                  historyLoading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : adoptionHistory.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>No adoption history found.</Typography>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {adoptionHistory.map((act) => (
                        <ListItem key={act.id} sx={{ mb: 2, border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', p: 2 }}>
                          <ListItemAvatar><Avatar sx={{ width: 60, height: 60, mr: 2, borderRadius: '12px' }}><PetsIcon /></Avatar></ListItemAvatar>
                          <ListItemText primary={act.pet_name || `Pet #${act.pet_id}`} secondary={`Date: ${new Date(act.created_at).toLocaleDateString()}`} primaryTypographyProps={{ fontWeight: 700 }} />
                          <Box><Typography variant="body2" sx={{ fontWeight: 600, color: act.status === 'approved' ? 'success.main' : act.status === 'rejected' ? 'error.main' : 'warning.main', bgcolor: act.status === 'approved' ? 'rgba(46,125,50,0.1)' : act.status === 'rejected' ? 'rgba(211,47,47,0.1)' : 'rgba(237,108,2,0.1)', px: 2, py: 0.5, borderRadius: '12px', textTransform: 'capitalize' }}>{act.status}</Typography></Box>
                        </ListItem>
                      ))}
                    </List>
                  )
                )}

                {tabValue === 2 && (
                  <Grid container spacing={3}>
                    {orders.map((order) => (
                      <Grid item xs={12} key={order.orderId}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>Order #{order.orderId}</Typography>
                              <Typography color="primary.main" sx={{ fontWeight: 700 }}>${order.total.toFixed(2)}</Typography>
                            </Box>
                            <Typography color="text.secondary" variant="body2" gutterBottom>{new Date(order.date).toLocaleDateString()}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <List disablePadding>
                              {order.items.map((item) => (
                                <ListItem key={item.id} disableGutters>
                                  <ListItemAvatar><Avatar src={item.image} variant="rounded" sx={{ width: 50, height: 50, mr: 2 }} /></ListItemAvatar>
                                  <ListItemText primary={item.name} secondary={`Qty: ${item.quantity}`} primaryTypographyProps={{ fontWeight: 600 }} />
                                  <Typography sx={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</Typography>
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
