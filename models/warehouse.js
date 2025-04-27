// Ekspordime Warehouse mudeli funktsiooni
module.exports = (sequelize, DataTypes) => {
  // Defineerime Warehouse mudeli ja selle veerud
  const Warehouse = sequelize.define('Warehouse', {
    name: DataTypes.STRING,               // Lao nimi
    address: DataTypes.STRING,            // Lao aadress
    area: DataTypes.INTEGER,              // Pindala (m²)
    height: DataTypes.FLOAT,              // Lao kõrgus (meetrites)
    temperatureControlled: DataTypes.STRING, // Temperatuuri kontroll (nt "jahutatud", "soojendatud", "tavaline")
    availableFrom: DataTypes.DATE,        // Kuupäev, alates millest ladu on saadaval
    isAvailable: DataTypes.BOOLEAN,       // Kas ladu on hetkel saadaval (true/false)
    imageFilename: DataTypes.STRING,      // Lao pildi failinimi (salvestatud serverisse)
    pricePerDay: DataTypes.FLOAT,         // Hinnakiri: hind päevas (eurodes)
  }, {
    schema: 'warehouse',                  // Kuulub 'warehouse' skeemasse
    tableName: 'Warehouses',               // Tabeli nimi 'Warehouses'
  });

  return Warehouse;
};
