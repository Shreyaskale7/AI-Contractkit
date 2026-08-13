const Contract = require('../models/Contract');
const ScopeDefense = require('../models/ScopeDefense');
const crypto = require('crypto');
const { draftContract, draftContractStream, analyzeRisks, editContract } = require('../services/aiService');
const { analyzeScopeCreep } = require('../services/scopeService');
const { summarizeDefenses } = require('../utils/scopeDefense');
const emailService = require('../services/emailService');
const { streamContractPdf } = require('../services/pdfService');

// Signed contracts are immutable — editing one would invalidate the
// SHA-256 content hash recorded in the signature audit trail.
const assertEditable = (contract, res) => {
  if (contract.status === 'signed') {
    res.status(409).json({ message: 'This contract is signed and can no longer be edited.' });
    return false;
  }
  return true;
};

const generateContract = async (req, res) => {
  const { prompt, clientId, title } = req.body;

  if (!prompt || !clientId) {
    return res.status(400).json({ message: 'Prompt and clientId are required' });
  }

  const content = await draftContract({ input: prompt, mode: 'brief' });
  const riskAnalysis = await analyzeRisks(content);

  const contract = await Contract.create({
    userId:      req.user._id,
    clientId,
    title:       title || 'Freelance Contract',
    content,
    aiPrompt:    prompt,
    riskAnalysis,
    publicToken: crypto.randomBytes(16).toString('hex'),
  });

  res.status(201).json(contract);
};

// POST /api/contracts/generate-stream — SSE: streams draft tokens live,
// then runs risk analysis, saves, and emits the final contract.
const generateContractStream = async (req, res) => {
  const { prompt, notes, clientId, title, mode = 'prompt' } = req.body;
  const input = mode === 'notes' ? notes : prompt;

  if (!input || !clientId) {
    return res.status(400).json({ message: 'Prompt/notes and clientId are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    sendEvent({ stage: 'drafting' });
    const content = await draftContractStream({
      input,
      mode: mode === 'notes' ? 'notes' : 'brief',
      onDelta: (delta) => sendEvent({ delta }),
    });

    sendEvent({ stage: 'analyzing' });
    const riskAnalysis = await analyzeRisks(content);

    const contract = await Contract.create({
      userId:      req.user._id,
      clientId,
      title:       title || (mode === 'notes' ? 'Meeting Notes Contract' : 'Freelance Contract'),
      content,
      aiPrompt:    input,
      riskAnalysis,
      publicToken: crypto.randomBytes(16).toString('hex'),
    });

    sendEvent({ done: true, contract });
  } catch (err) {
    console.error('Stream generation error:', err.message);
    sendEvent({ error: 'Generation failed — please try again.' });
  }
  res.end();
};

// POST /api/contracts/generate-from-notes
const generateFromNotes = async (req, res) => {
  const { notes, clientId, title } = req.body;

  if (!notes || !clientId) {
    return res.status(400).json({ message: 'Meeting notes and clientId are required' });
  }

  const content = await draftContract({ input: notes, mode: 'notes' });
  const riskAnalysis = await analyzeRisks(content);

  const contract = await Contract.create({
    userId:      req.user._id,
    clientId,
    title:       title || 'Meeting Notes Contract',
    content,
    aiPrompt:    notes,
    riskAnalysis,
    publicToken: crypto.randomBytes(16).toString('hex'),
  });

  res.status(201).json(contract);
};

const getContracts = async (req, res) => {
  const contracts = await Contract.find({ userId: req.user._id })
    .populate('clientId', 'name email company')
    .sort('-createdAt')
    .limit(500);
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

const deleteContract = async (req, res) => {
  await Contract.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Contract deleted' });
};

// POST /api/contracts/:id/send — mark as sent to client (and optionally set expiry)
const markContractSent = async (req, res) => {
  const { validUntil } = req.body;
  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('clientId', 'name email');
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  if (contract.status === 'signed') {
    return res.status(409).json({ message: 'Contract is already signed.' });
  }

  contract.status = 'sent';
  contract.sentAt = new Date();
  if (validUntil) contract.validUntil = new Date(validUntil);
  await contract.save();

  // Email the client directly if SMTP is configured (no-op otherwise)
  const emailed = await emailService.sendContractToClient({
    clientEmail: contract.clientId?.email,
    clientName:  contract.clientId?.name,
    contractTitle: contract.title,
    senderName:  req.user.businessName || req.user.name,
    publicToken: contract.publicToken,
  });

  res.json({ ...contract.toObject(), emailed });
};

// POST /api/contracts/:id/revert — undo the last AI edit
const revertContract = async (req, res) => {
  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id });
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  if (!assertEditable(contract, res)) return;
  if (!contract.versions?.length) {
    return res.status(400).json({ message: 'No previous version to restore.' });
  }

  const last = contract.versions.pop();
  contract.content = last.content;
  await contract.save();

  res.json({ message: 'Reverted to previous version', content: contract.content, versions: contract.versions });
};

// POST /api/contracts/sign/:token — save signature
const signContract = async (req, res) => {
  const { signatureData, signerName, signerEmail } = req.body;

  if (!signatureData) {
    return res.status(400).json({ message: 'Signature data is required' });
  }
  if (typeof signatureData !== 'string' || signatureData.length > 500000) {
    return res.status(400).json({ message: 'Invalid signature data' });
  }

  const contract = await Contract.findOne({ publicToken: req.params.token });

  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' });
  }
  if (contract.status === 'signed') {
    return res.status(409).json({ message: 'Contract is already signed.' });
  }
  if (contract.validUntil && contract.validUntil < new Date()) {
    contract.status = 'expired';
    await contract.save();
    return res.status(410).json({ message: 'This contract has expired and can no longer be signed.' });
  }

  // Calculate content hash
  const contentHash = crypto.createHash('sha256').update(contract.content).digest('hex');
  const userAgent = req.headers['user-agent'] || 'Unknown';

  contract.signature = {
    data:        signatureData,  // base64 image
    signedAt:    new Date(),
    ip:          req.ip || 'Unknown', // requires app.set('trust proxy') for real client IP
    userAgent:   userAgent,
    contentHash: contentHash,
    signerName:  String(signerName || 'Client').slice(0, 120),
    signerEmail: String(signerEmail || '').slice(0, 200),
  };
  contract.status = 'signed';

  await contract.save();

  // Notify the freelancer their contract was signed (no-op without SMTP)
  const owner = await contract.populate('userId', 'email');
  await emailService.notifyContractSigned({
    ownerEmail: owner.userId?.email,
    contractTitle: contract.title,
    contractId: contract._id,
    signerName: contract.signature.signerName,
  });

  res.json({
    message: 'Contract signed successfully!',
    signedAt: contract.signature.signedAt,
    contract: publicView(contract),
  });
};

