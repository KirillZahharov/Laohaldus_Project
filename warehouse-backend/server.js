// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); // index.js ekspordib sequelize
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const transportRoutes = require('./routes/transportRoutes');
const clientRoutes = require('./routes/clientRoutes');
const contactRoutes = require('./routes/contactRoutes');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/transport-orders', transportRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contact', contactRoutes);

// Sync DB and start server
sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Andmebaasiga ühendatud');
  app.listen(PORT, () => {
    console.log(`🚀 Server töötab pordil ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Andmebaasi ühenduse viga:', err);
});
