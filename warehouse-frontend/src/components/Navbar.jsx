import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/authSlice";
import axios from "axios";

const Navbar = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.role === "user" && !user.clientName) {
      const fetchClientName = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/clients/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.clientName) {
            dispatch(
              loginSuccess({
                user: { ...user, clientName: res.data.clientName },
                token,
              })
            );
          }
        } catch (err) {
          console.error("Kliendi nime laadimine ebaõnnestus", err);
        }
      };
      fetchClientName();
    }
  }, [user, token, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const displayName = () => {
    if (!user) return "";
    if (user.role === "user" && user.clientName) return user.clientName;
    if (["admin", "orderSpecialist", "transportSpecialist"].includes(user.role)) return user.role;
    return user.username || "Kasutaja";
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">Laohaldus</Link>
      </div>

      <div className="space-x-6">
        <Link to="/company" className="hover:text-green-500">Ettevõttest</Link>
        <Link to="/services" className="hover:text-green-500">Teenused</Link>
        <Link to="/booking" className="hover:text-green-500">Broneerimine</Link>
        <Link to="/contact" className="hover:text-green-500">Kontakt</Link>
      </div>

      <div className="relative" ref={dropdownRef}>
        {!user ? (
          <div className="space-x-2">
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Logi sisse
            </Link>
            <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Registreeru
            </Link>
          </div>
        ) : (
          <div className="relative inline-block text-left">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-gray-700 px-4 py-2 rounded inline-flex items-center"
            >
              <span>{displayName()}</span>
              <svg className="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
                {user.role === "user" && (
                  <>
                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-200" onClick={() => setDropdownOpen(false)}>
                      Avaleht
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200" onClick={() => setDropdownOpen(false)}>
                      Minu profiil
                    </Link>
                  </>
                )}

                {user.role === "orderSpecialist" && (
                  <Link to="/order-dashboard" className="block px-4 py-2 hover:bg-gray-200" onClick={() => setDropdownOpen(false)}>
                    Tellimused
                  </Link>
                )}

                {user.role === "transportSpecialist" && (
                  <Link to="/transport-dashboard" className="block px-4 py-2 hover:bg-gray-200" onClick={() => setDropdownOpen(false)}>
                    Transport
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link to="/admin-dashboard" className="block px-4 py-2 hover:bg-gray-200" onClick={() => setDropdownOpen(false)}>
                    Admini paneel
                  </Link>
                )}

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logi välja
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
