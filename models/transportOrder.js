// Ekspordime TransportOrder mudeli funktsiooni
module.exports = (sequelize, DataTypes) => {
  // Defineerime TransportOrder mudeli koos veergudega
  const TransportOrder = sequelize.define('TransportOrder', {
    orderId: {
      type: DataTypes.INTEGER,   // Seos Order tabeliga
      allowNull: false,          // orderId peab alati olemas olema
    },
    pickupAddress: {
      type: DataTypes.STRING,    // Aadress, kust kaup peale võetakse või kuhu tarnitakse
      allowNull: false,
    },
    scheduledDate: {
      type: DataTypes.DATE,      // Planeeritud transpordi kuupäev ja kellaaeg
      allowNull: true,           // Alguses võib puududa (kui pole veel ajastatud)
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'completed'), // Transpordi staatus
      defaultValue: 'pending',    // Vaikimisi 'pending' (ootel kinnitamist)
    },
    type: {
      type: DataTypes.ENUM('inbound', 'outbound'), // Sõidusuund: inbound (sisse) või outbound (välja)
      allowNull: false,
    },
    confirmedBy: {
      type: DataTypes.STRING,    // Kinnitaja nimi või ID
      allowNull: true,
    },
    completedBy: {
      type: DataTypes.STRING,    // Lõpetaja nimi või ID
      allowNull: true,
    },
    clientSnapshot: {
      type: DataTypes.JSON,      // Kliendi andmete hetkeseis tellimuse loomise hetkel
      allowNull: true,
    },
    warehouseSnapshot: {
      type: DataTypes.JSON,      // Lao andmete hetkeseis tellimuse loomise hetkel
      allowNull: true,
    }
  }, {
    schema: 'warehouse',         // Tabel kuulub 'warehouse' skeemasse
    tableName: 'TransportOrders',// Tabeli nimi on TransportOrders
  });

  // Seos Order mudeliga
  TransportOrder.associate = (models) => {
    TransportOrder.belongsTo(models.Order, {
      foreignKey: 'orderId',      // Seos orderId kaudu
      as: 'order',                // Aliase nimi, mida saab include teha
    });
  };

  // Tagastame TransportOrder mudeli
  return TransportOrder;
};
