import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/authSlice";


const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isBusiness: false,
    companyName: '',
    registrationCode: '',
    businessEmail: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    country: '',
    loadingDock: '',
    comment: '',
    vatNumber: '',
    accountNumber: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.password !== form.confirmPassword) {
      alert('Paroolid ei kattu!');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'user',
        isBusiness: form.isBusiness,
        companyName: form.companyName,
        registrationCode: form.registrationCode,
        businessEmail: form.businessEmail,
        accountNumber: form.accountNumber,
        vatNumber: form.vatNumber,
        address: form.address,
        city: form.city,
        region: form.region,
        country: form.country,
        postalCode: form.postalCode,
        doorNumber: form.loadingDock,
        comments: form.comment,
      });
  
      // Võta token ja user vastusest
      const { token, user } = response.data;
  
      // Salvesta token ja logi kasutaja sisse Reduxi kaudu
      localStorage.setItem("token", token);
      dispatch(loginSuccess({ user, token }));
  
      // Suuna dashboardile
      navigate("/dashboard");
  
    } catch (err) {
      console.error(err);
      alert('Registreerimine ebaõnnestus!');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-2xl space-y-4">
        <h2 className="text-2xl font-bold">Registreeru</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="Eesnimi" onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input type="text" name="lastName" placeholder="Perekonnanimi" onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input type="email" name="email" placeholder="E-post" onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input type="tel" name="phone" placeholder="Telefon" onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input type="password" name="password" placeholder="Parool" onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input type="password" name="confirmPassword" placeholder="Korda parooli" onChange={handleChange} required className="border px-3 py-2 rounded" />
        </div>

        <label className="block mt-4">
          <input type="checkbox" name="isBusiness" checked={form.isBusiness} onChange={handleChange} className="mr-2" />
          Olen ettevõtte esindaja
        </label>

        {form.isBusiness && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <input type="text" name="companyName" placeholder="Ettevõtte nimi" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="registrationCode" placeholder="Registrikood" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="email" name="businessEmail" placeholder="Ettevõtte e-post (valikuline)" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="address" placeholder="Tänav / aadress" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="city" placeholder="Linn" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="postalCode" placeholder="Postiindeks" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="region" placeholder="Regioon" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="country" placeholder="Riik" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="loadingDock" placeholder="Laadimiskoht / uksenumber (valikuline)" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="comment" placeholder="Kommentaar (valikuline)" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="vatNumber" placeholder="KMKR nr (valikuline)" onChange={handleChange} className="border px-3 py-2 rounded" />
            <input type="text" name="accountNumber" placeholder="Pangakonto" onChange={handleChange} className="border px-3 py-2 rounded" />
          </div>
        )}

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
          Registreeru
        </button>
      </form>
    </div>
  );
};

export default Register;
