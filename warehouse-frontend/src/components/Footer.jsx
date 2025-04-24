import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Äriinfo */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Laohaldus OÜ</h3>
          <p>Raua 12, 10124 Tallinn, Eesti</p>
          <p>Reg nr: 12345678</p>
          <p>KMKR: EE123456789</p>
          <p>Tel: +372 5555 5555</p>
          <p>Email: info@laohaldus.ee</p>
          <p>Lahtiolekuajad: E–R 9:00–17:00</p>
        </div>

        {/* Kasulikud lingid */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Lingid</h3>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:underline">Avaleht</Link></li>
            <li><Link to="/services" className="hover:underline">Teenused</Link></li>
            <li><Link to="/booking" className="hover:underline">Broneerimine</Link></li>
            <li><Link to="/contact" className="hover:underline">Kontakt</Link></li>
          </ul>
        </div>

        {/* Sotsiaalmeedia */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-4">Jälgi meid</h3>
          <div className="flex justify-center md:justify-start gap-4">
            <a href="#" className="hover:text-blue-400">
              <FaFacebookF size={20} />
            </a>
            <a href="#" className="hover:text-pink-400">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="hover:text-blue-300">
              <FaLinkedinIn size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Alumine riba */}
      <div className="text-center text-sm text-gray-400 mt-8">
        © {new Date().getFullYear()} Laohaldus OÜ. Kõik õigused kaitstud.
      </div>
    </footer>
  );
};

export default Footer;
