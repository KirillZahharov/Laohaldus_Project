// Ekspordime kesktarkvara (middleware) funktsiooni, mis kontrollib kasutaja rolli
module.exports = (req, res, next) => {
  // Määrame lubatud rollid
  const allowedRoles = ['admin', 'orderSpecialist'];

  // Kontrollime, kas kasutaja on olemas ja kas tema roll kuulub lubatud rollide hulka
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    // Kui mitte, tagastame 403 (Forbidden) staatusega vastuse
    return res.status(403).json({ error: 'Ligipääs keelatud (ainult tellimuse spetsialist või admin)' });
  }

  // Kui kontroll läbitakse, lubame liikuda edasi järgmise route handleri juurde
  next();
};
