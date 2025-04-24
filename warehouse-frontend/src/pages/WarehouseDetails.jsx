import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const WarehouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [warehouse, setWarehouse] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");
  const [transportNeeded, setTransportNeeded] = useState(false);
  const [dimensions, setDimensions] = useState("");
  const [weight, setWeight] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  // 1. Lae lao andmed
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/warehouses/${id}`);
        setWarehouse(res.data);
      } catch (err) {
        console.error("Lao andmete laadimine ebaõnnestus", err);
      }
    };
    fetchWarehouse();
  }, [id]);

  // 2. Hinnakalkulatsioon ja kontroll
  useEffect(() => {
    if (startDate && endDate && warehouse?.pricePerDay) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInMs = end - start;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays < 30) {
        setError("❗ Minimaalne broneerimisperiood on 30 päeva");
        setPrice(0);
      } else {
        setError("");
        let total = diffInDays * warehouse.pricePerDay;
        if (transportNeeded) {
          total += 100; // fikseeritud transporditasu
        }
        setPrice(total);
      }
    }
  }, [startDate, endDate, transportNeeded, warehouse]);

  // 3. Kontroll, kas broneerimine on lubatud
  const isBookingValid = () => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end - start) / (1000 * 60 * 60 * 24);
    if (days < 30) return false;
    if (transportNeeded && (!dimensions || !weight || !pickupAddress)) return false;
    return true;
  };

  // 4. Käsitle broneeringut
  const handleBooking = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const baseData = {
        warehouseId: warehouse.id,
        startDate,
        endDate,
        transportNeeded,
        totalPrice: price,
      };
  
      // Kui transport on valitud, lisa transpordiga seotud väljad
      if (transportNeeded) {
        baseData.dimensions = dimensions;
        baseData.weight = weight;
        baseData.pickupAddress = pickupAddress;
      }
  
      console.log("Saadan order data:", baseData); // DEBUG
  
      const res = await axios.post("http://localhost:5000/api/orders", baseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert("Broneering esitatud!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Broneerimine ebaõnnestus:", err.response?.data || err.message);
      alert("Broneerimine ebaõnnestus");
    }
  };

  if (!warehouse) return <div>Laadimine...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{warehouse.name}</h1>
      <img
        src={`/images/${warehouse.imageFilename}`}
        alt={warehouse.name}
        className="w-full h-64 object-cover rounded mb-4"
      />
      <p><strong>Aadress:</strong> {warehouse.address}</p>
      <p><strong>Pindala:</strong> {warehouse.area} m²</p>
      <p><strong>Temperatuur:</strong> {warehouse.temperatureControlled}</p>
      <p><strong>Hind päevas:</strong> {warehouse.pricePerDay} €</p>

      <div className="mt-6 space-y-4">
        <label>
          Alguskuupäev:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block border rounded px-3 py-2 mt-1 w-full"
          />
        </label>

        <label>
          Lõppkuupäev:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block border rounded px-3 py-2 mt-1 w-full"
          />
        </label>

        <label className="block">
          <input
            type="checkbox"
            checked={transportNeeded}
            onChange={(e) => setTransportNeeded(e.target.checked)}
            className="mr-2"
          />
          Vajan transporti (lisandub 100 €)
        </label>

        {transportNeeded && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Saadetise mõõdud (nt 120x80x100 cm)"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Kaal (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Pealelaadimise aadress"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        {error && <p className="text-red-600 font-semibold">{error}</p>}

        <p className="text-lg font-semibold">
          Arvestuslik hind: <span className="text-green-700">{price.toFixed(2)} €</span>
        </p>

        <button
          onClick={handleBooking}
          disabled={!isBookingValid()}
          className={`px-4 py-2 rounded text-white ${isBookingValid() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Kinnita broneering
        </button>
      </div>
    </div>
  );
};

export default WarehouseDetails;
