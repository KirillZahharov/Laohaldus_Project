const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Warehouse = require('../models/warehouse');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: Hinnapäring ja vaba laoruumi otsing
 */

/**
 * @swagger
 * /api/quote:
 *   post:
 *     summary: Esita hinnapäring ja leia sobivad vabad laoruumid
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - temperatureControlled
 *               - minArea
 *               - transportNeeded
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *               temperatureControlled:
 *                 type: string
 *                 enum: [cold, warm]
 *               minArea:
 *                 type: number
 *               transportNeeded:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vaste sobivate laoruumide ja hinnaga
 *       500:
 *         description: Serveri viga
 */
router.post('/', async (req, res) => {
  const {
    startDate,
    endDate,
    temperatureControlled,
    minArea,
    transportNeeded
  } = req.body;

  try {
    const availableWarehouses = await Warehouse.findAll({
      where: {
        isAvailable: true,
        temperatureControlled,
        area: { [Op.gte]: minArea },
        availableFrom: { [Op.lte]: new Date(startDate) }
      }
    });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const pricePerDay = temperatureControlled === 'cold' ? 4.0 : 6.0;
    const transportFee = transportNeeded ? 100 : 0;

    const quotes = availableWarehouses.map(warehouse => {
      const storagePrice = warehouse.area * pricePerDay * days;
      const totalPrice = storagePrice + transportFee;

      return {
        warehouseId: warehouse.id,
        name: warehouse.name,
        address: warehouse.address,
        area: warehouse.area,
        temperatureControlled: warehouse.temperatureControlled,
        availableFrom: warehouse.availableFrom,
        priceBreakdown: {
          days,
          storagePrice,
          transportFee,
          totalPrice
        }
      };
    });

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
