import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminDashboard = () => {

  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      status: 'active',
      createdAt: '2024-01-16'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setEditUser(null);
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || 'user',
      status: user.status
    });
    setOpenDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      const url = editUser
        ? `http://localhost:8000/api/admin/users/${editUser.id}`
        : 'http://localhost:8000/api/admin/users';

      const method = editUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        setUsers(prev => editUser
          ? prev.map(u => u.id === editUser.id ? {...u, ...userForm} : u)
          : [...prev, {...userForm, id: Date.now()}]
        );
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleBlockUser = async (userId) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? {...user, status: user.status === 'active' ? 'blocked' : 'active'}
        : user
    );
    setUsers(updatedUsers);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">User Management</Typography>
          <TextField
            placeholder="Search users..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Stack>

        <Button
          variant="contained"
          onClick={handleAddUser}
          sx={{ mb: 2 }}
        >
          Add New User
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditUser(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleBlockUser(user.id)}>
                      {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="First Name"
              value={userForm.firstName}
              onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={userForm.lastName}
              onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={userForm.status}
                onChange={(e) => setUserForm({...userForm, status: e.target.value})}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} variant="contained">
              {editUser ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;