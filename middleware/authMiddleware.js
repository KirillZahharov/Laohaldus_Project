// Impordime JWT teegi ja laeme keskkonnamuutujad (.env failist)
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Ekspordime autentimise kesktarkvara (middleware) funktsiooni
module.exports = (req, res, next) => {
  // Võtame Authorization päise requestist
  const authHeader = req.headers.authorization;

  // Kui Authorization päis puudub, tagastame 401 (Unauthorized) vastuse
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Authorization päis on kujul "Bearer TOKEN", seega võtame teise osa (TOKEN)
  const token = authHeader.split(' ')[1];

  try {
    // Verifitseerime (kontrollime) tokeni kehtivust, kasutades meie JWT salavõtit
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kui token on õige, salvestame kasutaja info requesti külge
    req.user = decoded;

    // Liigume edasi järgmise kesktarkvara või route handleri juurde
    next();
  } catch (err) {
    // Kui token on vigane või aegunud, tagastame 403 (Forbidden) vastuse
    res.status(403).json({ error: 'Invalid token' });
  }
};
