import DOMPurify from 'dompurify';

// All contract HTML comes from an LLM (and comments from anonymous clients),
// so sanitize before any dangerouslySetInnerHTML.
export const sanitizeHtml = (html) =>
  DOMPurify.sanitize(html || '', { USE_PROFILES: { html: true } });

const riskColors = {
  high: 'rgba(239,68,68,0.18)',
  medium: 'rgba(245,158,11,0.18)',
  low: 'rgba(139,92,246,0.16)',
};

// Wrap each risky clause found in the contract HTML in a highlighted <mark>.
// Call AFTER sanitizeHtml — the inserted markup is our own and safe.
export const highlightRisks = (html, risks = []) => {
  let out = html;
  for (const risk of risks) {
    const text = (risk.originalText || '').trim();
    if (text.length < 10) continue;
    const idx = out.indexOf(text);
    if (idx === -1) continue;
    const color = riskColors[risk.riskLevel] || riskColors.medium;
    out =
      out.slice(0, idx) +
      `<mark style="background:${color};padding:1px 2px;border-radius:3px" title="${risk.riskLevel?.toUpperCase()} RISK">` +
      text +
      '</mark>' +
      out.slice(idx + text.length);
  }
  return out;
};
