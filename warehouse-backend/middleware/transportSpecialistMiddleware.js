module.exports = (req, res, next) => {
    const allowedRoles = ['admin', 'transportSpecialist'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ligipääs keelatud (ainult transpordispetsialist või admin)' });
    }
    next();
  };
  