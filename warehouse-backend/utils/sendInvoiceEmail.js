const nodemailer = require('nodemailer');
require('dotenv').config();

const sendInvoiceEmail = async (toEmail, invoicePath, isPreInvoice = false) => {
  const subject = isPreInvoice
    ? 'Ettemaksuarve – Teie tellimus'
    : 'Arve – Tellimus tasutud';

  const message = isPreInvoice
    ? `Ettemaksuarve on lisatud manusena. Palume tasuda arve õigeaegselt. 
Kui Teil on küsimusi või soovite tellimust pikendada, saate seda teha oma kliendialas.
Lugupidamisega, 
Laohaldus meeskond.`
    : `Arve on lisatud manusena. Aitäh makse eest! 
Kui soovite tellimust pikendada, logige sisse oma kliendialasse.
Lugupidamisega,
Laohaldus meeskond.`;

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
      from: '"Laohaldus süsteem" <no-reply@warehouse.test>',
      to: toEmail,
      subject,
      text: message,
      attachments: [
        {
          filename: invoicePath.split('/').pop(), // failinimi näiteks: Ettemaksuarve_LA012.pdf
          path: invoicePath
        }
      ]
    });

    console.log(`✅ ${subject} saadetud e-postile: ${toEmail}`);
  } catch (err) {
    console.error('❌ E-kirja saatmise viga:', err.message);
    throw err; // Viskame edasi orderRoutes.js jaoks
  }
};

module.exports = sendInvoiceEmail;
