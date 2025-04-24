const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @swagger
 * tags:
 *   name: Protected
 *   description: Kaitstud test-route’id (rollide kontrollimiseks)
 */

/**
 * @swagger
 * /api/protected/admin-only:
 *   get:
 *     summary: Ainult administraatorile (testimiseks)
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tere tulemast, admin!
 *       403:
 *         description: Ligipääs keelatud
 */
router.get('/admin-only', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: `Welcome, admin ${req.user.id}!` });
});

/**
 * @swagger
 * /api/protected/user-dashboard:
 *   get:
 *     summary: Ligipääs igale autentitud kasutajale (admin või tavakasutaja)
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tere tulemast, kasutaja!
 *       401:
 *         description: Pole sisse logitud
 */
router.get('/user-dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}! Your role is: ${req.user.role}` });
});

module.exports = router;
