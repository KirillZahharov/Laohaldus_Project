const express = require('express');
const router = express.Router();

// Middleware impordid
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome, admin 123!
 *       403:
 *         description: Ligipääs keelatud
 */
// GET /api/protected/admin-only → Ainult adminitele ligipääsetav route
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome, user 123! Your role is: user
 *       401:
 *         description: Pole sisse logitud
 */
// GET /api/protected/user-dashboard → Ligipääs kõigile sisse logitud kasutajatele
router.get('/user-dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}! Your role is: ${req.user.role}` });
});

// Ekspordime routeri
module.exports = router;
