const express = require('express');
const router = express.Router();
const { TransportOrder, Order, Client, Warehouse } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const transportMiddleware = require('../middleware/transportSpecialistMiddleware');
const sendTransportConfirmationEmail = require('../utils/sendTransportConfirmationEmail');

// Kõik transporditellimused
router.get('/', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const orders = await TransportOrder.findAll({ include: ['order'] });
    res.json(orders);
  } catch (err) {
    console.error('❌ Kõikide transporditellimuste laadimisel tekkis viga:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

// Ainult pending
router.get('/pending', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const orders = await TransportOrder.findAll({
      where: {
        status: ['pending', 'scheduled'], // tagastame mõlemad
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ Viga transportOrders/pending:", err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

// Ainult completed
router.get('/completed', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const orders = await TransportOrder.findAll({
      where: { status: 'completed' },
      include: ['order'],
    });
    res.json(orders);
  } catch (err) {
    console.error('❌ Viga completed transporditellimuste laadimisel:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

// Kinnita tellimus
router.put('/:id/confirm', authMiddleware, transportMiddleware, async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const order = await TransportOrder.findByPk(req.params.id);

    if (!order) return res.status(404).json({ error: 'Tellimus puudub' });

    order.status = 'scheduled';
    order.scheduledDate = scheduledDate;
    order.confirmedBy = req.user?.username || 'spetsialist';
    await order.save();

    // Leia seotud tellimus, klient ja lao andmed e-mailiks
    const fullOrder = await order.getOrder();
    const client = await Client.findByPk(fullOrder.clientId);
    const dateObj = new Date(scheduledDate);
    const formatted = dateObj.toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' });

    // ✅ Saada e-kiri
    await sendTransportConfirmationEmail(client.email, order.orderId, scheduledDate, {
      clientName: client.clientName || client.firstName,
      date: formatted,
      address: order.pickupAddress
    });

    res.json({ message: 'Transporditellimus kinnitatud ja e-mail saadetud' });
  } catch (err) {
    console.error("❌ Transport kinnitamine ebaõnnestus:", err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});


// Märgi lõpetatuks
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
    console.error('❌ Lõpetamise viga:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});


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

      console.log('➡️ Loome outbound tellimuse tellimusele:', order.id);

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
    console.error('❌ Outbound tellimuste loomine ebaõnnestus:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

// routes/transportRoutes.js
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


module.exports = router;
