// pages/Home.jsx
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div
      className="relative min-h-screen flex items-start justify-center pt-24 bg-cover bg-center"
      style={{ backgroundImage: `url('/Warehouse.png')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <motion.div
        className="relative z-10 text-center px-4 max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
          Tere tulemast meie laohaldussüsteemi!
        </h1>
        <p className="text-white text-lg mb-8 drop-shadow">
          Me pakume nutikaid laopinna lahendusi ettevõtetele ja eraisikutele. Broneeri endale sobiv laoruum lihtsalt ja mugavalt!
        </p>
        <Link to="/dashboard">
          <button className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition inline-flex items-center">
            Alusta broneerimist
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
