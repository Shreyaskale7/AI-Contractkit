// backend/controllers/proposalController.js
const Proposal = require('../models/Proposal');
const groq     = require('../config/groq');
const crypto   = require('crypto');

// POST /api/proposals/generate
const generateProposal = async (req, res) => {
  const { prompt, clientId, title, budget, timeline } = req.body;

  if (!prompt || !clientId) {
    return res.status(400).json({ message: 'Prompt and clientId are required' });
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert freelance business consultant who writes 
compelling project proposals that win clients.
Generate a professional, persuasive project proposal in clean HTML format.

Always include these sections with proper HTML:
1. <h2>Executive Summary</h2> — Brief overview of the project and your approach
2. <h2>Understanding Your Requirements</h2> — Show you understand their needs
3. <h2>Proposed Solution & Approach</h2> — How you'll solve their problem
4. <h2>Project Timeline</h2> — Detailed week by week breakdown as an HTML table
5. <h2>Investment & Pricing</h2> — Clear pricing table with milestones as HTML table
6. <h2>Why Choose Me</h2> — Your strengths, experience, guarantees
7. <h2>Next Steps</h2> — Clear call to action

Use professional business language.
Make it persuasive and client-focused.
Use <table> for timeline and pricing with proper styling attributes.
Be specific with the budget and timeline provided.`
      },
      {
        role: 'user',
        content: `Create a professional project proposal for:
Project: ${prompt}
Budget: ${budget || 'To be discussed'}
Timeline: ${timeline || 'To be discussed'}

Make it compelling and professional.`
      }
    ],
    max_tokens: 3000,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;

  const proposal = await Proposal.create({
    userId:      req.user._id,
    clientId,
    title:       title || 'Project Proposal',
    content,
    aiPrompt:    prompt,
    budget,
    timeline,
    publicToken: crypto.randomBytes(16).toString('hex'),
  });

  res.status(201).json(proposal);
};

// GET /api/proposals
const getProposals = async (req, res) => {
  const proposals = await Proposal.find({ userId: req.user._id })
    .populate('clientId', 'name email company')
    .sort('-createdAt')
    .limit(500);
  res.json(proposals);
};

// GET /api/proposals/:id
const getProposalById = async (req, res) => {
  const proposal = await Proposal.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).populate('clientId', 'name email company');
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  res.json(proposal);
};

// PUT /api/proposals/:id/status
const updateProposalStatus = async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'sent', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid proposal status' });
  }
  const proposal = await Proposal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status },
    { new: true, runValidators: true }
  );
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  res.json(proposal);
};

// DELETE /api/proposals/:id
const deleteProposal = async (req, res) => {
  await Proposal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Proposal deleted' });
};

module.exports = {
  generateProposal,
  getProposals,
  getProposalById,
  updateProposalStatus,
  deleteProposal
};