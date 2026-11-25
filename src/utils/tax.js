// Per-item GST calculation. Each item: { qty, rate, gst } where gst is a percent (0 if blank).
export const calcInvoice = (items = []) => {
  let taxable = 0;
  let tax = 0;
  const byRate = {};
  items.forEach((i) => {
    const amt = (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0);
    const g = parseFloat(i.gst) || 0;
    const t = (amt * g) / 100;
    taxable += amt;
    tax += t;
    const k = String(g);
    if (!byRate[k]) byRate[k] = { rate: g, taxable: 0, tax: 0 };
    byRate[k].taxable += amt;
    byRate[k].tax += t;
  });
  return {
    taxable,
    tax,
    total: taxable + tax,
    byRate: Object.values(byRate).sort((a, b) => a.rate - b.rate),
  };
};

export const formatDate = (d = new Date()) => {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${dt.getFullYear()}`;
};

// The date an invoice was BILLED for (the date chosen on the billing page).
// Falls back to created_at only for old invoices that have no invoice_date.
export const getInvoiceDate = (inv = {}) => {
  const raw = inv.invoice_date;
  if (raw) {
    const [y, m, d] = String(raw).slice(0, 10).split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d); // local date, no timezone shift
  }
  return new Date(inv.created_at || Date.now());
};

export const formatInvoiceDate = (inv = {}) => formatDate(getInvoiceDate(inv));

// Newest billed date first (ties broken by creation time)
export const sortByInvoiceDateDesc = (list = []) =>
  [...list].sort((a, b) => {
    const diff = getInvoiceDate(b) - getInvoiceDate(a);
    return diff !== 0 ? diff : new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
