import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Kaitstud komponent, mis kontrollib kasutaja rolli ja ligipääsu.
 *
 * @param {JSX.Element} children - Komponent, mida kuvada kui ligipääs on lubatud
 * @param {Array} roles - Lubatud rollid (näiteks: ['admin', 'user'])
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useSelector((state) => state.auth);
  console.log('🔒 Kontrollin ligipääsu kasutajale:', user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
