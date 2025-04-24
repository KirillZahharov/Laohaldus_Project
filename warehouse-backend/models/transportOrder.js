module.exports = (sequelize, DataTypes) => {
  const TransportOrder = sequelize.define('TransportOrder', {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'completed'),
      defaultValue: 'pending',
    },
    type: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false,
    },
    confirmedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientSnapshot: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    warehouseSnapshot: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }, {
    schema: 'warehouse',
    tableName: 'TransportOrders',
  });

  TransportOrder.associate = (models) => {
    TransportOrder.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order',
    });
  };

  return TransportOrder;
};
