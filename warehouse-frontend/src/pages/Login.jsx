import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      dispatch(loginSuccess({ user, token }));
    } catch (err) {
      alert("Sisselogimine ebaõnnestus");
      console.error(err);
    }
  };

  // Automaatne suunamine rolli alusel
  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "orderSpecialist") navigate("/order-dashboard");
      else if (user.role === "transportSpecialist") navigate("/transport-dashboard");
      else navigate("/dashboard"); // tavaklient
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">Logi sisse</h2>
        <input
          type="email"
          name="email"
          placeholder="E-post"
          value={form.email}
          onChange={handleChange}
          className="mb-4 w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Parool"
          value={form.password}
          onChange={handleChange}
          className="mb-6 w-full px-3 py-2 border rounded"
        />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Logi sisse
        </button>
      </form>
    </div>
  );
};

export default Login;
