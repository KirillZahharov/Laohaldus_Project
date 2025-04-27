// utils/swagger.js

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swaggeri põhikonfiguratsioon
const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI 3.0 standard
    info: {
      title: 'Laohaldussüsteem API', // Pealkiri
      version: '1.0.0', // Versioon
      description: 'API dokumentatsioon laohaldussüsteemile' // Kirjeldus
    },
    servers: [
      {
        url: 'http://localhost:5000', // Serveri URL
        description: 'Arendusserver'
      }
    ]
  },
  apis: ['./routes/*.js'] // Automaatne dokumentatsioon kõikidest route-failidest
};

// Loo valmis swaggerSpec
const swaggerSpec = swaggerJsdoc(options);

// Funktsioon Swaggeri ühendamiseks Expressi äppiga
function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
