// Ekspordime kesktarkvara (middleware) funktsiooni, mis kontrollib kasutaja rolli
module.exports = (req, res, next) => {
  // Määrame rollid, kellel on lubatud ligipääs
  const allowedRoles = ['admin', 'transportSpecialist'];

  // Kontrollime, kas kasutaja on olemas ja kas tema roll kuulub lubatud rollide hulka
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    // Kui kasutaja ei vasta nõuetele, tagastame 403 (Forbidden) vastuse
    return res.status(403).json({ error: 'Ligipääs keelatud (ainult transpordispetsialist või admin)' });
  }

  // Kui kõik on korras, liigume edasi järgmise kesktarkvara või route handleri juurde
  next();
};
