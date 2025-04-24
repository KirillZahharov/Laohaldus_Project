// models/warehouse.js
module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define('Warehouse', {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    area: DataTypes.INTEGER,
    height: DataTypes.FLOAT,
    temperatureControlled: DataTypes.STRING,
    availableFrom: DataTypes.DATE,
    isAvailable: DataTypes.BOOLEAN,
    imageFilename: DataTypes.STRING,
    pricePerDay: DataTypes.FLOAT,
  }, {
    schema: 'warehouse',
    tableName: 'Warehouses',
  });

  return Warehouse;
};
