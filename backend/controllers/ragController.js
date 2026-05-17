// backend/controllers/ragController.js
const Contract = require('../models/Contract');
const groq     = require('../config/groq');
const crypto   = require('crypto');
const { getCollection, detectCategory, getAllStats } = require('../config/vectordb');

// ─────────────────────────────────────────
// Index one contract into correct category collection
// ─────────────────────────────────────────
const indexContract = async (contractId, content, prompt = '', category = null) => {
  try {
    const cat        = category || detectCategory(prompt || content);
    const collection = await getCollection(cat);

    // Check if already indexed
    try {
      const existing = await collection.get({ ids: [contractId.toString()] });
      if (existing.ids.length > 0) {
        await collection.update({
          ids:       [contractId.toString()],
          documents: [content.substring(0, 3000)],
          metadatas: [{ contractId: contractId.toString(), category: cat }]
        });
        return cat;
      }
    } catch {}

    await collection.add({
      ids:       [contractId.toString()],
      documents: [content.substring(0, 3000)],
      metadatas: [{ contractId: contractId.toString(), category: cat }]
    });

    console.log(`✅ Indexed contract ${contractId} → category: ${cat}`);
    return cat;
  } catch (err) {
    console.error('Index error:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────
// Find similar contracts from same category
// ─────────────────────────────────────────
const findSimilarContracts = async (prompt, category, limit = 3) => {
  try {
    const collection = await getCollection(category);
    const count      = await collection.count();

    if (count === 0) return [];

    const results = await collection.query({
      queryTexts: [prompt],
      nResults:   Math.min(limit, count),
    });

    return results.documents[0] || [];
  } catch (err) {
    console.error('Search error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────
// Extract key clauses from similar contracts
// Instead of using full contracts, extract
// only relevant clause sections
// ─────────────────────────────────────────
const extractRelevantClauses = (contracts) => {
  const clauses = [];

  contracts.forEach((contract, i) => {
    // Extract payment terms
    const paymentMatch = contract.match(
      /payment|milestone|upfront|deposit|invoice/gi
    );
    // Extract IP section
    const ipMatch = contract.match(
      /intellectual property|ownership|rights|copyright/gi
    );
    // Extract revision policy
    const revisionMatch = contract.match(
      /revision|change|amendment|modification/gi
    );

    if (paymentMatch || ipMatch || revisionMatch) {
      // Get relevant sections (300 chars around keyword matches)
      const sections = extractSections(contract, [
        'payment', 'milestone', 'intellectual property',
        'revision', 'termination', 'confidential'
      ]);
      if (sections) clauses.push(`Reference ${i + 1} key clauses:\n${sections}`);
    }
  });

  return clauses.join('\n\n---\n\n');
};

const extractSections = (text, keywords) => {
  const sections = [];
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  keywords.forEach(keyword => {
    const idx = cleanText.toLowerCase().indexOf(keyword.toLowerCase());
    if (idx !== -1) {
      const start   = Math.max(0, idx - 50);
      const end     = Math.min(cleanText.length, idx + 400);
      const section = cleanText.substring(start, end).trim();
      if (section.length > 100) sections.push(section);
    }
  });

  return sections.slice(0, 4).join('\n\n');
};

// ─────────────────────────────────────────
// Category-specific style rules
// These tell the AI how each contract TYPE
// should be structured and written
// ─────────────────────────────────────────
const getCategoryStyleRules = (category) => {
  const rules = {
    web_development: `
STYLE RULES for Web Development contracts:
- Payment: milestone-based (typically 3 milestones: design, development, delivery)
- IP: client owns ALL code after full payment
- Revisions: 2-3 rounds per milestone included free
- Timeline: sprint-based with specific dates
- Hosting/deployment: specify who handles it
- Tech stack: mention specific technologies
- Bug fixes: typically 30 days free post-launch
- Late payment: 1.5% per month penalty`,

    mobile_development: `
STYLE RULES for Mobile Development contracts:
- Payment: milestone-based (wireframes, beta, final)
- Platform: specify iOS, Android, or both
- App store submission: specify who handles
- Testing: specify devices to be tested
- Source code: delivered upon final payment
- Maintenance: separate agreement post-launch
- IP: client owns app, not internal libraries`,

    design: `
STYLE RULES for Design contracts:
- Payment: 50% upfront, 50% on delivery — ALWAYS
- IP: usage rights granted, not full ownership (unless specified)
- Revisions: strictly limited (max 2 rounds)
- File formats: specify exactly (AI, PSD, PNG, SVG etc.)
- Ownership transfers only after full payment
- Portfolio rights: designer may show in portfolio
- Print/digital: specify usage scope`,

    content_writing: `
STYLE RULES for Content Writing contracts:
- Payment: per article/word OR monthly retainer
- Ownership: client owns content after payment
- Plagiarism: writer guarantees original content
- Revisions: typically 1-2 rounds included
- Research: specify if included or extra
- SEO optimization: specify if included
- Deadlines: strict turnaround times`,

    consulting: `
STYLE RULES for Consulting contracts:
- Payment: monthly retainer OR hourly rate
- Notice: 30-day written termination notice
- NDA: always include confidentiality clause
- IP: consultant retains methodologies/frameworks
- Expenses: specify reimbursement policy
- Non-compete: typically 6-12 months
- Deliverables: clearly define outcomes`,

    other: `
STYLE RULES for General contracts:
- Clear scope definition
- Milestone or project-based payment
- Standard IP assignment
- Reasonable revision policy
- Standard termination clause`
  };

  return rules[category] || rules.other;
};

// ─────────────────────────────────────────
// MAIN: Generate contract with Category RAG
// ─────────────────────────────────────────
const generateWithRAG = async (req, res) => {
  const { prompt, clientId, title } = req.body;

  if (!prompt || !clientId) {
    return res.status(400).json({ message: 'Prompt and clientId are required' });
  }

  // Step 1: Auto-detect category
  const category = detectCategory(prompt);
  console.log(`🎯 Detected category: ${category}`);

  // Step 2: Find similar contracts from SAME category
  const similarContracts = await findSimilarContracts(prompt, category, 3);
  console.log(`📚 Found ${similarContracts.length} similar contracts`);

  // Step 3: Extract relevant clauses (not full contracts)
  const relevantClauses = similarContracts.length > 0
    ? extractRelevantClauses(similarContracts)
    : '';

  // Step 4: Get category-specific style rules
  const styleRules = getCategoryStyleRules(category);

  // Step 5: Build the augmented prompt
  const systemPrompt = `You are an expert freelance contract lawyer specializing in ${category.replace(/_/g, ' ')} contracts.

${styleRules}

${relevantClauses ? `
LEARNED PATTERNS FROM SIMILAR CONTRACTS:
${relevantClauses}

Follow these exact patterns for payment terms, IP clauses, and revision policies.
` : ''}

Generate a professional contract in clean HTML format.
Use <h2> for section headers, <p> for content, <ul><li> for lists.
Include all standard sections with specific amounts and dates from the user's requirements.`;

  // Step 6: Generate with Groq
  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: `Create a ${category.replace(/_/g, ' ')} contract for: "${prompt}"` }
    ],
    max_tokens:  3000,
    temperature: similarContracts.length > 0 ? 0.3 : 0.7,
    // Lower temperature when we have references = more consistent output
  });

  const contractContent = completion.choices[0].message.content;

  // Step 7: Risk analysis
  const riskCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a contract risk analyzer for ${category.replace(/_/g, ' ')} contracts.
Identify missing or risky clauses specific to this contract type.
Return ONLY a JSON array of strings. Maximum 5 items.
Example: ["No late payment penalty", "Missing IP clause"]`
      },
      { role: 'user', content: `Analyze: ${contractContent.substring(0, 1500)}` }
    ],
    max_tokens:  300,
    temperature: 0.2,
  });

  let riskFlags = [];
  try {
    const raw     = riskCompletion.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    riskFlags     = JSON.parse(cleaned);
  } catch { riskFlags = ['Could not analyze risks — review manually']; }

  // Step 8: Save contract
  const contract = await Contract.create({
    userId:      req.user._id,
    clientId,
    title:       title || `${category.replace(/_/g, ' ')} Contract`,
    content:     contractContent,
    aiPrompt:    prompt,
    riskFlags,
    publicToken: crypto.randomBytes(16).toString('hex'),
  });

  // Step 9: Auto-index the new contract into correct category
  await indexContract(contract._id, contractContent, prompt, category);

  res.status(201).json({
    ...contract.toObject(),
    usedRAG:        similarContracts.length > 0,
    referencesUsed: similarContracts.length,
    category,
    message: similarContracts.length > 0
      ? `Generated using ${similarContracts.length} similar ${category} contracts as reference`
      : `Generated with ${category} style rules (no references yet — keep generating to build library!)`
  });
};

// ─────────────────────────────────────────
// Index ALL existing contracts
// ─────────────────────────────────────────
const indexAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user._id });
    const results   = { total: 0, byCategory: {} };

    for (const contract of contracts) {
      const cat = await indexContract(
        contract._id,
        contract.content,
        contract.aiPrompt || '',
      );
      if (cat) {
        results.byCategory[cat] = (results.byCategory[cat] || 0) + 1;
        results.total++;
      }
    }

    res.json({
      message:    `Indexed ${results.total} contracts across ${Object.keys(results.byCategory).length} categories!`,
      total:      results.total,
      byCategory: results.byCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// Bulk upload contracts for training
// ─────────────────────────────────────────
const uploadContracts = async (req, res) => {
  const { contracts } = req.body;

  if (!Array.isArray(contracts) || contracts.length === 0) {
    return res.status(400).json({ message: 'Send an array of contracts' });
  }

  const results = { total: 0, byCategory: {} };

  for (const c of contracts) {
    const id  = crypto.randomBytes(8).toString('hex');
    const cat = c.category || detectCategory(c.prompt || c.content || '');

    await indexContract(id, c.content, c.prompt || '', cat);
    results.byCategory[cat] = (results.byCategory[cat] || 0) + 1;
    results.total++;
  }

  res.json({
    message:    `Uploaded ${results.total} contracts!`,
    total:      results.total,
    byCategory: results.byCategory
  });
};

// GET /api/rag/stats — show collection stats
const getStats = async (req, res) => {
  try {
    const stats = await getAllStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  indexAllContracts,
  generateWithRAG,
  uploadContracts,
  getStats,
  indexContract,
};