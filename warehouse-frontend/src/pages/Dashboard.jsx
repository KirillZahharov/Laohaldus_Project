import { useSelector } from "react-redux";
import ClientDashboard from "./ClientDashboard";
import { useEffect } from "react";
import AdminDashboard from "./AdminDashboard";
import TransportSpecialistDashboard from "./TransportSpecialistDashboard";
import OrderSpecialistDashboard from "./OrderSpecialistDashboard";

const Dashboard = () => {
  const user = useSelector((state) => state.auth?.user);
  console.log("User from Redux:", user);

  useEffect(() => {
    console.log("Kasutaja muutus:", user);
  }, [user]);

  if (!user) {
    return <div>Laadimine...</div>;
  }

  switch (user.role) {
    case "user":
      return <ClientDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "orderSpecialist":
      return <OrderSpecialistDashboard />;
    case "transportSpecialist":
      return <TransportSpecialistDashboard />;
    default:
      return <div>Rolli ei tuvastatud</div>;
  }
}
export default Dashboard;
