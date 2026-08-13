// backend/services/aiService.js
// Shared AI helpers so controllers don't duplicate Groq calls.
const groq = require('../config/groq');

const MODEL = 'llama-3.3-70b-versatile';

// Lightweight observability: log latency + token usage for every AI call so we
// can see how fast and how expensive each feature is.
const logAI = (label, startedAt, usage) =>
  console.log(`[groq] ${label} ${Date.now() - startedAt}ms tokens=${usage?.total_tokens ?? 'n/a'}`);

const CONTRACT_HTML_STRUCTURE = `
Use this EXACT structure:
- <div class="contract-header"> for the title and parties section
- <div class="contract-meta"> for date, contract number
- <h2 class="section-title"> for section numbers like "1. PROJECT SCOPE"
- <p class="clause"> for clause text
- <div class="signature-block"> for signature section at the bottom`;

// Strip ```html / ```json fences that the model sometimes adds
const stripFences = (raw) => raw.replace(/```(html|json)?/g, '').trim();

// Build the (system, user) prompt pair for a contract draft. `mode`
// switches between a plain brief and raw meeting notes.
const buildDraftPrompts = ({ input, mode = 'brief' }) => {
  const systemPrompt = mode === 'notes'
    ? `You are a senior legal contract attorney.
You will receive raw meeting notes, a rough transcript, or bullet points from a client discovery call.
Your job is to extract the deliverables, pricing, timeline, and any other agreements, and turn them into a FORMAL, PROFESSIONAL contract with proper legal formatting in HTML.
${CONTRACT_HTML_STRUCTURE}

Always include standard freelance clauses (Scope, Payment, Timeline, IP, Confidentiality, Termination, Liability, etc.) filling in the specifics from the notes.`
    : `You are a senior legal contract attorney specializing in freelance and technology contracts.
Generate a FORMAL, PROFESSIONAL contract with proper legal formatting in HTML.
${CONTRACT_HTML_STRUCTURE}

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
Be extremely specific with amounts, dates, and terms mentioned in the requirement.`;

  const userPrompt = mode === 'notes'
    ? `Create a formal freelance contract based on these meeting notes:\n\n"${input}"`
    : `Create a formal freelance contract for: "${input}"`;

  return { systemPrompt, userPrompt };
};

const draftContract = async ({ input, mode = 'brief' }) => {
  const { systemPrompt, userPrompt } = buildDraftPrompts({ input, mode });
  const startedAt = Date.now();
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 6000,
    temperature: 0.3,
  });
  logAI('draftContract', startedAt, completion.usage);

  return stripFences(completion.choices[0].message.content);
};

// Same as draftContract but streams tokens through onDelta as they
// arrive, returning the complete cleaned content at the end.
const draftContractStream = async ({ input, mode = 'brief', onDelta }) => {
  const { systemPrompt, userPrompt } = buildDraftPrompts({ input, mode });
  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 6000,
    temperature: 0.3,
    stream: true,
  });

  const startedAt = Date.now();
  let full = '';
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content || '';
    if (delta) {
      full += delta;
      onDelta?.(delta);
    }
  }
  logAI('draftContractStream', startedAt);
  return stripFences(full);
};

// Analyze a contract and return [{ originalText, riskLevel, reasoning }]
const analyzeRisks = async (contractContent) => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a contract risk analyzer.
Analyze the contract and identify missing or risky clauses.
Respond ONLY with a JSON array of objects.
Example: [{"originalText": "The contractor shall indemnify the client against all claims...", "riskLevel": "high", "reasoning": "Uncapped liability for the contractor."}]
Maximum 5 items. If contract looks good, return [].
Do not include any text outside the JSON array.`,
        },
        { role: 'user', content: `Analyze this contract for risks:\n${contractContent}` },
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    const parsed = JSON.parse(stripFences(completion.choices[0].message.content));
    if (!Array.isArray(parsed)) return [];
    // Keep only well-formed entries so bad model output can't break the schema
    return parsed
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        originalText: String(r.originalText || ''),
        riskLevel: ['high', 'medium', 'low'].includes(r.riskLevel) ? r.riskLevel : 'medium',
        reasoning: String(r.reasoning || ''),
      }))
      .slice(0, 5);
  } catch {
    return [];
  }
};

// Apply an edit instruction to existing contract HTML
const editContract = async ({ content, systemPrompt, userPrompt }) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 6000,
    temperature: 0.2,
  });
  return stripFences(completion.choices[0].message.content);
};

module.exports = { draftContract, draftContractStream, analyzeRisks, editContract, stripFences, MODEL };
