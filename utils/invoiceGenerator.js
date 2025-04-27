const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

//  Arve numbri generaator — loeb ja uuendab counter-faili
function getNextInvoiceNumber() {
  const counterFile = path.join(__dirname, 'invoiceCounter.json');
  let counter = 1;

  // Kui fail olemas, loe sealt praegune counter
  if (fs.existsSync(counterFile)) {
    const data = fs.readFileSync(counterFile, 'utf8');
    const json = JSON.parse(data);
    counter = json.counter + 1;
  }

  // Salvesta uus counter väärtus
  fs.writeFileSync(counterFile, JSON.stringify({ counter }));

  // Tagasta counter 3-kohalise nullidega täidetud stringina (nt '001')
  return counter.toString().padStart(3, '0');
}

//  ETTEMAKSUARVE PDF-i generaator
function generatePreInvoice(order, client, filePath, invoiceNumber) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath)); // Salvestame faili

  // Arve päis
  doc.fontSize(20).text('ETTEMAKSUARVE', { align: 'center' });
  doc.moveDown();

  // Tellimuse ja arve info
  doc.fontSize(12).text(`Tellimus #${order.id}`);
  doc.text(`Ettemaksuarve nr: LA${invoiceNumber}`);
  doc.text(`Kuupäev: ${new Date().toLocaleDateString()}`);
  doc.text(`Makse tähtaeg: ${order.paymentDeadline?.toLocaleDateString() || '-'}`);
  doc.moveDown();

  // Kliendi andmed
  doc.text('KLIENT:');
  doc.text(`${client.clientName || client.firstName + ' ' + client.lastName}`);
  doc.text(`${client.address}`);
  doc.text(`${client.postalCode}, ${client.city}, ${client.country}`);
  doc.text(`E-post: ${client.email}`);
  doc.moveDown();

  // Teenuse andmed
  doc.text('TEENUS:');
  doc.text(`Laoteenus: ${order.totalPrice - (order.transportNeeded ? 100 : 0)} €`);
  if (order.transportNeeded) {
    doc.text(`Transpordi teenus: 100 €`);
  }
  doc.text(`Kokku: ${order.totalPrice} €`);
  doc.moveDown();

  // Pangaandmed
  doc.text('Pank: EE123456789012345678');
  doc.text(`Viitenumber: ETT-LA${invoiceNumber}`);

  doc.end(); // Sulge PDF
}

//  LÕPPARVE PDF-i generaator
function generateFinalInvoice(order, client, invoiceNumber) {
  // Failinimi sõltub, kas on pikendus või tavaline arve
  const filename = invoiceNumber.startsWith('EXT')
    ? `Arve_Pikendus_${invoiceNumber}.pdf`
    : `Arve_${invoiceNumber}.pdf`;

  const filePath = path.join(__dirname, '../invoices', filename);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath)); // Salvestame faili

  // Arve päis
  doc.fontSize(20).text('ARVE', { align: 'center' });
  doc.moveDown();

  // Tellimuse ja kuupäevade info
  doc.fontSize(12).text(`Tellimus #${order.id}`);
  doc.text(`Kuupäev: ${new Date().toLocaleDateString()}`);
  doc.text(`Tegelik algus: ${order.actualStartDate ? new Date(order.actualStartDate).toLocaleDateString() : '-'}`);
  doc.text(`Tegelik lõpp: ${order.actualEndDate ? new Date(order.actualEndDate).toLocaleDateString() : '-'}`);
  doc.moveDown();

  // Kliendi andmed
  doc.text('KLIENT:');
  doc.text(`${client.clientName}`);
  doc.text(`${client.address}`);
  doc.text(`${client.postalCode}, ${client.city}, ${client.country}`);
  doc.text(`E-post: ${client.email}`);
  doc.moveDown();

  // Teenuse ja hinna andmed
  doc.text('TEENUS:');
  if (invoiceNumber.startsWith('EXT')) {
    // Pikendusarve
    doc.text(`Ladustamise pikendus: ${order.extensionPrice} €`);
    doc.text(`Kokku tasutud: ${order.extensionPrice} €`);
  } else {
    // Tavaline arve
    doc.text(`Laoteenus: ${order.totalPrice - (order.transportNeeded ? 100 : 0)} €`);
    if (order.transportNeeded) {
      doc.text(`Transpordi teenus: 100 €`);
    }
    doc.text(`Kokku tasutud: ${order.totalPrice} €`);
  }
  doc.moveDown();

  // Pangaandmed
  doc.text('Pank: EE123456789012345678');
  doc.text(`Viitenumber: ARVE-${invoiceNumber}`);

  doc.end(); // Sulge PDF

  console.log(` Lõpparve PDF genereeritud: ${filePath}`);

  // Tagasta failitee ja nimi
  return {
    filePath,
    filename
  };
}

//  Ekspordime kõik funktsioonid kasutamiseks teistes failides
module.exports = {
  getNextInvoiceNumber,
  generatePreInvoice,
  generateFinalInvoice
};
