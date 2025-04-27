const nodemailer = require('nodemailer');
require('dotenv').config();

//  Funktsioon saadab kliendile e-kirja, et tema transporditellimus on kinnitatud
const sendTransportConfirmationEmail = async (toEmail, orderId, scheduledDate) => {
  //  E-kirja tekstisisu koos tellimuse numbriga ja planeeritud saabumisajaga
  const message = `Tere!

Teie transporditellimus #${orderId} on kinnitatud. Transport saabub aadressile vastavalt broneeringule.

Planeeritud saabumisaeg: ${new Date(scheduledDate).toLocaleString('et-EE')}

Kui Teil on küsimusi või soovite aega muuta, võtke palun ühendust meie klienditoega.

Lugupidamisega,  
Laohaldus meeskond`;

  //  Nodemailer transpordi seadistamine SMTP serveri andmetega (.env failist)
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  //  Saadame e-kirja
  await transporter.sendMail({
    from: '"Laohaldus süsteem" <no-reply@warehouse.test>', // Saatja
    to: toEmail, // Saaja e-post
    subject: `Transpordi kinnitus – Tellimus #${orderId}`, // E-kirja teema
    text: message // E-kirja tekstisisu
  });

  console.log(` Transpordi kinnitus saadetud: ${toEmail}`);
};

//  Ekspordime funktsiooni, et teised failid saaksid seda kasutada
module.exports = sendTransportConfirmationEmail;
