// backend/config/vectordb.js
// Contract similarity index using TF-IDF weighted cosine similarity
// (see utils/textSimilarity). Documents are PERSISTED in MongoDB (see
// models/ContractVector) and cached in memory per category for fast queries,
// so the learned library survives server restarts and cold starts.

const ContractVector = require('../models/ContractVector');
const { termFrequency, rankByTfIdf } = require('../utils/textSimilarity');

const CATEGORIES = ['web_development', 'mobile_development', 'design', 'content_writing', 'consulting', 'other'];

// In-memory cache: { category: [{ id, content, tf, metadata }] }
const store = {};
// Categories whose rows have already been pulled from Mongo this process.
const loaded = new Set();

// Hydrate a category's cache from Mongo the first time it's touched.
const ensureLoaded = async (category) => {
  if (loaded.has(category)) return;
  if (!store[category]) store[category] = [];
  try {
    const rows = await ContractVector.find({ category }).lean();
    store[category] = rows.map((r) => ({
      id:       r.docId,
      content:  r.content,
      tf:       r.vector && Object.keys(r.vector).length ? r.vector : termFrequency(r.content),
      metadata: r.metadata || {},
    }));
  } catch (err) {
    console.error(`vectordb hydrate error (${category}):`, err.message);
  }
  loaded.add(category);
};

const persist = async (category, entry) => {
  try {
    await ContractVector.findOneAndUpdate(
      { category, docId: entry.id },
      { category, docId: entry.id, content: entry.content, vector: entry.tf, metadata: entry.metadata },
      { upsert: true }
    );
  } catch (err) {
    console.error('vectordb persist error:', err.message);
  }
};

const getCollection = async (category = 'other') => {
  await ensureLoaded(category);
  const upsertCache = (entry) => {
    const idx = store[category].findIndex((d) => d.id === entry.id);
    if (idx === -1) store[category].push(entry);
    else store[category][idx] = entry;
  };
  const toEntry = ({ ids, documents, metadatas }) => ({
    id:       ids[0],
    content:  documents[0],
    tf:       termFrequency(documents[0]),
    metadata: metadatas[0],
  });

  return {
    add: async (args) => {
      const entry = toEntry(args);
      await persist(category, entry);
      upsertCache(entry);
    },
    update: async (args) => {
      const entry = toEntry(args);
      await persist(category, entry);
      upsertCache(entry);
    },
    get: async ({ ids }) => {
      const found = store[category].filter((d) => ids.includes(d.id));
      return { ids: found.map((d) => d.id) };
    },
    count: async () => store[category].length,
    query: async ({ queryTexts, nResults }) => {
      const ranked = rankByTfIdf(queryTexts[0], store[category], nResults);
      return { documents: [ranked.map((r) => r.content)] };
    },
  };
};

// Get stats for all categories — counts come straight from Mongo so they're
// accurate even for categories not yet hydrated into the cache.
const getAllStats = async () => {
  const stats = {};
  try {
    const counts = await ContractVector.aggregate([
      { $group: { _id: '$category', n: { $sum: 1 } } },
    ]);
    const byCat = Object.fromEntries(counts.map((c) => [c._id, c.n]));
    CATEGORIES.forEach((cat) => { stats[cat] = byCat[cat] || 0; });
  } catch (err) {
    console.error('vectordb stats error:', err.message);
    CATEGORIES.forEach((cat) => { stats[cat] = (store[cat] || []).length; });
  }
  return stats;
};

// Auto-detect category from prompt
const detectCategory = (prompt) => {
  const p = (prompt || '').toLowerCase();
  if (p.match(/react|node|express|mongodb|api|backend|frontend|website|web|fullstack|mern|next/)) return 'web_development';
  if (p.match(/mobile|android|ios|flutter|react native|swift|kotlin/)) return 'mobile_development';
  if (p.match(/logo|design|ui|ux|figma|brand|graphic|poster|banner|creative/)) return 'design';
  if (p.match(/content|writing|blog|article|copywriting|social media|seo|marketing/)) return 'content_writing';
  if (p.match(/consult|strategy|advisory|mentor|coach|business|management|audit/)) return 'consulting';
  return 'other';
};

module.exports = { getCollection, detectCategory, getAllStats, CATEGORIES };
