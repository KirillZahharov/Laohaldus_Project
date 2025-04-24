module.exports = (req, res, next) => {
    const allowedRoles = ['admin', 'orderSpecialist'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ligipääs keelatud (ainult tellimuse spetsialist või admin)' });
    }
    next();
  };
  