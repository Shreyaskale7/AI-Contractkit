// backend/controllers/clientController.js
const Client = require('../models/Client');

// GET /api/clients — get only THIS user's clients
const getClients = async (req, res) => {
  const clients = await Client.find({ userId: req.user._id }).sort('-createdAt');
  res.json(clients);
};

// POST /api/clients
const createClient = async (req, res) => {
  const { name, email, phone, company } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Client name and email are required' });
  }
  const client = await Client.create({ userId: req.user._id, name, email, phone, company });
  res.status(201).json(client);
};

// PUT /api/clients/:id
const updateClient = async (req, res) => {
  // Whitelist updatable fields so a crafted request can't reassign userId
  // (which would hand the client to another account) or set arbitrary fields.
  const { name, email, phone, company, status } = req.body;
  const updates = { name, email, phone, company, status };
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id }, // ensures ownership
    updates, { new: true, runValidators: true }
  );
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json(client);
};

// DELETE /api/clients/:id
const deleteClient = async (req, res) => {
  await Client.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Client deleted' });
};

module.exports = { getClients, createClient, updateClient, deleteClient };