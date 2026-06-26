// backend/services/scopeService.js
// "Scope Creep Defender" — given a contract and a new client request, decide
// whether the request is out of scope, locate the governing clause inside the
// contract, score confidence, and draft a response email in a chosen tone.
//
// The LLM call is wrapped here so the same logic powers both the API route and
// the offline evaluation harness (eval/runScopeEval.js). The pure helpers
// (prompt building, clause location, result normalization) are exported so they
// can be unit-tested without hitting the network.
const groq = require('../config/groq');

const MODEL = 'llama-3.3-70b-versatile';

// Email tone presets the user can pick from in the UI.
const TONES = {
  professional: 'polite, professional, and neutral',
  firm: 'firm and direct but still courteous — make clear the work is additional and will require a separate change order or fee',
  friendly: 'warm and friendly, prioritizing the long-term relationship, while still clarifying what is and isn\'t included',
  upsell: 'positive and opportunity-framed — present the additional work as an exciting paid add-on with a clear next step and an invitation to proceed',
};
const DEFAULT_TONE = 'professional';

const resolveTone = (tone) => (TONES[tone] ? tone : DEFAULT_TONE);

const buildSystemPrompt = (tone) => `You are the "Scope Creep Defender", an expert freelance contract lawyer.
You are given a signed contract and a new request from the client.

Decide whether the new request is covered by the existing contract scope, or
whether it is additional (out-of-scope) work. Then:
1. Quote the EXACT clause text from the contract that governs this (copy it verbatim, do not paraphrase).
2. Give your confidence as a number between 0 and 1.
3. Draft a short email the freelancer can send. Its tone should be ${TONES[resolveTone(tone)]}.
   If the request is in scope, confirm it is included. If it is out of scope,
   frame it as a paid add-on or change order.

Return ONLY a JSON object with this exact structure:
{
  "isOutOfScope": true or false,
  "confidence": 0.0 to 1.0,
  "relevantClause": "exact verbatim text copied from the contract",
  "reasoning": "one or two sentence explanation",
  "draftEmail": "the drafted email to the client"
}`;

// Strip HTML and collapse whitespace so clause matching is robust to markup.
const normalizeText = (s) =>
  (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Locate a quoted clause inside the contract's plain text. Returns character
// offsets, the matched snippet, and a surrounding context window for the UI to
// display with the clause highlighted — or null if the clause can't be found
// (i.e. the model likely hallucinated the citation).
const locateClause = (clause, contractContent) => {
  const needle = normalizeText(clause).toLowerCase();
  if (needle.length < 10) return null;

  const text = normalizeText(contractContent);
  const haystack = text.toLowerCase();

  let start = haystack.indexOf(needle);
  let matchLen = needle.length;
  if (start === -1) {
    // Fall back to a distinctive prefix — handles minor model paraphrasing
    // of the clause's tail while still requiring a substantial exact match.
    const frag = needle.slice(0, 60);
    if (frag.length < 30) return null;
    start = haystack.indexOf(frag);
    if (start === -1) return null;
    matchLen = frag.length;
  }
  const end = start + matchLen;
  const ctxStart = Math.max(0, start - 90);
  const ctxEnd = Math.min(text.length, end + 90);
  return {
    start,
    end,
    snippet: text.slice(start, end),
    context: {
      before: (ctxStart > 0 ? '…' : '') + text.slice(ctxStart, start),
      match: text.slice(start, end),
      after: text.slice(end, ctxEnd) + (ctxEnd < text.length ? '…' : ''),
    },
  };
};

// Backwards-compatible boolean check used elsewhere/in tests.
const verifyClause = (clause, contractContent) => locateClause(clause, contractContent) !== null;

// Coerce whatever the model returns into a safe, well-typed result.
const normalizeScopeResult = (raw, contractContent) => {
  const obj = raw && typeof raw === 'object' ? raw : {};

  let confidence = Number(obj.confidence);
  if (Number.isNaN(confidence)) confidence = 0.5;
  if (confidence > 1) confidence = confidence / 100; // model gave a percentage
  confidence = Math.min(1, Math.max(0, confidence));

  const relevantClause = String(obj.relevantClause || '');
  const location = locateClause(relevantClause, contractContent);
  const clauseVerified = location !== null;

  // A citation we couldn't find in the contract shouldn't be trusted blindly —
  // soften confidence so the UI can flag it.
  if (!clauseVerified && relevantClause) confidence = Math.min(confidence, 0.5);

  return {
    isOutOfScope: Boolean(obj.isOutOfScope),
    confidence: Number(confidence.toFixed(2)),
    relevantClause,
    clauseVerified,
    clauseLocation: location ? { start: location.start, end: location.end } : null,
    clauseContext: location ? location.context : null,
    reasoning: String(obj.reasoning || ''),
    draftEmail: String(obj.draftEmail || ''),
  };
};

const buildMessages = (contractContent, clientRequest, tone = DEFAULT_TONE) => [
  { role: 'system', content: buildSystemPrompt(tone) },
  {
    role: 'user',
    content: `Contract:\n${contractContent}\n\nClient's New Request:\n${String(clientRequest).slice(0, 4000)}`,
  },
];

// Run the full analysis against Groq and return a normalized result.
// Throws on network/parse failure so callers can decide how to respond.
const analyzeScopeCreep = async ({ contractContent, clientRequest, tone = DEFAULT_TONE }) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: buildMessages(contractContent, clientRequest, tone),
    max_tokens: 2000,
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(completion.choices[0].message.content);
  const result = normalizeScopeResult(parsed, contractContent);
  result.tone = resolveTone(tone);
  return result;
};

module.exports = {
  analyzeScopeCreep,
  normalizeScopeResult,
  verifyClause,
  locateClause,
  buildMessages,
  resolveTone,
  TONES,
  MODEL,
};
