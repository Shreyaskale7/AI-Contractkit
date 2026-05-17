// backend/config/vectordb.js
// Pure in-memory vector store — no ChromaDB needed!
// Uses simple cosine similarity on word frequency vectors

const store = {}; // { category: [{ id, content, vector }] }

// Convert text to a simple frequency vector
const textToVector = (text) => {
  const clean  = text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^a-z\s]/g, ' ');
  const words  = clean.split(/\s+/).filter(w => w.length > 3);
  const freq   = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return freq;
};

// Cosine similarity between two frequency vectors
const cosineSimilarity = (v1, v2) => {
  const keys    = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let   dot     = 0, mag1 = 0, mag2 = 0;
  keys.forEach(k => {
    const a = v1[k] || 0;
    const b = v2[k] || 0;
    dot  += a * b;
    mag1 += a * a;
    mag2 += b * b;
  });
  return mag1 && mag2 ? dot / (Math.sqrt(mag1) * Math.sqrt(mag2)) : 0;
};

const getCollection = async (category = 'other') => {
  if (!store[category]) store[category] = [];
  return {
    // Add document to store
    add: async ({ ids, documents, metadatas }) => {
      store[category].push({
        id:       ids[0],
        content:  documents[0],
        vector:   textToVector(documents[0]),
        metadata: metadatas[0],
      });
    },
    // Update existing document
    update: async ({ ids, documents, metadatas }) => {
      const idx = store[category].findIndex(d => d.id === ids[0]);
      if (idx !== -1) {
        store[category][idx] = {
          id:       ids[0],
          content:  documents[0],
          vector:   textToVector(documents[0]),
          metadata: metadatas[0],
        };
      }
    },
    // Get by ID
    get: async ({ ids }) => {
      const found = store[category].filter(d => ids.includes(d.id));
      return { ids: found.map(d => d.id) };
    },
    // Count documents
    count: async () => store[category].length,
    // Query similar documents
    query: async ({ queryTexts, nResults }) => {
      if (store[category].length === 0) return { documents: [[]] };
      const queryVec = textToVector(queryTexts[0]);
      const scored   = store[category]
        .map(doc => ({ doc, score: cosineSimilarity(queryVec, doc.vector) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, nResults);
      return { documents: [scored.map(s => s.doc.content)] };
    }
  };
};

// Get stats for all categories
const getAllStats = async () => {
  const stats = {};
  const CATEGORIES = ['web_development','mobile_development','design','content_writing','consulting','other'];
  CATEGORIES.forEach(cat => { stats[cat] = (store[cat] || []).length; });
  return stats;
};

// Auto-detect category from prompt
const detectCategory = (prompt) => {
  const p = prompt.toLowerCase();
  if (p.match(/react|node|express|mongodb|api|backend|frontend|website|web|fullstack|mern|next/)) return 'web_development';
  if (p.match(/mobile|android|ios|flutter|react native|swift|kotlin/)) return 'mobile_development';
  if (p.match(/logo|design|ui|ux|figma|brand|graphic|poster|banner|creative/)) return 'design';
  if (p.match(/content|writing|blog|article|copywriting|social media|seo|marketing/)) return 'content_writing';
  if (p.match(/consult|strategy|advisory|mentor|coach|business|management|audit/)) return 'consulting';
  return 'other';
};

const CATEGORIES = ['web_development','mobile_development','design','content_writing','consulting','other'];

module.exports = { getCollection, detectCategory, getAllStats, CATEGORIES };