const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendReminderEmail(to, orderId, endDate) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Laohaldus" <noreply@warehouse-system.com>',
    to,
    subject: `Meeldetuletus: Tellimus #${orderId} lõpeb peagi`,
    text: `Tere!

Teie ladustamise periood tellimusele #${orderId} lõpeb kuupäeval: ${new Date(endDate).toLocaleDateString()}.

Kui soovite teenust pikendada, logige sisse oma iseteenindusse ja valige tellimuse pikendamine. Muul juhul palun kaba järgi tulla viimase päeva jooksul, 
või kui valisite transporditeenust, siis transport korraldatakse automaatselt sama aadressile kust kaup oli vastu võetud. Kui te soovite muuta toimetamise aadressi, 
palun andke meile teada vähemalt 24H jooksul. 

Parimate soovidega,  
Laohaldusmeeskond`
  };

  await transporter.sendMail(mailOptions);
  console.log(`Meeldetuletus saadetud aadressile ${to}`);
}

module.exports = sendReminderEmail;
