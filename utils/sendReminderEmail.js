const nodemailer = require('nodemailer');
require('dotenv').config();

//  Funktsioon saadab kliendile meeldetuletuse, et tema ladustamisperiood lõpeb varsti
async function sendReminderEmail(to, orderId, endDate) {
  //  Nodemailer transporteri seadistamine SMTP andmetega (.env failist)
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  //  Määrame meili saatmise andmed
  const mailOptions = {
    from: '"Laohaldus" <noreply@warehouse-system.com>', // Saatja nimi ja aadress
    to, // Saaja e-posti aadress
    subject: `Meeldetuletus: Tellimus #${orderId} lõpeb peagi`, // Meili teema
    text: `Tere!

Teie ladustamise periood tellimusele #${orderId} lõpeb kuupäeval: ${new Date(endDate).toLocaleDateString()}.

Kui soovite teenust pikendada, logige sisse oma iseteenindusse ja valige tellimuse pikendamine. 
Muul juhul palun tulla kaupadele järele viimase päeva jooksul. 
Kui valisite transporditeenuse, korraldatakse transport automaatselt samale aadressile, kust kaup vastu võeti. 
Kui soovite muuta toimetamise aadressi, palun andke meile teada vähemalt 24 tunni jooksul.

Parimate soovidega,  
Laohaldusmeeskond`
  };

  //  Saadame meili ära
  await transporter.sendMail(mailOptions);
  console.log(` Meeldetuletus saadetud aadressile ${to}`);
}

//  Ekspordime funktsiooni teiste failide jaoks
module.exports = sendReminderEmail;
