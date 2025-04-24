const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Arve numbri generaator
function getNextInvoiceNumber() {
  const counterFile = path.join(__dirname, 'invoiceCounter.json');
  let counter = 1;

  if (fs.existsSync(counterFile)) {
    const data = fs.readFileSync(counterFile, 'utf8');
    const json = JSON.parse(data);
    counter = json.counter + 1;
  }

  fs.writeFileSync(counterFile, JSON.stringify({ counter }));
  return counter.toString().padStart(3, '0');
}

// ETTEMAKSUARVE
function generatePreInvoice(order, client, filePath, invoiceNumber) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('ETTEMAKSUARVE', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Tellimus #${order.id}`);
  doc.text(`Ettemaksuarve nr: LA${invoiceNumber}`);
  doc.text(`Kuupäev: ${new Date().toLocaleDateString()}`);
  doc.text(`Makse tähtaeg: ${order.paymentDeadline?.toLocaleDateString() || '-'}`);
  doc.moveDown();

  doc.text('KLIENT:');
  doc.text(`${client.clientName || client.firstName + ' ' + client.lastName}`);
  doc.text(`${client.address}`);
  doc.text(`${client.postalCode}, ${client.city}, ${client.country}`);
  doc.text(`E-post: ${client.email}`);
  doc.moveDown();

  doc.text('TEENUS:');
  doc.text(`Laoteenus: ${order.totalPrice - (order.transportNeeded ? 100 : 0)} €`);
  if (order.transportNeeded) {
    doc.text(`Transpordi teenus: 100 €`);
  }
  doc.text(`Kokku: ${order.totalPrice} €`);
  doc.moveDown();

  doc.text('Pank: EE123456789012345678');
  doc.text(`Viitenumber: ETT-LA${invoiceNumber}`);

  doc.end();
}

// LÕPPARVE
function generateFinalInvoice(order, client, invoiceNumber) {
  const filename = invoiceNumber.startsWith('EXT')
    ? `Arve_Pikendus_${invoiceNumber}.pdf`
    : `Arve_${invoiceNumber}.pdf`;

  const filePath = path.join(__dirname, '../invoices', filename);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('ARVE', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Tellimus #${order.id}`);
  doc.text(`Kuupäev: ${new Date().toLocaleDateString()}`);
  doc.text(`Tegelik algus: ${order.actualStartDate ? new Date(order.actualStartDate).toLocaleDateString() : '-'}`);
  doc.text(`Tegelik lõpp: ${order.actualEndDate ? new Date(order.actualEndDate).toLocaleDateString() : '-'}`);
  doc.moveDown();

  doc.text('KLIENT:');
  doc.text(`${client.clientName}`);
  doc.text(`${client.address}`);
  doc.text(`${client.postalCode}, ${client.city}, ${client.country}`);
  doc.text(`E-post: ${client.email}`);
  doc.moveDown();

  doc.text('TEENUS:');
  if (invoiceNumber.startsWith('EXT')) {
    doc.text(`Ladustamise pikendus: ${order.extensionPrice} €`);
    doc.text(`Kokku tasutud: ${order.extensionPrice} €`);
  } else {
    doc.text(`Laoteenus: ${order.totalPrice - (order.transportNeeded ? 100 : 0)} €`);
    if (order.transportNeeded) {
      doc.text(`Transpordi teenus: 100 €`);
    }
    doc.text(`Kokku tasutud: ${order.totalPrice} €`);
  }
  doc.moveDown();

  doc.text('Pank: EE123456789012345678');
  doc.text(`Viitenumber: ARVE-${invoiceNumber}`);

  doc.end();

  console.log(`✅ Lõpparve PDF genereeritud: ${filePath}`);

  return {
    filePath,
    filename
  };
}

module.exports = {
  getNextInvoiceNumber,
  generatePreInvoice,
  generateFinalInvoice
};
