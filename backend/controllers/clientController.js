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
  const client = await Client.create({ userId: req.user._id, name, email, phone, company });
  res.status(201).json(client);
};

// PUT /api/clients/:id
const updateClient = async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id }, // ensures ownership
    req.body, { new: true }
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