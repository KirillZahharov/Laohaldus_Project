// Impordime Sequelize ja DataTypes klassid
const { Sequelize, DataTypes } = require('sequelize');

// Laeme arenduskeskkonna andmebaasi konfiguratsiooni
const config = require('../config/config').development;

// Loome uue Sequelize instantsi, kasutades ühenduse andmeid
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

// Mudelite import ja initsialiseerimine (anname sequelize ja DataTypes edasi igasse mudelisse)
const User = require('./user')(sequelize, DataTypes);
const Client = require('./client')(sequelize, DataTypes);
const Warehouse = require('./warehouse')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const TransportOrder = require('./transportOrder')(sequelize, DataTypes);

// Mudelite vaheliste seoste (associations) määramine

// Order kuulub kasutajale (kes tellimuse tegi)
Order.belongsTo(User, { foreignKey: 'userId' });
// Order kuulub kliendile (kelle nimel tellimus on tehtud)
Order.belongsTo(Client, { foreignKey: 'clientId' });
// Order kuulub laole (kus kaupa hoitakse)
Order.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
// Orderil on üks seotud transporditellimus
Order.hasOne(TransportOrder, { foreignKey: 'orderId', as: 'transportOrder' });

// TransportOrder kuulub Orderile (iga transporditellimus on seotud kindla tellimusega)
TransportOrder.belongsTo(Order, { foreignKey: 'orderId' });

// Client kuulub kasutajale (iga klient on seotud ühe kasutajaga)
Client.belongsTo(User, { foreignKey: 'userId' });

// Kasutajal on üks klient (seos ühe kliendi profiiliga)
User.hasOne(Client, { foreignKey: 'userId' });

// Käivitame mudelite associate() funktsioonid, kui need on defineeritud
if (TransportOrder.associate) TransportOrder.associate({ Order });
if (Client.associate) Client.associate({ User });
if (User.associate) User.associate({ Client });

// Ekspordime kõik loodud mudelid ja sequelize instantsi
module.exports = {
  sequelize,       // Andmebaasi ühenduse instants
  Sequelize,       // Sequelize klass
  DataTypes,       // Andmetüüpide klass
  User,            // Kasutaja mudel
  Client,          // Kliendi mudel
  Warehouse,       // Lao mudel
  Order,           // Tellimuse mudel
  TransportOrder,  // Transporditellimuse mudel
};
