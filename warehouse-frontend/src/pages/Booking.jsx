import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const Booking = () => {
  const [warehouses, setWarehouses] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/warehouses");
        setWarehouses(res.data);
      } catch (err) {
        console.error("Ladude laadimine ebaõnnestus", err);
      }
    };

    fetchWarehouses();
  }, []);

  const handleBookingClick = (warehouseId) => {
    if (!token) {
      if (confirm("Peate sisse logima või registreeruma, et broneerida. Soovite jätkata?")) {
        navigate("/login");
      }
    } else {
      navigate(`/warehouses/${warehouseId}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Vali sobiv laoruum</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((w) => (
          <div key={w.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <img
              src={`/images/${w.imageFilename || "default.jpg"}`}
              alt={w.name}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="text-xl font-semibold mb-2">{w.name}</h2>
            <p className="text-sm text-gray-600">{w.address}</p>
            <p className="text-sm mt-2">Pindala: {w.area} m²</p>
            <p className="text-sm">Temperatuur: {w.temperatureControlled}</p>
            <p className="text-sm text-gray-500 mt-2">
              Vaba alates: {new Date(w.availableFrom).toLocaleDateString()}
            </p>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => handleBookingClick(w.id)}
            >
              Broneeri
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Booking;
