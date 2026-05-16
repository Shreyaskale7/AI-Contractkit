// backend/controllers/templateController.js
const Template = require('../models/Template');
const Contract = require('../models/Contract');

// POST /api/templates — save contract as template
const createTemplate = async (req, res) => {
  const { title, content, prompt, category } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const template = await Template.create({
    userId: req.user._id,
    title,
    content,
    prompt,
    category: category || 'Other',
  });

  res.status(201).json(template);
};

// POST /api/templates/from-contract/:id
// Save an existing contract as template
const saveContractAsTemplate = async (req, res) => {
  const { category } = req.body;

  const contract = await Contract.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' });
  }

  const template = await Template.create({
    userId:   req.user._id,
    title:    contract.title,
    content:  contract.content,
    prompt:   contract.aiPrompt,
    category: category || 'Other',
  });

  res.status(201).json(template);
};

// GET /api/templates
const getTemplates = async (req, res) => {
  const { category } = req.query;
  const filter = { userId: req.user._id };
  if (category && category !== 'All') filter.category = category;

  const templates = await Template.find(filter).sort('-createdAt');
  res.json(templates);
};

// GET /api/templates/:id
const getTemplateById = async (req, res) => {
  const template = await Template.findOne({
    _id: req.params.id,
    userId: req.user._id
  });
  if (!template) return res.status(404).json({ message: 'Template not found' });

  // Increment usage count
  await Template.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });

  res.json(template);
};

// DELETE /api/templates/:id
const deleteTemplate = async (req, res) => {
  await Template.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Template deleted' });
};

module.exports = {
  createTemplate,
  saveContractAsTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate
};