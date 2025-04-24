// models/user.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    phone: DataTypes.STRING,
  }, {
    schema: 'warehouse',
    tableName: 'Users',
  });
};
