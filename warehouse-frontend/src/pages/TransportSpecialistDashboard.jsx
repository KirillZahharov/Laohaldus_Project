import { useEffect, useState } from "react";
import axios from "axios";

const TransportSpecialistDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveOrders, setArchiveOrders] = useState([]);
  const [scheduledDates, setScheduledDates] = useState({});

  const fetchArchiveOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/transport-orders/completed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sorteeri uuemad ees
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setArchiveOrders(sorted);
    } catch (err) {
      console.error("Arhiivi laadimine ebaõnnestus:", err);
    }
  };

  const toggleArchive = () => {
    if (!showArchive) {
      fetchArchiveOrders();
    }
    setShowArchive(!showArchive);
  };

  const fetchTransportOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/transport-orders/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✔️ Saadud pending transport tellimused:", res.data);
      setOrders(res.data);
    } catch (err) {
      console.error("Transporditellimuste laadimine ebaõnnestus", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportOrders();
  }, []);


  // Handle kuupäeva ja aja muutus
  const handleDateChange = (orderId, value) => {
    setScheduledDates(prev => ({ ...prev, [orderId]: value }));
  };

  const handleConfirm = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const scheduledDate = scheduledDates[id];
      if (!scheduledDate) {
        alert("Palun vali transpordi kuupäev ja kellaaeg");
        return;
      }

      await axios.put(`http://localhost:5000/api/transport-orders/${id}/confirm`,
        { scheduledDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Transporditellimus kinnitatud!");
      fetchTransportOrders();
    } catch (err) {
      alert("Kinnitamine ebaõnnestus");
      console.error(err);
    }
  };

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/transport-orders/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Transporditellimus märgitud lõpetatuks!");
      fetchTransportOrders();
    } catch (err) {
      alert("Lõpetamine ebaõnnestus");
      console.error(err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 bg-green-200';
      case 'pending':
        return 'text-yellow-800 bg-yellow-200';
      case 'completed':
        return 'text-gray-700 bg-gray-200';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };


  if (loading) return <div className="p-6">Laadimine...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Kinnitamata transporditellimused</h2>
  
      {orders.length === 0 ? (
        <p>Ühtegi kinnitamata transporditellimust ei leitud.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 shadow-md bg-white flex flex-col md:flex-row gap-4 items-start"
            >
              <img
                src={
                  order.warehouseSnapshot?.imageFilename
                    ? `/images/${order.warehouseSnapshot.imageFilename}`
                    : "/images/placeholder.jpg"
                }
                alt={order.warehouseSnapshot?.name || "Ladu"}
                className="w-full md:w-52 h-36 object-cover rounded-xl"
              />
  
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {order.type === "inbound" ? "Sissetulev" : "Väljaminev"} transporditellimus #{order.id}
                </h2>
                <p>Ladu: {order.warehouseSnapshot?.name || "—"}</p>
                <p>Klient: {order.clientSnapshot?.clientName || "—"}</p>
                <p>Aadress: {order.clientSnapshot?.address || "—"},{" "}
                  {order.clientSnapshot?.city || ""}</p>
                <p>Lisatud: {new Date(order.createdAt).toLocaleDateString()}</p>
  
                <span
                  className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusStyle(
                    order.status
                  )}`}
                >
                  Staatus: {order.status}
                </span>
  
                <div className="mt-2 space-x-2">
                  {order.status === "pending" && (
                    <>
                      <input
                        type="datetime-local"
                        value={scheduledDates[order.id] || ""}
                        onChange={(e) => handleDateChange(order.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleConfirm(order.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Kinnita transport
                      </button>
                    </>
                  )}
  
                  {["confirmed", "scheduled"].includes(order.status) && (
                    <button
                      onClick={() => handleComplete(order.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Lõpeta transport
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
  
      {/* Arhiivi nupp ja vaade */}
      <div className="mt-8">
        <button
          onClick={toggleArchive}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {showArchive ? "Peida arhiiv" : "Näita lõpetatud transpordi arhiivi"}
        </button>
      </div>
  
      {showArchive && (
        <div className="mt-4 space-y-4">
          <h3 className="text-xl font-semibold">Lõpetatud transporditellimused</h3>
          {archiveOrders.length === 0 ? (
            <p>Arhiiv on tühi.</p>
          ) : (
            archiveOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col md:flex-row gap-4 items-start"
              >
                <img
                  src={
                    order.warehouseSnapshot?.imageFilename
                      ? `/images/${order.warehouseSnapshot.imageFilename}`
                      : "/images/placeholder.jpg"
                  }
                  alt={order.warehouseSnapshot?.name || "Ladu"}
                  className="w-full md:w-52 h-36 object-cover rounded-xl"
                />
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {order.type === "inbound" ? "Sissetulev" : "Väljaminev"} transporditellimus #{order.id}
                  </h2>
                  <p>Ladu: {order.warehouseSnapshot?.name || "—"}</p>
                  <p>Klient: {order.clientSnapshot?.clientName || "—"}</p>
                  <p>Aadress: {order.clientSnapshot?.address || "—"},{" "}
                    {order.clientSnapshot?.city || ""}</p>
                  <p>Lisatud: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Kinnitas: <span className="font-medium">{order.confirmedBy || "—"}</span></p>
                  <p>Lõpetas: <span className="font-medium">{order.completedBy || "—"}</span></p>
  
                  <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-gray-300 text-gray-800">
                    Staatus: {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TransportSpecialistDashboard;
