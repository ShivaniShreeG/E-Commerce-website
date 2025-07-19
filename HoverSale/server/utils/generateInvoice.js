const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const { cloudinary } = require('../utils/cloudinary'); // Ensure this is imported correctly

const generateInvoicePDF = ({
  orderId,
  name,
  email,
  address,
  phone,
  payment_method,
  status,
  products,
  grand_total,
  logo_url
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const bufferStream = new streamBuffers.WritableStreamBuffer();

    doc.pipe(bufferStream);

    // Optional Logo
    if (logo_url) {
      try {
        doc.image(logo_url, 50, 45, { width: 100 });
      } catch (err) {
        console.warn('Logo load failed:', err.message);
      }
    }

    doc.font('Helvetica-Bold').fontSize(20).text('HoverSale Invoice', 200, 50, { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${orderId}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.moveDown(2);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 130).lineTo(550, 130).stroke();

    // Customer Info
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(12).text('Customer Information:', { underline: true });
    doc.font('Helvetica').fontSize(11);
    doc.text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Phone: ${phone}`);
    doc.text(`Address: ${address}`);
    doc.text(`Payment Method: ${payment_method}`);
    doc.text(`Order Status: ${status}`);

    doc.moveDown(1);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Order Summary
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(12).text('Order Summary:', { underline: true });
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Product', 50, doc.y);
    doc.text('Qty', 300, doc.y);
    doc.text('Price', 400, doc.y, { align: 'right' });
    doc.moveDown(0.5);
    doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.font('Helvetica').fontSize(11);
    products.forEach(product => {
      doc.text(product.name, 50, doc.y + 5);
      doc.text(product.quantity.toString(), 300, doc.y);
      doc.text(`₹${product.total_price.toFixed(2)}`, 400, doc.y, { align: 'right' });
      doc.moveDown(1);
    });

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Grand Total:', 300, doc.y);
    doc.text(`₹${grand_total.toFixed(2)}`, 400, doc.y, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(12).text('Thank you for shopping with HoverSale!', {
      align: 'center',
      underline: true
    });

    doc.end();

    bufferStream.on('finish', () => {
      const buffer = bufferStream.getContents();
      const readableBuffer = new streamBuffers.ReadableStreamBuffer();
      readableBuffer.put(buffer);
      readableBuffer.stop();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'invoices',
          public_id: `Invoice-${orderId}`
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );

      readableBuffer.pipe(uploadStream);
    });

    bufferStream.on('error', reject);
  });
};

module.exports = generateInvoicePDF;
