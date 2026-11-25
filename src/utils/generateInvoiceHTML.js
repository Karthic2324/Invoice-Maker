const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const generateInvoiceHTML = (invoiceData, vendorProfile = {}) => {
  const {
    invoiceNo,
    invoiceDate,
    customerName,
    address,
    phone,
    shippingAddress,
    items = [],
  } = invoiceData;

  const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
  const total = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0);

  const numberToWords = (num) => {
    if (!num) return 'Zero Rupees';
    return `${Math.round(num).toLocaleString('en-IN')} Rupees Only`;
  };

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #111; font-size: 13px; line-height: 1.4; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 8px; }
      .title { font-size: 18px; font-weight: bold; }
      .sub-header { display: flex; justify-content: space-between; margin-top: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
      .vendor-info { width: 55%; }
      .invoice-meta { width: 40%; text-align: right; }
      .parties { display: flex; gap: 12px; margin-top: 10px; }
      .box { border: 1px solid #000; padding: 8px; width: 45%; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #aaa; padding: 6px; text-align: left; }
      th { background-color: #f0f0f0; }
      .right { text-align: right; }
      .words-box { border: 1px solid #000; padding: 8px; margin-top: 15px; font-weight: bold; }
      .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    </style>
  </head>
  <body>
    <div class="header">
      <span class="title">INVOICE</span>
      <span>ORIGINAL FOR RECIPIENT</span>
    </div>

    <div class="sub-header">
      <div class="vendor-info">
        <h3>${esc(vendorProfile.business_name || 'My Business')}</h3>
        <p>${esc(vendorProfile.address || '')}</p>
        <p><strong>Contact:</strong> ${esc(vendorProfile.phone || 'N/A')}</p>
      </div>
      <div class="invoice-meta">
        <p><strong>Invoice No.:</strong> ${esc(invoiceNo)}</p>
        <p><strong>Invoice Date:</strong> ${esc(invoiceDate)}</p>
      </div>
    </div>

    <div class="parties">
      <div class="box">
        <strong>BILL TO</strong>
        <p>${esc(customerName || 'Customer Name')}</p>
        <p>${esc(address || '')}</p>
        <p>${esc(phone || '')}</p>
      </div>
      ${shippingAddress ? `<div class="box"><strong>SHIP TO</strong><p>${esc(shippingAddress)}</p></div>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>S.NO</th>
          <th>ITEMS</th>
          <th class="right">WEIGHT (KG)</th>
          <th class="right">RATE</th>
          <th class="right">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${esc(item.description || 'Item')}</td>
            <td class="right">${esc(item.qty)}</td>
            <td class="right">${parseFloat(item.rate || 0).toFixed(2)}</td>
            <td class="right">${((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold;">
      <span>TOTAL WEIGHT: ${totalQty} kg</span>
      <span>TOTAL: ₹${total.toFixed(2)}</span>
    </div>

    <div class="words-box">
      Total Amount (in words): ${numberToWords(total)}
    </div>

    <div class="footer">
      <div></div>
      <div style="text-align: right;">
        <br/><br/>
        <strong>Authorised Signatory For</strong><br/>
        ${esc(vendorProfile.business_name || 'My Business')}
      </div>
    </div>
  </body>
  </html>
  `;
};