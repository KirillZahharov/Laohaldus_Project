const express = require('express');
const router = express.Router();
const { Client } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Kliendi profiili haldus
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Lisa kliendiprofiil (kasutaja seos)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - phone
 *               - email
 *               - address
 *               - city
 *               - region
 *               - postalCode
 *               - country
 *             properties:
 *               clientName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isBusiness:
 *                 type: boolean
 *               companyName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               vatNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profiil loodud
 */
router.post('/', async (req, res) => {
  try {
    const existing = await Client.findOne({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(400).json({ error: 'Profiil on juba olemas' });
    }

    const client = await Client.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/clients/me:
 *   get:
 *     summary: Vaata oma kliendiprofiili
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Edukas profiili tagastus
 *       404:
 *         description: Profiili ei leitud
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = await Client.findOne({ where: { userId } });
    if (!client) {
      return res.status(404).json({ error: 'Klient puudub' });
    }
    res.json(client);
  } catch (err) {
    console.error('❌ Kliendi laadimise viga:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/clients/me:
 *   put:
 *     summary: Uuenda oma kliendiprofiili
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               companyName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               vatNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profiil uuendatud
 */
router.put('/me', authMiddleware, async (req, res) => {
  const client = await Client.findOne({ where: { userId: req.user.id } });
  if (!client) return res.status(404).json({ error: 'Profiili ei leitud' });

  Object.assign(client, req.body);
  await client.save();

  res.json(client);
});

module.exports = router;
