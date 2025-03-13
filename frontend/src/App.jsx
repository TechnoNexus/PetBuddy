import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pets from './pages/Pets';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Adoption from './pages/Adoption';
import PetDetail from './pages/PetDetail';
import AddPetForm from './components/AddPetForm';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import PetStore from './pages/PetStore';
import { AuthProvider } from './context/AuthContext';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';


const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // A nice blue color
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff4081', // Pink accent
    },
    background: {
      default: '#f5f5f5', // Light gray background
    },
  },
  typography: {
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
        <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/home" element={<Home />} />
  <Route path="/pets" element={<Pets />} />
  <Route path="/pets/add" element={<AddPetForm />} />
  <Route path="/pets/:id" element={<PetDetail />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/chat" element={<Chat />} />
  <Route path="/adoption" element={<Adoption />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/store" element={<PetStore />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/order-success" element={<OrderSuccess />} />
  <Route path="/admin/users" element={<AdminDashboard />} />


</Routes>

        </div>
      </Router>
          </AuthProvider>

    </ThemeProvider>
  );
}

export default App;
