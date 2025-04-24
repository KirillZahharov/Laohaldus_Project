import { useEffect, useState } from "react";
import axios from "axios";

const ClientProfile = () => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (err) {
        console.error("Profiili laadimine ebaõnnestus", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/clients/me", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      alert("Profiil salvestatud!");
    } catch (err) {
      alert("Salvestamine ebaõnnestus");
      console.error(err);
    }
  };

  if (loading || !form) return <div>Laadimine...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Minu profiil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Kontaktinfo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" name="clientName" value={form.clientName || ''} onChange={handleChange} placeholder="Nimi" className="border px-3 py-2 rounded" />
          <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Telefon" className="border px-3 py-2 rounded" />
          <input type="email" name="email" value={form.email || ''} onChange={handleChange} placeholder="E-post" className="border px-3 py-2 rounded" />
          <input type="text" name="address" value={form.address || ''} onChange={handleChange} placeholder="Aadress" className="border px-3 py-2 rounded" />
          <input type="text" name="city" value={form.city || ''} onChange={handleChange} placeholder="Linn" className="border px-3 py-2 rounded" />
          <input type="text" name="postalCode" value={form.postalCode || ''} onChange={handleChange} placeholder="Postiindeks" className="border px-3 py-2 rounded" />
          <input type="text" name="region" value={form.region || ''} onChange={handleChange} placeholder="Regioon" className="border px-3 py-2 rounded" />
          <input type="text" name="country" value={form.country || ''} onChange={handleChange} placeholder="Riik" className="border px-3 py-2 rounded" />
        </div>

        {/* Kui tegemist on ettevõttega */}
        {form.isBusiness && (
          <>
            <h3 className="text-lg font-semibold mt-4">Ettevõtte andmed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="companyName" value={form.companyName || ''} onChange={handleChange} placeholder="Ettevõtte nimi" className="border px-3 py-2 rounded" />
              <input type="text" name="registrationCode" value={form.registrationCode || ''} onChange={handleChange} placeholder="Registrikood" className="border px-3 py-2 rounded" />
              <input type="email" name="businessEmail" value={form.businessEmail || ''} onChange={handleChange} placeholder="Ettevõtte e-post" className="border px-3 py-2 rounded" />
              <input type="text" name="loadingDock" value={form.loadingDock || ''} onChange={handleChange} placeholder="Laadimiskoht (valikuline)" className="border px-3 py-2 rounded" />
              <input type="text" name="comment" value={form.comment || ''} onChange={handleChange} placeholder="Kommentaar" className="border px-3 py-2 rounded" />
              <input type="text" name="vatNumber" value={form.vatNumber || ''} onChange={handleChange} placeholder="KMKR nr" className="border px-3 py-2 rounded" />
              <input type="text" name="accountNumber" value={form.accountNumber || ''} onChange={handleChange} placeholder="Pangakonto" className="border px-3 py-2 rounded" />
            </div>
          </>
        )}

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
          Salvesta
        </button>
        {saved && <p className="text-green-600 mt-2">Salvestatud edukalt.</p>}
      </form>
    </div>
  );
};

export default ClientProfile;
