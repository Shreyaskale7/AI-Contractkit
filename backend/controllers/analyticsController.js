// backend/controllers/analyticsController.js
const Contract = require('../models/Contract');
const Invoice  = require('../models/Invoice');
const Client   = require('../models/Client');

const getAnalytics = async (req, res) => {
  const userId = req.user._id;

  // Get all data in parallel
  const [contracts, invoices, clients] = await Promise.all([
    Contract.find({ userId }).populate('clientId', 'name'),
    Invoice.find({ userId }).populate('clientId', 'name'),
    Client.find({ userId }),
  ]);

  // Revenue by month
  const revenueByMonth = {};
  invoices.filter(inv => inv.status === 'paid').forEach(inv => {
    const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + inv.totalAmount;
  });

  // Invoice status breakdown
  const invoiceStats = {
    paid:    invoices.filter(i => i.status === 'paid').length,
    unpaid:  invoices.filter(i => i.status === 'unpaid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  // Contract status breakdown
  const contractStats = {
    draft:  contracts.filter(c => c.status === 'draft').length,
    sent:   contracts.filter(c => c.status === 'sent').length,
    signed: contracts.filter(c => c.status === 'signed').length,
  };

  // Top clients by invoice value
  const clientRevenue = {};
  invoices.filter(inv => inv.status === 'paid').forEach(inv => {
    const name = inv.clientId?.name || 'Unknown';
    clientRevenue[name] = (clientRevenue[name] || 0) + inv.totalAmount;
  });
  const topClients = Object.entries(clientRevenue)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Total stats
  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingRevenue = invoices
    .filter(i => i.status === 'unpaid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  res.json({
    totals: {
      clients:        clients.length,
      contracts:      contracts.length,
      invoices:       invoices.length,
      totalRevenue,
      pendingRevenue,
    },
    revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
    invoiceStats,
    contractStats,
    topClients,
  });
};

module.exports = { getAnalytics };