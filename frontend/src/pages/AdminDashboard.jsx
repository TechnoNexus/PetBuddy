import { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, Stack,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Chip, Tabs, Tab, Box,
  Card, CardContent, Divider, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import { supabase } from '../supabaseClient';

const statusColor = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  contacted: 'info',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState(0);

  // ── Users ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: 'active', createdAt: '2024-01-15' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: 'active', createdAt: '2024-01-16' }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', role: 'user', status: 'active' });

  // ── Adoption Applications ──────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetailOpen, setAppDetailOpen] = useState(false);

  useEffect(() => {
    if (tab === 1) fetchApplications();
  }, [tab]);

  const fetchApplications = async () => {
    setAppLoading(true);
    const { data, error } = await supabase
      .from('adoption_applications')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (!error && data) setApplications(data);
    else console.error('Failed to fetch applications:', error);
    setAppLoading(false);
  };

  const updateAppStatus = async (id, status) => {
    const { error } = await supabase.from('adoption_applications').update({ status }).eq('id', id);
    if (!error) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selectedApp?.id === id) setSelectedApp(prev => ({ ...prev, status }));
    }
  };

  const deleteApp = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await supabase.from('adoption_applications').delete().eq('id', id);
    setApplications(prev => prev.filter(a => a.id !== id));
    setAppDetailOpen(false);
  };

  // ── Users logic ────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveUser = async () => {
    try {
      const url = editUser ? `http://localhost:8000/api/admin/users/${editUser.id}` : 'http://localhost:8000/api/admin/users';
      const method = editUser ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(userForm) });
      if (response.ok) {
        setUsers(prev => editUser ? prev.map(u => u.id === editUser.id ? { ...u, ...userForm } : u) : [...prev, { ...userForm, id: Date.now() }]);
        setOpenDialog(false);
      }
    } catch (error) { console.error('Failed to save user:', error); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>Admin Portal</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<PersonIcon />} iconPosition="start" label="User Management" />
        <Tab icon={<PetsIcon />} iconPosition="start" label={`Adoption Applications ${applications.length > 0 ? `(${applications.filter(a => a.status === 'pending').length} pending)` : ''}`} />
      </Tabs>

      {/* ── TAB 0: Users ── */}
      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">User Management</Typography>
            <TextField placeholder="Search users..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </Stack>
          <Button variant="contained" onClick={() => { setEditUser(null); setUserForm({ firstName: '', lastName: '', email: '', role: 'user', status: 'active' }); setOpenDialog(true); }} sx={{ mb: 2 }}>
            Add New User
          </Button>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Join Date</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={user.status} color={user.status === 'active' ? 'success' : 'error'} /></TableCell>
                    <TableCell>
                      <IconButton onClick={() => { setEditUser(user); setUserForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role || 'user', status: user.status }); setOpenDialog(true); }}><EditIcon /></IconButton>
                      <IconButton onClick={() => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u))}>{user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}</IconButton>
                      <IconButton onClick={() => { if (window.confirm('Delete user?')) setUsers(users.filter(u => u.id !== user.id)); }} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ── TAB 1: Adoption Applications ── */}
      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Adoption Applications</Typography>
            <Button variant="outlined" onClick={fetchApplications}>Refresh</Button>
          </Stack>

          {appLoading ? (
            <Typography color="text.secondary" textAlign="center" py={4}>Loading applications...</Typography>
          ) : applications.length === 0 ? (
            <Box textAlign="center" py={6}>
              <PetsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No adoption applications yet.</Typography>
              <Typography variant="caption" color="text.disabled">Applications submitted via the mobile app will appear here.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Pet Requested</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{app.applicant_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{app.applicant_email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{app.pet_name || `Pet #${app.pet_id}`}</Typography>
                        <Typography variant="caption" color="text.secondary">{app.pet_source}</Typography>
                      </TableCell>
                      <TableCell>
                        {app.pet_source_url
                          ? <a href={app.pet_source_url} target="_blank" rel="noreferrer" style={{ color: '#7c3aed' }}>View Listing</a>
                          : <Typography variant="caption" color="text.secondary">In-App</Typography>
                        }
                      </TableCell>
                      <TableCell>{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select value={app.status || 'pending'} onChange={(e) => updateAppStatus(app.id, e.target.value)}>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="contacted">Contacted</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton onClick={() => { setSelectedApp(app); setAppDetailOpen(true); }}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteApp(app.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* ── Application Detail Dialog ── */}
      <Dialog open={appDetailOpen} onClose={() => setAppDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>PET REQUESTED</Typography>
              <Typography variant="h6" fontWeight={700}>{selectedApp.pet_name || `Pet #${selectedApp.pet_id}`}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>Source: {selectedApp.pet_source}</Typography>
              {selectedApp.pet_source_url && (
                <Typography variant="body2" mb={2}><a href={selectedApp.pet_source_url} target="_blank" rel="noreferrer" style={{ color: '#7c3aed' }}>{selectedApp.pet_source_url}</a></Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>APPLICANT INFO</Typography>
              <Typography><strong>Name:</strong> {selectedApp.applicant_name}</Typography>
              <Typography><strong>Email:</strong> <a href={`mailto:${selectedApp.applicant_email}`} style={{ color: '#7c3aed' }}>{selectedApp.applicant_email}</a></Typography>
              <Typography><strong>Phone:</strong> <a href={`tel:${selectedApp.applicant_phone}`} style={{ color: '#7c3aed' }}>{selectedApp.applicant_phone}</a></Typography>
              <Typography><strong>Address:</strong> {selectedApp.applicant_address || '—'}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>HOME & LIFESTYLE</Typography>
              <Typography><strong>Housing:</strong> {selectedApp.housing_type || '—'}</Typography>
              <Typography><strong>Other Pets:</strong> {selectedApp.has_other_pets ? `Yes — ${selectedApp.other_pets_details}` : 'No'}</Typography>
              <Typography><strong>Experience:</strong> {selectedApp.experience || '—'}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>STATUS</Typography>
              <FormControl size="small" fullWidth>
                <Select value={selectedApp.status || 'pending'} onChange={(e) => updateAppStatus(selectedApp.id, e.target.value)}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppDetailOpen(false)}>Close</Button>
          {selectedApp?.applicant_email && (
            <Button variant="contained" href={`mailto:${selectedApp.applicant_email}?subject=Your PetBuddy Adoption Application for ${selectedApp.pet_name}`}>
              Email Applicant
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="First Name" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} margin="normal" />
          <TextField fullWidth label="Last Name" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">{editUser ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;