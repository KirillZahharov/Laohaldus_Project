const express = require('express');
const router = express.Router();
const { TransportOrder, Order, Client, Warehouse } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const transportMiddleware = require('../middleware/transportSpecialistMiddleware');
const sendTransportConfirmationEmail = require('../utils/sendTransportConfirmationEmail');

/**
 * @swagger
 * tags:
 *   name: TransportOrders
 *   description: Transporditellimuste haldus
 */

/**
 * @swagger
 * /api/transport-orders:
 *   get:
 *     summary: Kõik transporditellimused (spetsialistidele)
 *     tags: [TransportOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kõik transporditellimused
 */
router.get('/', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const orders = await TransportOrder.findAll({ include: ['order'] });
    res.json(orders);
  } catch (err) {
    console.error(' Kõikide transporditellimuste laadimisel tekkis viga:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/transport-orders/pending:
 *   get:
 *     summary: Pending ja scheduled transporditellimused
 *     tags: [TransportOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending ja scheduled transporditellimused
 */
router.get('/pending', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const orders = await TransportOrder.findAll({
      where: {
        status: ['pending', 'scheduled'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    console.error(" Viga transportOrders/pending:", err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/transport-orders/completed:
 *   get:
 *     summary: Lõpetatud transporditellimused
 *     tags: [TransportOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lõpetatud transporditellimused
 */
router.get('/completed', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const orders = await TransportOrder.findAll({
      where: { status: 'completed' },
      include: ['order'],
    });
    res.json(orders);
  } catch (err) {
    console.error(' Viga completed transporditellimuste laadimisel:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/transport-orders/{id}/confirm:
 *   put:
 *     summary: Kinnita transporditellimus ja määra aeg
 *     tags: [TransportOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledDate
 *             properties:
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Transporditellimus kinnitatud ja e-mail saadetud
 */
router.put('/:id/confirm', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const order = await TransportOrder.findByPk(req.params.id);

    if (!order) return res.status(404).json({ error: 'Tellimus puudub' });

    order.status = 'scheduled';
    order.scheduledDate = scheduledDate;
    order.confirmedBy = req.user?.username || 'spetsialist';
    await order.save();

    const fullOrder = await order.getOrder();
    const client = await Client.findByPk(fullOrder.clientId);
    const dateObj = new Date(scheduledDate);
    const formatted = dateObj.toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' });

    await sendTransportConfirmationEmail(client.email, order.orderId, scheduledDate, {
      clientName: client.clientName || client.firstName,
      date: formatted,
      address: order.pickupAddress
    });

    res.json({ message: 'Transporditellimus kinnitatud ja e-mail saadetud' });
  } catch (err) {
    console.error(" Transport kinnitamine ebaõnnestus:", err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/transport-orders/{id}/complete:
 *   put:
 *     summary: Märgi transporditellimus lõpetatuks
 *     tags: [TransportOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transporditellimus lõpetatud
 */
router.put('/:id/complete', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const order = await TransportOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Tellimus puudub' });

    order.status = 'completed';
    order.completedBy = req.user?.username || 'spetsialist';
    order.completedAt = new Date();
    await order.save();

    res.json({ message: 'Transporditellimus lõpetatud', order });
  } catch (err) {
    console.error(' Lõpetamise viga:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/transport-orders/generate-outbound:
 *   get:
 *     summary: Genereeri automaatselt outbound transporditellimused
 *     tags: [TransportOrders]
 *     responses:
 *       200:
 *         description: Outbound transporditellimused loodud
 */
router.get('/generate-outbound', async (req, res) => {
  try {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);

    const expiringOrders = await Order.findAll({
      where: {
        status: 'paid',
        endDate: targetDate,
        transportNeeded: true
      },
      include: [Client, Warehouse]
    });

    const created = [];

    for (const order of expiringOrders) {
      const existing = await TransportOrder.findOne({
        where: {
          orderId: order.id,
          type: 'outbound'
        }
      });

      if (existing) continue;

      console.log(' Loome outbound tellimuse tellimusele:', order.id);

      const outbound = await TransportOrder.create({
        orderId: order.id,
        pickupAddress: order.warehouseSnapshot?.address || order.pickupAddress || '—',
        status: 'pending',
        type: 'outbound',
        scheduledDate: order.endDate || new Date(),
        clientSnapshot: order.clientSnapshot || {},
        warehouseSnapshot: order.warehouseSnapshot || {}
      });

      created.push(outbound.id);
    }

    res.json({ message: 'Loodud outbound transporditellimused', created });
  } catch (err) {
    console.error(' Outbound tellimuste loomine ebaõnnestus:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

/**
 * @swagger
 * /api/transport-orders/by-order/{orderId}:
 *   get:
 *     summary: Leia transporditellimus konkreetse Order ID põhjal
 *     tags: [TransportOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transporditellimus leitud
 */
router.get('/by-order/:orderId', authMiddleware, async (req, res) => {
  try {
    const transportOrder = await TransportOrder.findOne({
      where: { orderId: req.params.orderId },
      attributes: ['id', 'type', 'status', 'scheduledDate'],
    });

    if (!transportOrder) {
      return res.status(404).json({ message: 'Transporti ei leitud' });
    }

    res.json(transportOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

// Ekspordime routeri
module.exports = router;
