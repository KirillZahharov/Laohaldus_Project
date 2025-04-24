// src/components/HeroSection.jsx
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <div className="bg-cover bg-center h-[85vh] flex items-center justify-center text-white relative" style={{ backgroundImage: `url('/hero-warehouse.jpg')` }}>
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <motion.div 
        className="z-10 text-center max-w-2xl px-4"
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Kaasaegne laohaldus sinu ärile</h1>
        <p className="text-lg md:text-xl mb-6">Broneeri hoiuruum kiiresti ja mugavalt. Transport, hoiustamine ja tagastamine – kõik ühes süsteemis.</p>
        <Link to="/broneerimine">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl inline-flex items-center transition">
            Alusta broneerimist
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
