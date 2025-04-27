// Ekspordime User mudeli funktsiooni
module.exports = (sequelize, DataTypes) => {
  // Defineerime User mudeli ja selle väljad
  return sequelize.define('User', {
    username: DataTypes.STRING,   // Kasutajanimi (nt eesnimi ja perekonnanimi koos)
    email: DataTypes.STRING,      // Kasutaja e-mail (unikaalne)
    password: DataTypes.STRING,   // Kasutaja krüpteeritud parool
    role: DataTypes.STRING,       // Kasutaja roll (admin, user, orderSpecialist, transportSpecialist jne)
    phone: DataTypes.STRING,      // Telefoninumber
  }, {
    schema: 'warehouse',          // Tabel kuulub 'warehouse' skeemasse (PostgreSQL-s)
    tableName: 'Users',            // Tabeli nimi on 'Users'
  });
};
