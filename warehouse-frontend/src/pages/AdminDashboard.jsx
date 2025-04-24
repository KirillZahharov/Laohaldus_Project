import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Admini töölaud</h1>
      <p className="text-gray-600">Tere tulemast tagasi, <span className="font-semibold text-blue-800">{user?.username}</span></p>
      <p className="text-sm text-gray-500 mb-4">Sinu roll: <span className="text-blue-700 font-medium">{user?.role}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Statistika / süsteemi ülevaade */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-2">Statistika (näidised)</h2>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>📦 Aktiivsed tellimused: <strong>23</strong></li>
            <li>🏬 Saadaval laod: <strong>5</strong></li>
            <li>🚚 Plaanitud transpordid: <strong>12</strong></li>
          </ul>
        </div>

        {/* Tulevane funktsionaalsus */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-2">Halduse võimalused</h2>
          <p className="text-sm text-gray-700">
            Siia saab lisada kasutajate haldamise, andmete eksportimise, logide vaatamise jm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
