// models/order.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    userId: DataTypes.INTEGER,
    clientId: DataTypes.INTEGER,
    warehouseId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    actualStartDate: DataTypes.DATE,
    actualEndDate: DataTypes.DATE,
    transportNeeded: DataTypes.BOOLEAN,
    dimensions: DataTypes.STRING,
    weight: DataTypes.FLOAT,
    pickupAddress: DataTypes.STRING,
    totalPrice: DataTypes.FLOAT,
    status: DataTypes.ENUM('pending', 'confirmed', 'paid', 'expired', 'cancelled'),
    paymentDeadline: DataTypes.DATE,
    reminderSent: DataTypes.BOOLEAN,
    extensionRequested: DataTypes.BOOLEAN,
    extensionPaid: DataTypes.BOOLEAN,
    extensionPrice: DataTypes.FLOAT,
    extensionInvoiceNumber: DataTypes.STRING,
    newEndDate: DataTypes.DATE,
    clientSnapshot: DataTypes.JSON,
    warehouseSnapshot: DataTypes.JSON,
  }, {
    schema: 'warehouse',
    tableName: 'Orders',
  });
};
