import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { setUserFromToken } from './store/authSlice';

// Lehed
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Home from './pages/Home';
import Company from './pages/Company';
import Services from './pages/Services';
import Booking from './pages/Booking';
import WarehouseDetails from './pages/WarehouseDetails';
import ClientProfile from './pages/ClientProfile';
import OrderSpecialistDashboard from './pages/OrderSpecialistDashboard';
import Contact from './pages/Contact';
import TransportSpecialistDashboard from './pages/TransportSpecialistDashboard'; // kui olemas

// Komponendid
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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
          console.error('❌ Tokeni dekodeerimine ebaõnnestus', err);
        }
      }
    }
  }, [dispatch, user]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/warehouses/:id" element={<WarehouseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Kaitstud marsruudid vastavalt rollile */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['admin', 'user']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['user']}>
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-dashboard"
            element={
              <ProtectedRoute roles={['orderSpecialist']}>
                <OrderSpecialistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transport-dashboard"
            element={
              <ProtectedRoute roles={['transportSpecialist']}>
                <TransportSpecialistDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
