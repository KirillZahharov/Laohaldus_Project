// Ekspordime Order mudeli funktsiooni
module.exports = (sequelize, DataTypes) => {
  // Defineerime Order mudeli koos veergudega
  return sequelize.define('Order', {
    userId: DataTypes.INTEGER,            // Seos kasutajaga (kes tellimuse lõi)
    clientId: DataTypes.INTEGER,           // Seos kliendiga (tellimuse omanik)
    warehouseId: DataTypes.INTEGER,        // Seos laoga (kus kaupa hoitakse)
    startDate: DataTypes.DATE,             // Soovitud lao kasutamise alguskuupäev
    endDate: DataTypes.DATE,               // Soovitud lao kasutamise lõppkuupäev
    actualStartDate: DataTypes.DATE,        // Tegelik lao kasutamise alguskuupäev
    actualEndDate: DataTypes.DATE,          // Tegelik lao kasutamise lõppkuupäev
    transportNeeded: DataTypes.BOOLEAN,     // Kas klient soovib transporti (true/false)
    dimensions: DataTypes.STRING,           // Kauba mõõdud (stringina, nt "2x1x1m")
    weight: DataTypes.FLOAT,                // Kauba kaal kilogrammides
    pickupAddress: DataTypes.STRING,        // Aadress, kust kaup peale võetakse
    totalPrice: DataTypes.FLOAT,            // Koguhind (sh ladustamine ja transport)
    status: DataTypes.ENUM('pending', 'confirmed', 'paid', 'expired', 'cancelled'), 
    // Tellimuse olek: ootel, kinnitatud, makstud, aegunud või tühistatud
    paymentDeadline: DataTypes.DATE,        // Tähtaeg, milleks klient peab maksma
    reminderSent: DataTypes.BOOLEAN,        // Kas maksetähtaega meeldetuletus on saadetud (true/false)
    extensionRequested: DataTypes.BOOLEAN,  // Kas tellimuse pikendust on taotletud
    extensionPaid: DataTypes.BOOLEAN,        // Kas tellimuse pikenduse eest on tasutud
    extensionPrice: DataTypes.FLOAT,         // Pikenduse hind
    extensionInvoiceNumber: DataTypes.STRING,// Pikenduse arve number
    newEndDate: DataTypes.DATE,              // Uus lõppkuupäev, kui pikendus kinnitatud
    clientSnapshot: DataTypes.JSON,          // Kliendi andmete hetkeseis (snapshottellimuse loomisel)
    warehouseSnapshot: DataTypes.JSON,       // Lao andmete hetkeseis (snapshottellimuse loomisel)
  }, {
    schema: 'warehouse',    // Tabel kuulub 'warehouse' skeemasse
    tableName: 'Orders',    // Tabeli nimi andmebaasis on 'Orders'
  });
};
