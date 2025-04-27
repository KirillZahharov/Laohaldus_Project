const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// MODELS
const { Order, TransportOrder, Client, Warehouse } = require('../models');

// MIDDLEWARE
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const orderMiddleware = require('../middleware/orderSpecialistMiddleware');

// EMAIL JA PDF UTILIIDID
const sendInvoiceEmail = require('../utils/sendInvoiceEmail');
const sendReminderEmail = require('../utils/sendReminderEmail');
const { generateInvoice, generateFinalInvoice, generatePreInvoice } = require('../utils/invoiceGenerator');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Tellimuste haldus
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tee uus tellimus (klient)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouseId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               transportNeeded:
 *                 type: boolean
 *               dimensions:
 *                 type: string
 *               weight:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *               pickupAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tellimus loodud
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      warehouseId,
      startDate,
      endDate,
      transportNeeded,
      dimensions,
      weight,
      totalPrice,
      pickupAddress
    } = req.body;

    // Leia seotud klient ja ladu
    const client = await Client.findOne({ where: { userId: req.user.id } });
    if (!client) {
      return res.status(400).json({ error: 'Kliendi profiili pole veel täidetud' });
    }

    const warehouse = await Warehouse.findByPk(warehouseId);
    if (!warehouse || !warehouse.isAvailable) {
      return res.status(400).json({ error: 'Valitud laoruum ei ole saadaval' });
    }

    // Broneeri laoruum
    warehouse.isAvailable = false;
    await warehouse.save();
    console.log(`Laokoht #${warehouse.id} broneeritud`);

    // Loo tellimus koos valitud snapshot väljadega
    const order = await Order.create({
      userId: req.user.id,
      clientId: client.id,
      warehouseId,
      startDate,
      endDate,
      transportNeeded,
      dimensions,
      weight,
      totalPrice,
      pickupAddress,

      //  Snapshotid — ainult vajalikud andmed
      clientSnapshot: {
        clientName: client.clientName,
        firstName: client.firstName,
        lastName: client.lastName,
        address: client.address,
        city: client.city,
        email: client.email,
        phone: client.phone
      },
      warehouseSnapshot: {
        name: warehouse.name,
        address: warehouse.address,
        imageFilename: warehouse.imageFilename
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(' Tellimuse loomine ebaõnnestus:', err);
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Väljasta kõik tellimused (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kõik tellimused
 */
router.get('/', authMiddleware, orderMiddleware, async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
});


/**
 * @swagger
 * /api/orders/pending:
 *   get:
 *     summary: Väljasta kõik pending tellimused (admin või tellimuste spetsialist)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending tellimused
 */
router.get('/pending', authMiddleware, orderMiddleware, async (req, res) => {
  const orders = await Order.findAll({ where: { status: 'pending' } });
  res.json(orders);
});

/**
 * @swagger
 * /api/orders/{id}/confirm:
 *   put:
 *     summary: Tellimuse kinnitamine spetsialisti või administraatori poolt
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tellimuse ID, mida kinnitada
 *     responses:
 *       200:
 *         description: Tellimus kinnitatud ja ettemaksuarve saadetud kliendile e-posti teel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tellimus kinnitatud ja ettemaksuarve saadetud.
 *                 invoiceFile:
 *                   type: string
 *                   example: Ettemaksuarve_LA001.pdf
 *       400:
 *         description: Viga kliendi leidmisel
 *       404:
 *         description: Tellimust ei leitud
 *       500:
 *         description: Serveri viga
 */

router.put('/:id/confirm', authMiddleware, orderMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Tellimus ei leitud' });

    // Uuenda tellimuse staatust ja kuupäevi
    order.status = 'confirmed';

    const start = new Date();
    const actualStartDate = order.transportNeeded
      ? new Date(start.setDate(start.getDate() + 3))
      : new Date();
    const actualEndDate = new Date(actualStartDate);
    actualEndDate.setDate(actualStartDate.getDate() + 30);

    order.actualStartDate = actualStartDate;
    order.actualEndDate = actualEndDate;

    const paymentDeadline = new Date();
    paymentDeadline.setDate(paymentDeadline.getDate() + 5);
    order.paymentDeadline = paymentDeadline;

    await order.save();

    // Leia kliendi info
    const client = await Client.findOne({ where: { userId: order.userId } });
    if (!client) return res.status(400).json({ error: 'Kliendi profiili ei leitud' });

    // Genereeri ettemaksuarve number ja failitee
    const invoiceCounterPath = path.join(__dirname, '../utils/invoiceCounter.json');
    let counterData = JSON.parse(fs.readFileSync(invoiceCounterPath));
    counterData.counter += 1;
    const invoiceNumber = String(counterData.counter).padStart(3, '0');
    fs.writeFileSync(invoiceCounterPath, JSON.stringify(counterData, null, 2));

    const fileName = `Ettemaksuarve_LA${invoiceNumber}.pdf`;
    const filePath = path.join(__dirname, `../preinvoices/${fileName}`);

    // Genereeri PDF
    generatePreInvoice(order, client, filePath, invoiceNumber);

    // Saada e-mail
    await sendInvoiceEmail(client.email, filePath, true); // true = ettemaksuarve

    console.log(`Ettemaksuarve saadetud: ${fileName}`);

    res.json({
      message: 'Tellimus kinnitatud ja ettemaksuarve saadetud.',
      invoiceFile: fileName
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/orders/{id}/pay:
 *   put:
 *     summary: Klient kinnitab makse ja saab arve e-postile
 *     tags: [Orders]
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
 *         description: Makse kinnitatud, arve saadetud
 */
router.put('/:id/pay', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Tellimus ei leitud' });

    // Kontrolli õigust
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Ligipääs keelatud' });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Ainult kinnitatud tellimust saab maksta' });
    }

    // Määra tellimus makstuks
    order.status = 'paid';
    await order.save();

    // Leia klient
    const client = await Client.findOne({ where: { userId: order.userId } });
    if (!client) return res.status(400).json({ error: 'Kliendi profiili ei leitud' });

    // Leia laoruum
    const warehouse = await order.getWarehouse();

    // Genereeri sama arvenumber nagu ettemaksuarvel
    const counterData = JSON.parse(fs.readFileSync(path.join(__dirname, '../utils/invoiceCounter.json')));
    const invoiceNumber = `LA${String(counterData.counter).padStart(3, '0')}`;

    // Genereeri ja saada lõpparve
    const { filePath, filename } = generateFinalInvoice(order, client, invoiceNumber);
    await sendInvoiceEmail(client.email, filePath, false); // false = lõpparve
    console.log(` Lõpparve saadetud: ${filename} aadressile ${client.email}`);

    // Märgi laoruum broneerituks
    warehouse.isAvailable = false;
    await warehouse.save();

    // Kui vaja transporti
    if (order.transportNeeded) {
      const scheduledDate = order.actualStartDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // fallback 7 päeva pärast

      const warehouseSnapshot = {
        name: warehouse.name,
        address: warehouse.address,
        imageFilename: warehouse.imageFilename,
      };

      const clientSnapshot = {
        clientName: client.clientName || `${client.firstName} ${client.lastName}`,
        address: client.address,
        city: client.city,
        phone: client.phone,
        email: client.email,
      };

      await TransportOrder.create({
        orderId: order.id,
        pickupAddress: order.pickupAddress,
        scheduledDate,
        status: 'pending',
        type: 'inbound',
        clientSnapshot,
        warehouseSnapshot
      });

      console.log(` Inbound transporditellimus loodud (tellimus #${order.id})`);
    }

    res.json({ message: 'Makse kinnitatud ja arve saadetud!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});




/**
 * @swagger
 * /api/orders/reminders:
 *   get:
 *     summary: Meeldetuletused ja transporditellimused enne ladustamise lõppu
 *     description: Saadab meeldetuletused 5 päeva enne ja loob transporditellimuse 3 päeva enne lõppu, kui vajalik
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meeldetuletused ja transporditellimused kontrollitud
 */

router.get('/reminders', authMiddleware, adminMiddleware, async (req, res) => {
  const today = new Date();
  const inFiveDays = new Date(today);
  inFiveDays.setDate(today.getDate() + 5);

  const inThreeDays = new Date(today);
  inThreeDays.setDate(today.getDate() + 3);

  let reminderCount = 0;
  let transportCount = 0;

  try {
    // 1. Meeldetuletused
    const ordersToRemind = await Order.findAll({
      where: {
        status: 'paid',
        actualEndDate: {
          [Op.between]: [today, inFiveDays]
        },
        reminderSent: false
      }
    });

    for (const order of ordersToRemind) {
      order.reminderSent = true;
      await order.save();

      // Saada e-kiri
      await sendReminderEmail(order.clientSnapshotEmail, order.id, order.actualEndDate);

      console.log(`Meeldetuletus saadetud (tellimus #${order.id})`);
      reminderCount++;
    }

    // 2. Outbound transpordi korraldamine
    const ordersForTransport = await Order.findAll({
      where: {
        status: 'paid',
        transportNeeded: true,
        actualEndDate: {
          [Op.between]: [today, inThreeDays]
        }
      }
    });

    for (const order of ordersForTransport) {
      const existingOutbound = await TransportOrder.findOne({
        where: {
          orderId: order.id,
          type: 'outbound'
        }
      });

      if (!existingOutbound) {
        const warehouse = await order.getWarehouse();
        await TransportOrder.create({
          orderId: order.id,
          pickupAddress: warehouse.address,
          scheduledDate: order.actualEndDate,
          status: 'scheduled',
          type: 'outbound'
        });

        console.log(`Outbound transporditellimus loodud (tellimus #${order.id})`);
        transportCount++;
      }
    }

    res.json({
      message: 'Kontroll tehtud',
      remindersSent: reminderCount,
      transportOrdersCreated: transportCount
    });

  } catch (error) {
    console.error('Viga meeldetuletuste või transpordi loomisel:', error.message);
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/orders/expire-check:
 *   get:
 *     summary: Kontrollib maksetähtaega ja märgib aegunud tellimused
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kontroll tehtud
 */
router.get('/expire-check', async (req, res) => {
  try {
    const today = new Date();

    const expiredOrders = await Order.findAll({
      where: {
        status: 'confirmed',
        paymentDeadline: {
          [Op.lt]: today
        }
      }
    });

    let released = 0;

    for (const order of expiredOrders) {
      order.status = 'expired';
      await order.save();

      const warehouse = await order.getWarehouse();
      warehouse.isAvailable = true;
      await warehouse.save();

      released++;
    }

    res.json({
      message: 'Aegunud tellimused töödeldud',
      releasedOrders: released
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}/extend-request:
 *   put:
 *     summary: Klient taotleb tellimuse pikendamist
 *     tags: [Orders]
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
 *               - extraDays
 *             properties:
 *               extraDays:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Pikenduse taotlus salvestatud ja arve loodud
 */
router.put('/:id/extend-request', authMiddleware, async (req, res) => {
  const { extraDays } = req.body;

  try {
    // Kontroll: extraDays olemasolu
    if (!extraDays || typeof extraDays !== 'number') {
      return res.status(400).json({ error: 'extraDays puudub või pole number' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Tellimus ei leitud' });

    // Ligipääsu kontroll
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Ligipääs keelatud' });
    }

    // Eelmine pikendus pole veel makstud
    if (order.extensionRequested && !order.extensionPaid) {
      return res.status(400).json({ error: 'Eelmine pikendus pole veel makstud' });
    }

    // Arvutused
    const oldEnd = order.actualEndDate || order.endDate;
    const newEndDate = new Date(oldEnd);
    newEndDate.setDate(newEndDate.getDate() + extraDays);

    const pricePerDay = order.totalPrice / 30;
    const extensionPrice = Math.round(pricePerDay * extraDays);

    // LOGID
    console.log(' Pikenduse arvutus:', {
      totalPrice: order.totalPrice,
      extraDays,
      pricePerDay,
      extensionPrice
    });

    // Genereeri uus arve number
    const invoiceCounterPath = path.join(__dirname, '../utils/invoiceCounter.json');
    let counterData = JSON.parse(fs.readFileSync(invoiceCounterPath));
    counterData.counter += 1;
    const invoiceNumber = `EXT${String(counterData.counter).padStart(3, '0')}`;
    fs.writeFileSync(invoiceCounterPath, JSON.stringify(counterData, null, 2));

    // Uuenda tellimust
    order.newEndDate = newEndDate;
    order.extensionRequested = true;
    order.extensionPaid = false;
    order.extensionPrice = extensionPrice;
    order.extensionInvoiceNumber = invoiceNumber;
    await order.save();

    console.log(' Tellimus uuendatud extensionPrice-ga:', extensionPrice);

    const client = await Client.findOne({ where: { userId: order.userId } });
    if (!client) return res.status(404).json({ error: 'Klienti ei leitud' });

    const fileName = `Ettemaksuarve_Pikendus_${invoiceNumber}.pdf`;
    const filePath = path.join(__dirname, `../preinvoices/${fileName}`);

    generatePreInvoice(order, client, filePath, invoiceNumber);
    await sendInvoiceEmail(client.email, filePath, true);

    console.log(` Pikenduse arve saadetud (${invoiceNumber}) e-postile: ${client.email}`);

    res.json({
      message: 'Pikenduse ettemaksuarve saadetud',
      newEndDate,
      extensionPrice
    });
  } catch (err) {
    console.error(' Pikenduse taotlus error:', err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/orders/{id}/extend-pay:
 *   put:
 *     summary: Klient maksab tellimuse pikenduse eest
 *     description: Kui klient on taotlenud pikendust, saab ta selle kaudu maksta ning süsteem uuendab ladustamise lõppkuupäeva.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tellimuse ID
 *     responses:
 *       200:
 *         description: Pikendus tasutud ja lõpparve saadetud
 *       400:
 *         description: Pikendust ei ole taotletud või info puudub
 *       403:
 *         description: Ligipääs keelatud
 *       404:
 *         description: Tellimus ei leitud
 */


router.put('/:id/extend-pay', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Tellimus ei leitud' });
    if (order.userId !== req.user.id) return res.status(403).json({ error: 'Ligipääs keelatud' });

    // Kontrollime, kas pikendus on taotletud
    if (!order.extensionRequested || !order.newEndDate || typeof order.extensionPrice !== 'number') {
      return res.status(400).json({
        error: 'Pikendust ei ole taotletud või puudub info',
        debug: {
          extensionRequested: order.extensionRequested,
          newEndDate: order.newEndDate,
          extensionPrice: order.extensionPrice
        }
      });
    }

    // Kontrolli, kas arvenumber on olemas
    const invoiceNumber = order.extensionInvoiceNumber;
    if (!invoiceNumber) {
      return res.status(400).json({ error: 'Arvenumber puudub – taotle pikendust uuesti' });
    }

    // Märgi pikendus makstuks ja uuenda lõpukuupäev
    order.actualEndDate = order.newEndDate;
    order.extensionRequested = false;
    order.extensionPaid = true;
    await order.save();

    console.log(` Tellimus #${order.id} uuendatud: pikendus makstud, uus lõpp: ${order.actualEndDate}`);

    // Leia klient
    const client = await Client.findOne({ where: { userId: order.userId } });
    if (!client) return res.status(400).json({ error: 'Kliendi profiili ei leitud' });

    // Genereeri arve ja saada e-kiri
    try {
      const { filePath, filename } = generateFinalInvoice(order, client, invoiceNumber);
      console.log(` Lõpparve genereeritud: ${filePath}`);

      await sendInvoiceEmail(client.email, filePath, false);
      console.log(` Lõpparve saadetud (${filename}) aadressile: ${client.email}`);
    } catch (invoiceError) {
      console.error(' Lõpparve genereerimine või saatmine ebaõnnestus:', invoiceError.message);
    }

    // Kui transport vajalik – loo uus outbound transporditellimus
    if (order.transportNeeded) {
      const existingOutbound = await TransportOrder.findOne({
        where: { orderId: order.id, type: 'outbound' }
      });
      if (existingOutbound) {
        await existingOutbound.destroy();
        console.log(` Vana outbound transport eemaldatud: tellimus #${order.id}`);
      }

      const warehouse = await order.getWarehouse();
      await TransportOrder.create({
        orderId: order.id,
        pickupAddress: warehouse.address,
        scheduledDate: order.actualEndDate,
        status: 'scheduled',
        type: 'outbound'
      });

      console.log(` Uus outbound transporditellimus loodud: tellimus #${order.id}`);
    }

    res.json({ message: 'Pikenduse makse kinnitatud ja lõpparve saadetud' });

  } catch (err) {
    console.error(' Extend-Pay viga:', err.message);
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Tagastab kasutaja või kliendi tellimused
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tellimused tagastatud
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    console.log("Logitud kasutaja:", req.user);

    let orders = [];

    if (req.user.role === 'user') {
      // Leia kliendi profiil
      const client = await Client.findOne({ where: { userId: req.user.id } });
      if (!client) {
        return res.status(404).json({ error: 'Kliendi profiili ei leitud' });
      }

      // Leia kõik tellimused, mis on seotud selle kliendiga
      orders = await Order.findAll({
        where: { clientId: client.id },
        order: [['id', 'DESC']],
        include: [
          {
            model: TransportOrder,
            as: 'transportOrder', // peab ühtima seose alias-nimega
            attributes: ['type', 'status', 'scheduledDate']
          },
        ]
      });

    } else {
      // Adminid või spetsialistid võivad saada kõik tellimused, mille nad on loonud
      orders = await Order.findAll({
        where: { userId: req.user.id },
        order: [['id', 'DESC']]
      });
    }

    res.json(orders);
  } catch (err) {
    console.error('Viga tellimuste laadimisel:', err);
    res.status(500).json({ error: 'Tellimuste laadimine ebaõnnestus' });
  }
});


/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Klient tühistab tellimuse (võimalik ainult 2 päeva jooksul)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tellimuse ID
 *     responses:
 *       200:
 *         description: Tellimus tühistatud
 *       400:
 *         description: Tühistamine ei ole lubatud
 *       403:
 *         description: Ligipääs keelatud
 *       404:
 *         description: Tellimust ei leitud
 */
router.put('/:id/cancel', authMiddleware, orderMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Tellimus ei leitud' });

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Ligipääs keelatud' });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Ainult pending või confirmed tellimust saab tühistada' });
    }

    const createdDate = new Date(order.createdAt);
    const now = new Date();
    const diffInHours = (now - createdDate) / (1000 * 60 * 60);

    if (diffInHours > 48) {
      return res.status(400).json({ error: 'Tühistamine on lubatud ainult 2 päeva jooksul' });
    }

    order.status = 'cancelled';
    await order.save();

    const warehouse = await Warehouse.findByPk(order.warehouseId);
    if (warehouse) {
      warehouse.isAvailable = true;
      await warehouse.save();
    }

    res.json({ message: 'Tellimus tühistatud' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tühistamine ebaõnnestus' });
  }
});

/**
 * @swagger
 * /api/orders/archive:
 *   get:
 *     summary: Väljasta kinnitatud, makstud, aegunud ja tühistatud tellimuste arhiiv
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tellimuste arhiiv tagastatud
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   clientName:
 *                     type: string
 *                   warehouseName:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/archive', authMiddleware, orderMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: ['confirmed', 'paid', 'expired', 'cancelled']
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: Client, attributes: ['clientName'] },
        { model: Warehouse, attributes: ['name'] }
      ]
    });

    res.json(orders);
  } catch (err) {
    console.error(' Arhiivi tellimuste laadimine ebaõnnestus:', err);
    res.status(500).json({ error: 'Serveri viga' });
  }
});

module.exports = router;
