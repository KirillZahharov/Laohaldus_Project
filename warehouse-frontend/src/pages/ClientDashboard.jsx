import { useEffect, useState } from "react";
import axios from "axios";

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extensionDays, setExtensionDays] = useState({});

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Tellimuste laadimine ebaõnnestus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExtensionRequest = async (orderId) => {
    const extraDays = extensionDays[orderId];
    if (!extraDays) return alert("Palun vali päevade arv");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/extend-request`,
        { extraDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Pikenduse taotlus saadetud (${extraDays} päeva)`);
      fetchOrders();
    } catch (err) {
      alert("Pikenduse taotlus ebaõnnestus");
    }
  };

  const handleExtensionPayment = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/extend-pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pikenduse makse kinnitatud!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Pikenduse makse ebaõnnestus");
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Kas oled kindel, et soovid tellimuse tühistada?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Tellimus tühistatud");
      fetchOrders();
    } catch (err) {
      alert("Tühistamine ebaõnnestus");
    }
  };

  const handlePayment = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Makse kinnitatud!");
      fetchOrders();
    } catch (err) {
      alert("Makse ebaõnnestus");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("et-EE") : "—";

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-700";
      case "pending":
      case "confirmed":
        return "text-yellow-600";
      case "expired":
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-700";
    }
  };

  const isCancelable = (order) => {
    if (!["pending", "confirmed"].includes(order.status)) return false;
    const created = new Date(order.createdAt);
    const now = new Date();
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours <= 48;
  };

  if (loading) return <div>Laadimine...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minu tellimused</h1>
      {orders.length === 0 && <p>Teil ei ole aktiivseid tellimusi.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded p-4 mb-4 shadow bg-white flex flex-col md:flex-row gap-1"
        >
          {/* Lao pilt */}
          <img
            src={
              order.warehouseSnapshot?.imageFilename
                ? `/images/${order.warehouseSnapshot.imageFilename}`
                : '/images/placeholder.jpg'
            }
            alt={order.warehouseSnapshot?.name || 'Ladu'}
            className="w-full md:w-60 h-42 object-cover rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          />

          {/* Tellimuse info */}
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-semibold">
              {order.warehouseSnapshot?.name || 'Ladu'} — Tellimus #{order.id}
            </h2>

            <p>
              Periood: {formatDate(order.actualStartDate || order.startDate)} –{" "}
              {formatDate(order.actualEndDate || order.endDate)}
            </p>

            <p className={`font-semibold ${getStatusColor(order.status)}`}>
              Staatus: {order.status}
            </p>

            <p>Kokkuhind: {order.totalPrice} €</p>

            {/* Transport info */}
            {order.transportNeeded && order.transportOrder && (
              <div className="mt-2 p-2 border rounded bg-gray-50">
                <p className="font-semibold">🚚 Transport:</p>

                {order.transportOrder.status === "pending" && (
                  <p className="text-yellow-700">
                    Ootab kinnitust transpordispetsialistilt
                  </p>
                )}

                {order.transportOrder.status === "scheduled" && (
                  <>
                    <p className="text-green-700 font-medium">
                      Kinnitatud — saabub{" "}
                      {new Date(order.transportOrder.scheduledDate).toLocaleString("et-EE")}
                    </p>
                    {order.transportOrder.pickupAddress && (
                      <p className="text-gray-800">
                        Pickup aadress: {order.transportOrder.pickupAddress}
                      </p>
                    )}
                  </>
                )}

                {order.transportOrder.status === "completed" && (
                  <p className="text-green-800 font-medium">
                    <span className="font-semibold">Delivered</span>
                  </p>
                )}
              </div>
            )}

            {/* Makse nupp */}
            {order.status === "confirmed" && (
              <button
                onClick={() => handlePayment(order.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Maksa kohe
              </button>
            )}

            {/* Tühistamise nupp */}
            {isCancelable(order) && (
              <button
                onClick={() => handleCancel(order.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
              >
                Tühista
              </button>
            )}

            {/* Pikenduse makse ootel */}
            {order.extensionRequested && !order.extensionPaid && (
              <div className="mt-2">
                <p className="text-yellow-700 mb-1">
                  Ootab pikenduse makset ({order.extensionPrice} €)
                </p>
                <button
                  onClick={() => handleExtensionPayment(order.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Maksa pikenduse eest
                </button>
              </div>
            )}

            {/* Pikenduse taotlemise vorm */}
            {order.status === "paid" && !order.extensionRequested && (
              <div className="mt-2 space-x-2">
                <select
                  value={extensionDays[order.id] || ""}
                  onChange={(e) =>
                    setExtensionDays({
                      ...extensionDays,
                      [order.id]: parseInt(e.target.value),
                    })
                  }
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Pikenda...</option>
                  <option value={15}>+15 päeva</option>
                  <option value={30}>+30 päeva</option>
                  <option value={60}>+60 päeva</option>
                  <option value={90}>+90 päeva</option>
                </select>
                <button
                  onClick={() => handleExtensionRequest(order.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Taotle pikendust
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientDashboard;
