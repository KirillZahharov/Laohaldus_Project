const nodemailer = require('nodemailer');
require('dotenv').config();

// Funktsioon e-kirja saatmiseks koos arve manusena
const sendInvoiceEmail = async (toEmail, invoicePath, isPreInvoice = false) => {
  // Määrame meili teema ja sisu sõltuvalt kas tegemist on ettemaksuarvega või lõpparvega
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

  //  Nodemaileriga transpordi seadistamine (Mailtrap või muu SMTP teenus)
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  try {
    //  Saadame meili koos manusena (PDF arve)
    await transporter.sendMail({
      from: '"Laohaldus süsteem" <no-reply@warehouse.test>', // Saatja nimi ja aadress
      to: toEmail, // Saaja e-post
      subject, // E-kirja teema
      text: message, // E-kirja sisu
      attachments: [
        {
          filename: invoicePath.split('/').pop(), // Failinimi (näiteks: Ettemaksuarve_LA012.pdf)
          path: invoicePath // Faili tee serveris
        }
      ]
    });

    console.log(` ${subject} saadetud e-postile: ${toEmail}`);
  } catch (err) {
    console.error(' E-kirja saatmise viga:', err.message);
    throw err; // Viskame vea edasi, et seda saaks käsitleda näiteks orderRoutes.js failis
  }
};

//  Ekspordime funktsiooni kasutamiseks teistes failides
module.exports = sendInvoiceEmail;