// Shape a contract for the CLIENT-facing public page.
// Never expose internal risk analysis, the AI prompt, or edit history —
// that's the freelancer's private negotiation information.
const publicView = (contract) => {
  const c = contract.toObject ? contract.toObject() : contract;
  delete c.riskAnalysis;
  delete c.aiPrompt;
  delete c.versions;
  return c;
};

// GET /api/contracts/public/:token — public view
const getPublicContract = async (req, res) => {
  const contract = await Contract.findOne({ publicToken: req.params.token })
    .populate('clientId', 'name email company')
    .populate('userId', 'name businessName email');

  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' });
  }

  // Auto-expire on view if past validity
  if (contract.status === 'sent' && contract.validUntil && contract.validUntil < new Date()) {
    contract.status = 'expired';
    await contract.save();
  }

  res.json(publicView(contract));
};

// POST /api/contracts/:id/refine
const refineContract = async (req, res) => {
  const { instruction } = req.body;
  if (!instruction || typeof instruction !== 'string') {
    return res.status(400).json({ message: 'Instruction is required' });
  }

  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id });
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  if (!assertEditable(contract, res)) return;

  const newContent = await editContract({
    systemPrompt: `You are a contract editor. Receive an existing HTML contract and an instruction.
Make ONLY the requested change. Keep everything else exactly the same.
Return the complete updated contract HTML — nothing else.`,
    userPrompt: `Contract:\n${contract.content}\n\nInstruction: ${instruction.slice(0, 2000)}\n\nReturn complete updated HTML.`,
  });

  contract.versions.push({ content: contract.content, instruction: instruction.slice(0, 500), changedBy: 'refine' });
  contract.content = newContent;
  await contract.save();
  res.json({ content: contract.content, versions: contract.versions, message: 'Contract updated!' });
};

// POST /api/contracts/public/:token/comments
const addClientComment = async (req, res) => {
  const { text, note } = req.body;

  if (!text || !note || typeof text !== 'string' || typeof note !== 'string') {
    return res.status(400).json({ message: 'Both the selected text and a note are required' });
  }
  if (text.length > 2000 || note.length > 2000) {
    return res.status(400).json({ message: 'Comment is too long (max 2000 characters)' });
  }

  const contract = await Contract.findOne({ publicToken: req.params.token });
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  if (contract.status === 'signed') {
    return res.status(409).json({ message: 'Contract is already signed — comments are closed.' });
  }
  if ((contract.comments?.length || 0) >= 50) {
    return res.status(429).json({ message: 'Comment limit reached for this contract.' });
  }

  contract.comments.push({ text: text.trim(), note: note.trim() });
  await contract.save();

  // Notify the freelancer about the change request (no-op without SMTP)
  const owner = await contract.populate('userId', 'email');
  await emailService.notifyCommentAdded({
    ownerEmail: owner.userId?.email,
    contractTitle: contract.title,
    contractId: contract._id,
    note: note.trim().slice(0, 500),
  });

  res.status(201).json({ message: 'Comment added successfully', comments: contract.comments });
};

