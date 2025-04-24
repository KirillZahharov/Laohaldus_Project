import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { setUserFromToken } from './store/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Company from './pages/Company';
import Services from './pages/Services';
import Booking from './pages/Booking';
import WarehouseDetails from './pages/WarehouseDetails';
import ClientProfile from "./pages/ClientProfile";
import OrderSpecialistDashboard from "./pages/OrderSpecialistDashboard";
import Contact from "./pages/Contact";
import Footer from "./components/Footer"; 
import TransportSpecialistDashboard from "./pages/TransportSpecialistDashboard";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          dispatch(setUserFromToken({
            user: { id: decoded.id, role: decoded.role },
            token,
          }));
        } catch (err) {
          console.error('Tokeni dekodeerimine ebaõnnestus', err);
        }
      }
    }
  }, [dispatch, user]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/warehouses/:id" element={<WarehouseDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ClientProfile />} />
          <Route path="/order-dashboard" element={<OrderSpecialistDashboard />} />
          <Route path="/transport-dashboard" element={<TransportSpecialistDashboard />} />
        </Routes>
      </div>
      <Footer /> {/* footer */}
    </>
  );
}

export default App;
