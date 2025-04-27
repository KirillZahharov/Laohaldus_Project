// server.js

// Vajalikud moodulid
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); // index.js ekspordib sequelize instantsi

// Marsruudid (Routes)
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const transportRoutes = require('./routes/transportRoutes');
const clientRoutes = require('./routes/clientRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Lae .env failist keskkonnamuutujad
dotenv.config();

// Expressi rakendus
const app = express();
const PORT = process.env.PORT || 5000;

//Swagger
const setupSwagger = require('./swagger');
setupSwagger(app);

// Middleware
app.use(cors()); // Lubab erinevatest domeenidest pärit päringud (CORS)
app.use(express.json()); // JSON kehandi parsimine päringutes
app.use('/images', express.static('public/images')); // Staatiliste piltide serveerimine

// API marsruudid
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/transport-orders', transportRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contact', contactRoutes);

// Andmebaasiga ühendus ja serveri käivitamine
sequelize.sync({ alter: false }) // alter: false tähendab, et skeemi ei muudeta automaatselt
  .then(() => {
    console.log(' Andmebaasiga ühendatud');
    app.listen(PORT, () => {
      console.log(` Server töötab pordil ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' Andmebaasi ühenduse viga:', err);
  });
