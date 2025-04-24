module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    clientName: DataTypes.STRING,
    companyName: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    region: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    country: DataTypes.STRING,
    registrationCode: DataTypes.STRING,
    businessEmail: DataTypes.STRING,
    loadingDock: DataTypes.STRING,
    comment: DataTypes.STRING,
    vatNumber: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    isBusiness: DataTypes.BOOLEAN,
  }, {
    schema: 'warehouse',
    tableName: 'Clients',
  });

  Client.associate = (models) => {
    Client.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Client;
};