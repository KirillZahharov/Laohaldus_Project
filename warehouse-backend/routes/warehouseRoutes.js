const express = require('express');
const router = express.Router();
const { Warehouse } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Laoruumide haldus
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Väljasta kõik saadaval laoruumid
 *     tags: [Warehouses]
 *     responses:
 *       200:
 *         description: Edukas päring
 */
router.get('/', async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isAvailable: true },
    });
    res.json(warehouses);
  } catch (err) {
    console.error("❌ Lao laadimise viga:", err);
    res.status(500).json({ error: "Serveri viga" });
  }
});

/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Väljasta konkreetse laoruumi andmed ID alusel
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Laoruumi ID
 *     responses:
 *       200:
 *         description: Laoruumi andmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 area:
 *                   type: number
 *                 height:
 *                   type: number
 *                 temperatureControlled:
 *                   type: string
 *                 availableFrom:
 *                   type: string
 *                   format: date
 *                 isAvailable:
 *                   type: boolean
 *       404:
 *         description: Laoruumi ei leitud
 */

router.get('/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) return res.status(404).json({ error: 'Ladu ei leitud' });
    res.json(warehouse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});


/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Lisa uus laoruum (ainult adminile)
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - area
 *               - height
 *               - temperatureControlled
 *               - availableFrom
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               area:
 *                 type: number
 *               height:
 *                 type: number
 *               temperatureControlled:
 *                 type: string
 *                 enum: [cold, warm]
 *               availableFrom:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Laoruum loodud
 *       400:
 *         description: Vigane sisend
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json(warehouse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
