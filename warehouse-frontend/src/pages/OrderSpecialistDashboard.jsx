import { useEffect, useState } from "react";
import axios from "axios";

const OrderSpecialistDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveOrders, setArchiveOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/orders/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const unconfirmed = res.data.filter((order) => order.status === "pending");
      setOrders(unconfirmed);
    } catch (err) {
      console.error("Tellimuste laadimine ebaõnnestus", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/orders/archive", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArchiveOrders(res.data);
    } catch (err) {
      console.error("Arhiivi laadimine ebaõnnestus:", err);
    }
  };

  const toggleArchive = () => {
    if (!showArchive) fetchArchiveOrders();
    setShowArchive(!showArchive);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Tellimus kinnitatud!");
      fetchOrders();
    } catch (err) {
      alert("Kinnitamine ebaõnnestus");
      console.error(err);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Kas oled kindel, et soovid tühistada tellimuse?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Tellimus tühistatud!");
      fetchOrders();
    } catch (err) {
      alert("Tühistamine ebaõnnestus");
      console.error(err);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-700 bg-green-200";
      case "confirmed":
      case "pending":
        return "text-yellow-800 bg-yellow-200";
      case "expired":
      case "cancelled":
        return "text-red-700 bg-red-200";
      default:
        return "text-gray-700 bg-gray-200";
    }
  };

  if (loading) return <div className="p-6">Laadimine...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Kinnitamata tellimused</h2>

      {orders.length === 0 ? (
        <p>Ühtegi kinnitamata tellimust ei leitud.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 shadow-md bg-white flex flex-col md:flex-row gap-2 items-center"
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
                  {order.warehouseSnapshot?.name || "Ladu"} —{" "}
                  <span className="text-gray-600">Tellimus #{order.id}</span>
                </h2>
                <p>Klient: {order.clientSnapshot?.clientName || "—"}</p>
                <p>
                  Periood: {formatDate(order.startDate)} – {formatDate(order.endDate)}
                </p>

                <span
                  className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                    order.status
                  )} bg-opacity-20`}
                >
                  Staatus: {order.status}
                </span>

                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleConfirm(order.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Kinnita
                  </button>
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Tühista
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Arhiivi nupp */}
      <div className="mt-8">
        <button
          onClick={toggleArchive}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {showArchive ? "Peida arhiiv" : "Näita kinnitatud tellimuste arhiivi"}
        </button>
      </div>

      {/* Arhiivi tellimused */}
      {showArchive && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Tellimuste arhiiv</h3>
          {archiveOrders.length === 0 ? (
            <p>Arhiiv on tühi.</p>
          ) : (
            archiveOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 shadow bg-gray-100 mb-3 flex flex-col md:flex-row gap-4 items-center"
              >
                {/* Lao pilt */}
                <img
                  src={
                    order.warehouseSnapshot?.imageFilename
                      ? `/images/${order.warehouseSnapshot.imageFilename}`
                      : "/images/placeholder.jpg"
                  }
                  alt={order.warehouseSnapshot?.name || "Ladu"}
                  className="w-full md:w-52 h-36 object-cover rounded-xl"
                />

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-lg">
                    {order.warehouseSnapshot?.name || "Ladu"} — Tellimus #{order.id}
                  </h4>
                  <p>
                    Klient:{" "}
                    {order.clientSnapshot?.clientName ||
                      order.clientSnapshot?.firstName ||
                      "—"}
                  </p>
                  <p>Staatus: {order.status}</p>
                  <p>
                    Periood: {formatDate(order.startDate)} –{" "}
                    {formatDate(order.endDate)}
                  </p>
                  <p>Kokkuhind: {order.totalPrice} €</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrderSpecialistDashboard;