// POST /api/contracts/:id/comments/:commentId/resolve
const resolveCommentWithAI = async (req, res) => {
  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id });
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  if (!assertEditable(contract, res)) return;

  const comment = contract.comments.find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const newContent = await editContract({
    systemPrompt: `You are an expert contract attorney.
You are given a full HTML contract, a specific snippet of text that the client highlighted, and the client's request/comment regarding that snippet.
Your task is to REWRITE the highlighted text to satisfy the client's request in professional, legally sound language.
Then, REPLACE the original text in the full HTML with your new text.
Return ONLY the complete, updated HTML contract. Do not include markdown formatting or explanations.`,
    userPrompt: `Contract HTML:\n${contract.content}\n\nHighlighted Text: "${comment.text}"\n\nClient Request: "${comment.note}"\n\nPlease update the HTML.`,
  });

  contract.versions.push({ content: contract.content, instruction: comment.note, changedBy: 'comment-resolve' });
  contract.content = newContent;
  comment.status = 'resolved';

  await contract.save();
  res.json({
    message: 'Comment resolved and contract updated',
    content: contract.content,
    comments: contract.comments,
    versions: contract.versions,
  });
};

// GET /api/contracts/public/:token/eli5
const getELI5Contract = async (req, res) => {
  const contract = await Contract.findOne({ publicToken: req.params.token });
  if (!contract) return res.status(404).json({ message: 'Contract not found' });

  if (contract.eli5Content) {
    return res.json({ content: contract.eli5Content });
  }

  const newContent = await editContract({
    systemPrompt: `You are an expert at simplifying complex legal jargon.
You will receive an HTML contract. Your job is to translate the entire contract into "Explain Like I'm 5" (ELI5) plain English.
Make it extremely easy to read, conversational, and completely free of intimidating legal terms.
Preserve the exact HTML structure (headers, divs, paragraphs).
Return ONLY the updated HTML.`,
    userPrompt: `Translate this contract into plain English HTML:\n\n${contract.content}`,
  });

  contract.eli5Content = newContent;
  await contract.save();

  res.json({ content: contract.eli5Content });
};

// POST /api/contracts/:id/analyze-scope
const analyzeScope = async (req, res) => {
  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id });
  if (!contract) return res.status(404).json({ message: 'Contract not found' });

  const { clientRequest, tone } = req.body;
  if (!clientRequest) return res.status(400).json({ message: 'Client request text is required' });

  // Delegates to scopeService, which normalizes the model output, scores
  // confidence, locates the cited clause in the contract, and drafts the
  // response email in the requested tone.
  try {
    const result = await analyzeScopeCreep({
      contractContent: contract.content,
      clientRequest,
      tone,
    });
    res.json(result);
  } catch {
    return res.status(502).json({
      message: 'The AI returned an unreadable response. Please try again.',
    });
  }
};

// POST /api/contracts/:id/scope-defense — log an out-of-scope outcome and the
// value of the additional work, so it can roll up into "revenue protected".
const logScopeDefense = async (req, res) => {
  const { estimatedValue, currency, requestText, isOutOfScope, clientName, status } = req.body;

  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('clientId', 'name');
  if (!contract) return res.status(404).json({ message: 'Contract not found' });

  const defense = await ScopeDefense.create({
    userId:        req.user._id,
    contractId:    contract._id,
    clientName:    clientName || contract.clientId?.name || '',
    requestText:   String(requestText || '').slice(0, 2000),
    isOutOfScope:  isOutOfScope === undefined ? true : Boolean(isOutOfScope),
    estimatedValue: Math.max(0, Number(estimatedValue) || 0),
    currency:      currency || req.user.currency || 'INR',
    status:        ['logged', 'billed', 'waived'].includes(status) ? status : 'logged',
  });

  res.status(201).json(defense);
};

// GET /api/contracts/scope-defenses — recent defenses + "revenue protected" summary
const getScopeDefenses = async (req, res) => {
  const defenses = await ScopeDefense.find({ userId: req.user._id })
    .sort('-createdAt')
    .limit(100);
  res.json({ defenses, summary: summarizeDefenses(defenses) });
};

// GET /api/contracts/:id/pdf — download PDF (owner)
const downloadContractPdf = async (req, res) => {
  const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('userId', 'name businessName email phone website')
    .populate('clientId', 'name company email');
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  streamContractPdf(contract, res);
};

// GET /api/contracts/public/:token/pdf — download PDF (client)
const downloadPublicContractPdf = async (req, res) => {
  const contract = await Contract.findOne({ publicToken: req.params.token })
    .populate('userId', 'name businessName email phone website')
    .populate('clientId', 'name company email');
  if (!contract) return res.status(404).json({ message: 'Contract not found' });
  streamContractPdf(contract, res);
};

module.exports = {
  generateContract,
  generateContractStream,
  downloadContractPdf,
  downloadPublicContractPdf,
  getContracts,
  getContractById,
  getPublicContract,
  signContract,
  deleteContract,
  refineContract,
  revertContract,
  markContractSent,
  addClientComment,
  resolveCommentWithAI,
  analyzeScope,
  logScopeDefense,
  getScopeDefenses,
  getELI5Contract,
  generateFromNotes
};
