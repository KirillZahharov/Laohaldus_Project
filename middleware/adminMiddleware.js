// Ekspordime kesktarkvara (middleware) funktsiooni, mis kontrollib, kas kasutaja on admin
module.exports = (req, res, next) => {
  // Kontrollime, kas sisseloginud kasutaja roll on 'admin'
  if (req.user.role !== 'admin') {
    // Kui pole admin, tagastame 403 (Forbidden) staatusega vastuse
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  
  // Kui kasutaja on admin, lubame tal liikuda edasi järgmise route handleri juurde
  next();
};
