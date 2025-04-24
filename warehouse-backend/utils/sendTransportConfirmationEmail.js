const nodemailer = require('nodemailer');
require('dotenv').config();

const sendTransportConfirmationEmail = async (toEmail, orderId, scheduledDate) => {
  const message = `Tere!

Teie transporditellimus #${orderId} on kinnitatud. Transport saabub aadressile vastavalt broneeringule.

Planeeritud saabumisaeg: ${new Date(scheduledDate).toLocaleString('et-EE')}

Kui Teil on küsimusi või soovite aega muuta, võtke palun ühendust meie klienditoega.

Lugupidamisega,  
Laohaldus meeskond`;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: '"Laohaldus süsteem" <no-reply@warehouse.test>',
    to: toEmail,
    subject: `Transpordi kinnitus – Tellimus #${orderId}`,
    text: message
  });

  console.log(`✅ Transpordi kinnitus saadetud: ${toEmail}`);
};

module.exports = sendTransportConfirmationEmail;
