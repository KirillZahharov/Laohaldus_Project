const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const Order = require('../models/order');
const Warehouse = require('../models/warehouse');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @swagger
 * /api/statistics/summary:
 *   get:
 *     summary: Admin statistika ülevaade
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiline kokkuvõte
 */
router.get('/summary', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const paidOrders = await Order.count({ where: { status: 'paid' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });

    const avgDurationResult = await Order.findAll({
      attributes: [
        [fn('AVG', literal("DATE_PART('day', \"actualEndDate\" - \"actualStartDate\")")), 'avgDuration']
      ],
      where: {
        actualStartDate: { [Op.ne]: null },
        actualEndDate: { [Op.ne]: null }
      },
      raw: true
    });
    const avgDuration = parseFloat(avgDurationResult[0].avgDuration || 0).toFixed(1);

    const activeOrders = await Order.count({
      where: {
        status: 'paid',
        actualStartDate: { [Op.lte]: new Date() },
        actualEndDate: { [Op.gte]: new Date() }
      }
    });

    const usedWarehouses = await Warehouse.count({ where: { isAvailable: false } });

    res.json({
      totalOrders,
      paidOrders,
      completedOrders,
      averageStorageDays: avgDuration,
      activeOrders,
      usedWarehouses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/statistics/range:
 *   get:
 *     summary: Statistika kindla ajavahemiku kohta
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Statistika antud vahemiku kohta
 */
router.get('/range', authMiddleware, adminMiddleware, async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Start ja end kuupäev on vajalikud' });
  }

  try {
    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgDuration = orders.reduce((sum, o) => {
      if (o.actualStartDate && o.actualEndDate) {
        const days = (new Date(o.actualEndDate) - new Date(o.actualStartDate)) / (1000 * 60 * 60 * 24);
        return sum + days;
      }
      return sum;
    }, 0) / (totalOrders || 1);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      averageDurationDays: avgDuration.toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
* @swagger
* /api/statistics/by-warehouse:
*   get:
*     summary: Statistika laoruumide lõikes
*     tags: [Statistics]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Statistika iga laoruumi kohta
*/
router.get('/by-warehouse', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll();

    const stats = [];

    for (const warehouse of warehouses) {
      const orders = await Order.findAll({
        where: { warehouseId: warehouse.id }
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
      const avgDuration = orders.reduce((sum, o) => {
        if (o.actualStartDate && o.actualEndDate) {
          const days = (new Date(o.actualEndDate) - new Date(o.actualStartDate)) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum;
      }, 0) / (totalOrders || 1);

      stats.push({
        warehouseId: warehouse.id,
        name: warehouse.name,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        averageDurationDays: avgDuration.toFixed(1)
      });
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
* @swagger
* /api/statistics/by-month:
*   get:
*     summary: Statistika tellimuste trend kuude lõikes
*     tags: [Statistics]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Tellimuste arv ja tulu kuude kaupa
*/
router.get('/by-month', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const rawData = await Order.findAll({
      attributes: [
        [fn('TO_CHAR', col('createdAt'), 'YYYY-MM'), 'month'],
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', col('totalPrice')), 'totalRevenue']
      ],
      group: [literal(`month`)],
      order: [[literal(`month`), 'ASC']],
      raw: true
    });

    const result = rawData.map(entry => ({
      month: entry.month,
      orderCount: parseInt(entry.orderCount),
      totalRevenue: parseFloat(entry.totalRevenue).toFixed(2)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
