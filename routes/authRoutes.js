// Impordime Expressi ja loome routeri
const express = require('express');
const router = express.Router();

// Impordime autentimise kontrolleri
const authController = require('../controllers/authController');

/** AUTH ROUTES */
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentimise ja autoriseerimise toimingud
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registreeri uus kasutaja
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               isBusiness:
 *                 type: boolean
 *               companyName:
 *                 type: string
 *               registrationCode:
 *                 type: string
 *               businessEmail:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               vatNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               doorNumber:
 *                 type: string
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kasutaja loodud
 *       400:
 *         description: Vigane sisend
 */
// POST /api/auth/register → Kasutaja registreerimine
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kasutaja sisselogimine
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sisselogimine õnnestus
 *       401:
 *         description: Vale andmed
 */
// POST /api/auth/login → Kasutaja sisselogimine
router.post('/login', authController.login);

// Ekspordime routeri, et seda app.js või server.js failis kasutada
module.exports = router;
