// Ekspordime Client mudeli funktsiooni, mis saab sequelize ja DataTypes argumendid
module.exports = (sequelize, DataTypes) => {
  // Defineerime Client mudeli koos veergudega
  const Client = sequelize.define('Client', {
    clientName: DataTypes.STRING,       // Kliendi nimi (ettevõtte või isiku nimi)
    companyName: DataTypes.STRING,       // Ettevõtte nimi (kui äriklient)
    firstName: DataTypes.STRING,         // Eesnimi (eraisiku puhul)
    lastName: DataTypes.STRING,          // Perekonnanimi (eraisiku puhul)
    userId: DataTypes.INTEGER,           // Seos User tabeliga (User.id)
    email: DataTypes.STRING,             // E-mail
    phone: DataTypes.STRING,             // Telefon
    address: DataTypes.STRING,           // Aadress
    city: DataTypes.STRING,              // Linn
    region: DataTypes.STRING,            // Maakond või piirkond
    postalCode: DataTypes.STRING,        // Postiindeks
    country: DataTypes.STRING,           // Riik
    registrationCode: DataTypes.STRING,  // Ettevõtte registrikood
    businessEmail: DataTypes.STRING,     // Ärikliendi e-mail (soovi korral)
    loadingDock: DataTypes.STRING,       // Laadimisukse/platvormi number (kui on antud)
    comment: DataTypes.STRING,           // Täiendavad kommentaarid
    vatNumber: DataTypes.STRING,         // Käibemaksukohustuslase number
    accountNumber: DataTypes.STRING,     // Panga arvelduskonto number
    isBusiness: DataTypes.BOOLEAN,       // Kas klient on äriklient (true/false)
  }, {
    schema: 'warehouse', // Määrame skeema nime, kuhu tabel kuulub (PostgreSQL-s)
    tableName: 'Clients', // Konkreetne tabeli nimi
  });

  // Seosed teiste mudelitega
  Client.associate = (models) => {
    // Client kuulub User mudelile (seos userId kaudu)
    Client.belongsTo(models.User, { foreignKey: 'userId' });
  };

  // Tagastame loodud mudeli
  return Client;
};
