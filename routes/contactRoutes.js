// Impordime Expressi ja loome routeri
const express = require('express');
const router = express.Router();

// Impordime Nodemailer'i meilide saatmiseks
const nodemailer = require('nodemailer');

// Laeme keskkonnamuutujad (.env failist)
require('dotenv').config();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Saada kontaktivormi sõnum
 *     tags:
 *       - Kontakt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Petja
 *               email:
 *                 type: string
 *                 example: petja@example.com
 *               message:
 *                 type: string
 *                 example: Tere, soovin lisainfot teie teenuste kohta.
 *     responses:
 *       200:
 *         description: Sõnum saadetud edukalt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sõnum saadetud edukalt!
 *       400:
 *         description: Sisendis puuduvad vajalikud väljad
 *       500:
 *         description: Midagi läks valesti meili saatmisel
 */

// POST /api/contact – kontaktivormi sõnumi saatmine
router.post('/', async (req, res) => {
  // Võtame requesti body'st andmed
  const { name, email, message } = req.body;

  // Kontrollime, et kõik kohustuslikud väljad oleksid täidetud
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Kõik väljad on kohustuslikud' });
  }

  // Loome Nodemailer transporteri SMTP serveri andmetega
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // SMTP serveri aadress (nt Mailtrap)
    port: process.env.MAIL_PORT, // SMTP serveri port
    auth: {
      user: process.env.MAIL_USER, // SMTP kasutajanimi
      pass: process.env.MAIL_PASS  // SMTP parool
    }
  });

  try {
    // Saadame emaili määratud aadressile
    await transporter.sendMail({
      from: process.env.MAIL_FROM,         // Saatja e-mail (näidatakse kliendile)
      to: process.env.MAIL_RECIPIENT,      // Sõnum saadetakse sellele aadressile (nt firma info@laohaldus.ee)
      replyTo: email,                      // Kui vastatakse, läheb see kliendi e-mailile
      subject: 'Uus kontaktivorm',         // Meili pealkiri
      text: `Nimi: ${name}\nE-post: ${email}\n\nSõnum:\n${message}` // Meili sisu
    });

    // Kui kõik õnnestus, saadame edukuse teate
    res.json({ message: 'Sõnum saadetud edukalt!' });
  } catch (err) {
    console.error(' Meili saatmise viga:', err);
    res.status(500).json({ error: 'Midagi läks valesti meili saatmisel' });
  }
});

// Ekspordime routeri, et kasutada seda serveris
module.exports = router;
