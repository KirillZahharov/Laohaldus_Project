const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laohaldussüsteem API',
      version: '1.0.0',
      description: 'API dokumentatsioon laohaldussüsteemile'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Arendusserver'
      }
    ]
  },
  apis: ['./routes/*.js'] // autodokumenteerib route-failidest
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
