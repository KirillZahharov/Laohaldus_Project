const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
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
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Kõik väljad on kohustuslikud' });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_RECIPIENT,
            replyTo: email,
            subject: 'Uus kontaktivorm',
            text: `Nimi: ${name}\nE-post: ${email}\n\nSõnum:\n${message}`
        });

        res.json({ message: 'Sõnum saadetud edukalt!' });
    } catch (err) {
        console.error('❌ Meili saatmise viga:', err);
        res.status(500).json({ error: 'Midagi läks valesti meili saatmisel' });
    }
});

module.exports = router;
