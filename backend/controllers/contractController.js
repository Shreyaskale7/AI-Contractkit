const Contract = require('../models/Contract');
const groq = require('../config/groq');
const crypto = require('crypto');

const generateContract = async (req, res) => {
  const { prompt, clientId, title } = req.body;

  if (!prompt || !clientId) {
    return res.status(400).json({ message: 'Prompt and clientId are required' });
  }

  // AI Call 1 — Generate contract
// AI Call 1 — Generate contract
const contractCompletion = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    {
      role: 'system',
      content: `You are a senior legal contract attorney specializing in freelance and technology contracts.
Generate a FORMAL, PROFESSIONAL contract with proper legal formatting in HTML.

Use this EXACT structure:
- <div class="contract-header"> for the title and parties section
- <div class="contract-meta"> for date, contract number
- <h2 class="section-title"> for section numbers like "1. PROJECT SCOPE"
- <p class="clause"> for clause text
- <div class="signature-block"> for signature section at the bottom

Always include:
1. CONTRACT HEADER (title, parties, date, contract number)
2. RECITALS (background context)
3. PROJECT SCOPE (detailed deliverables)
4. PAYMENT TERMS & MILESTONES (exact amounts, dates)
5. REVISION POLICY
6. TIMELINE & DEADLINES
7. INTELLECTUAL PROPERTY RIGHTS
8. CONFIDENTIALITY
9. TERMINATION
10. LIMITATION OF LIABILITY
11. FORCE MAJEURE
12. LATE PAYMENT PENALTY
13. DISPUTE RESOLUTION
14. GOVERNING LAW
15. SIGNATURE BLOCK (both parties)

Make it sound like a REAL legal document. Use "WHEREAS", "NOW THEREFORE", "IN WITNESS WHEREOF".
Be extremely specific with amounts, dates, and terms mentioned in the requirement.`
    },
    {
      role: 'user',
      content: `Create a formal freelance contract for: "${prompt}"`
    }
  ],
  max_tokens: 3000,
  temperature: 0.3,
});

  const contractContent = contractCompletion.choices[0].message.content;

  // AI Call 2 — Detect risks
  const riskCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a contract risk analyzer.
Analyze the contract and identify missing or risky clauses.
Respond ONLY with a JSON array of strings.
Example: ["No late payment penalty clause", "Missing IP ownership clause"]
Maximum 5 items. If contract looks good, return [].
Do not include any text outside the JSON array.`
      },
      {
        role: 'user',
        content: `Analyze this contract for risks:\n${contractContent}`
      }
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  // Parse risk flags safely
  let riskFlags = [];
  try {
    const raw = riskCompletion.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    riskFlags = JSON.parse(cleaned);
  } catch {
    riskFlags = ['Could not analyze risks — review manually'];
  }

  // Save to database
  const contract = await Contract.create({
    userId:      req.user._id,
    clientId,
    title:       title || 'Freelance Contract',
    content:     contractContent,
    aiPrompt:    prompt,
    riskFlags,
    publicToken: crypto.randomBytes(16).toString('hex'),
  });

  res.status(201).json(contract);
};

const getContracts = async (req, res) => {
  const contracts = await Contract.find({ userId: req.user._id })
    .populate('clientId', 'name email company')
    .sort('-createdAt');
  res.json(contracts);
};

const getContractById = async (req, res) => {
  const contract = await Contract.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).populate('clientId', 'name email company');
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  res.json(contract);
};

const getPublicContract = async (req, res) => {
  const contract = await Contract.findOne({ publicToken: req.params.token })
    .populate('clientId', 'name email company')
    .populate('userId', 'name businessName');
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  res.json(contract);
};

const deleteContract = async (req, res) => {
  await Contract.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Contract deleted' });
};

module.exports = {
  generateContract,
  getContracts,
  getContractById,
  getPublicContract,
  deleteContract
};