// Laeb keskkonnamuutujad (.env failist) rakendusse
require('dotenv').config();

// Ekspordib andmebaasi seadistused erinevateks keskkondadeks
module.exports = {
  development: {
    // Kasutajanimi, mida kasutatakse andmebaasiga ühenduse loomiseks (võetakse .env failist)
    username: process.env.DB_USER,
    // Parool, mida kasutatakse andmebaasi autentimiseks (võetakse .env failist)
    password: process.env.DB_PASSWORD,
    // Andmebaasi nimi, millega ühendust luuakse (võetakse .env failist)
    database: process.env.DB_NAME,
    // Andmebaasi serveri host (aadress), millega ühendust luuakse (võetakse .env failist)
    host: process.env.DB_HOST,
    // Kasutatav andmebaasi tüüp (dialekt), antud juhul PostgreSQL
    dialect: 'postgres',
  },
};
