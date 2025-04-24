const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

// Mudelite import
const User = require('./user')(sequelize, DataTypes);
const Client = require('./client')(sequelize, DataTypes);
const Warehouse = require('./warehouse')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const TransportOrder = require('./transportOrder')(sequelize, DataTypes);

// Seosed
Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(Client, { foreignKey: 'clientId' });
Order.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
Order.hasOne(TransportOrder, { foreignKey: 'orderId', as: 'transportOrder' });
TransportOrder.belongsTo(Order, { foreignKey: 'orderId' });
Client.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Client, { foreignKey: 'userId' });

// Käivita kõik associate funktsioonid kui olemas
if (TransportOrder.associate) TransportOrder.associate({ Order });
if (Client.associate) Client.associate({ User });
if (User.associate) User.associate({ Client });

module.exports = {
  sequelize,
  Sequelize,
  DataTypes,
  User,
  Client,
  Warehouse,
  Order,
  TransportOrder,
};
