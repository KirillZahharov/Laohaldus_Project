import { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [showTeam, setShowTeam] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formMessage, setFormMessage] = useState('');

  const handleToggleTeam = () => setShowTeam(!showTeam);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/contact', formData);
      setFormMessage(res.data.message);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setFormMessage(err.response?.data?.error || 'Midagi läks valesti');
    }
  };

  const teamMembers = [
    {
      name: 'Kirill Zahharov',
      title: 'CEO',
      email: 'kirill@laohaldus.ee',
      phone: '+372 5551 1111',
      img: 'https://i.pravatar.cc/150?img=50'
    },
    {
      name: 'Dmitri Suhodol',
      title: 'CEE',
      email: 'dmitri@laohaldus.ee',
      phone: '+372 5552 2222',
      img: 'https://i.pravatar.cc/150?img=6'
    },
    {
      name: 'Marek Tamm',
      title: 'Tellimuste spetsialist',
      email: 'marek@laohaldus.ee',
      phone: '+372 5553 3333',
      img: 'https://i.pravatar.cc/150?img=69'
    },
    {
      name: 'Liis Põder',
      title: 'Transpordi spetsialist',
      email: 'liis@laohaldus.ee',
      phone: '+372 5554 4444',
      img: 'https://i.pravatar.cc/150?img=22'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Kontakt</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Ettevõtte andmed */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Ettevõtte andmed</h2>
          <p><strong>Laohaldus OÜ</strong></p>
          <p>Raua 12, 10124 Tallinn, Eesti</p>
          <p>Telefon: +372 5555 5555</p>
          <p>E-post: info@laohaldus.ee</p>
          <p>Reg. kood: 12345678</p>
          <p>KMKR: EE123456789</p>
          <p>Avatud: E–R 9:00–17:00</p>
        </div>

        {/* Google Maps iframe */}
        <div className="h-80">
          <iframe
            title="Laohaldus asukoht"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://maps.google.com/maps?q=Raua%2012%2C%2010124%20Tallinn&t=&z=15&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Kontaktivorm */}
      <div className="flex justify-center items-center max-h-screen px-4">
        <div className="mb-10 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Võta meiega ühendust</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Sinu nimi"
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Sinu e-post"
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              placeholder="Sõnum"
              rows="5"
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Saada sõnum
            </button>
          </form>
          {formMessage && <p className="mt-4 text-green-700 font-semibold text-center">{formMessage}</p>}
        </div>
      </div>

      {/* Meeskond */}
      <button
        onClick={handleToggleTeam}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 mb-6"
      >
        {showTeam ? 'Peida meeskond' : 'Meie meeskond'}
      </button>

      {showTeam && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4 text-center">
              <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-3" />
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.title}</p>
              <p className="text-sm">📧 {member.email}</p>
              <p className="text-sm">📞 {member.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
