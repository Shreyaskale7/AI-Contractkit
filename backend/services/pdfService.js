// backend/services/pdfService.js
// Renders a contract (AI-generated HTML) into a professional, multi-page PDF:
// letterhead, parties preamble, numbered sections, lists, pricing/milestone
// tables, two-party execution block, an electronic-signature certificate, and
// running page numbers. pdfkit can't render HTML, so we parse it into an
// ordered block structure first.
const PDFDocument = require('pdfkit');

// ── Palette & metrics ──────────────────────────────────────────────
const INK = '#1f2937';
const MUTED = '#6b7280';
const ACCENT = '#4338ca';
const LINE = '#d8dce4';
const SOFT = '#f3f4f6';
const MARGIN = 56;

// ── HTML helpers ───────────────────────────────────────────────────
const decodeEntities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–');

const clean = (s) => decodeEntities((s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const parseTable = (tableHtml) => {
  const rows = [];
  const trs = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const tr of trs) {
    const cells = [];
    let header = false;
    const cellRe = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = cellRe.exec(tr))) {
      if (m[1].toLowerCase() === 'th') header = true;
      cells.push(clean(m[2]));
    }
    if (cells.length) rows.push({ cells, header });
  }
  return rows;
};

// Parse contract HTML into ordered blocks: heading | paragraph | list | table.
const parseBlocks = (html) => {
  // Drop any AI-provided signature block — we render our own execution page.
  const s = (html || '').replace(/<div[^>]*class="[^"]*signature-block[^"]*"[\s\S]*?<\/div>/gi, '');
  const blocks = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>|<p[^>]*>([\s\S]*?)<\/p>|<(ul|ol)[^>]*>([\s\S]*?)<\/\4>|<table[^>]*>([\s\S]*?)<\/table>/gi;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) {
      const text = clean(m[2]);
      if (text) blocks.push({ type: 'heading', level: Number(m[1]), text });
    } else if (m[3] !== undefined) {
      const text = clean(m[3]);
      if (text) blocks.push({ type: 'paragraph', text });
    } else if (m[4]) {
      const items = (m[5].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [])
        .map((li) => clean(li)).filter(Boolean);
      if (items.length) blocks.push({ type: 'list', ordered: m[4].toLowerCase() === 'ol', items });
    } else if (m[6] !== undefined) {
      const rows = parseTable(m[6]);
      if (rows.length) blocks.push({ type: 'table', rows });
    }
  }
  // Fallback: unstructured content → split into paragraphs.
  if (!blocks.length && clean(html)) {
    for (const p of clean(html).split(/(?<=[.])\s+(?=[A-Z])/).filter(Boolean)) {
      blocks.push({ type: 'paragraph', text: p });
    }
  }
  return blocks;
};

const fmtDate = (d) => new Date(d || Date.now())
  .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Layout primitives ──────────────────────────────────────────────
const contentW = (doc) => doc.page.width - MARGIN * 2;
const bottomLimit = (doc) => doc.page.height - MARGIN - 24; // leave room for footer

const ensureSpace = (doc, needed) => {
  if (doc.y + needed > bottomLimit(doc)) doc.addPage();
};

const hr = (doc, color = LINE) => {
  doc.moveTo(MARGIN, doc.y).lineTo(doc.page.width - MARGIN, doc.y)
    .lineWidth(0.75).strokeColor(color).stroke();
};

// Letterhead on the first page.
const drawLetterhead = (doc, contract, provider) => {
  const ref = `CTK-${String(contract._id || '').toString().slice(-6).toUpperCase() || '000000'}`;
  const topY = doc.y;
  // Left: provider identity
  doc.font('Helvetica-Bold').fontSize(15).fillColor(INK).text(provider.name, MARGIN, topY);
  const contactBits = [provider.email, provider.phone, provider.website].filter(Boolean).join('  ·  ');
  if (contactBits) doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(contactBits);
  // Right: contract meta block
  const metaX = doc.page.width - MARGIN - 180;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(ACCENT)
    .text('CONTRACT', metaX, topY, { width: 180, align: 'right' });
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
    .text(`Ref: ${ref}`, metaX, topY + 14, { width: 180, align: 'right' })
    .text(`Date: ${fmtDate(contract.createdAt)}`, { width: 180, align: 'right' })
    .text(`Status: ${(contract.status || 'draft').toUpperCase()}`, { width: 180, align: 'right' });
  doc.y = Math.max(doc.y, topY + 52);
  doc.moveDown(0.4);
  hr(doc, ACCENT);
  doc.moveDown(1.1);
};

// Centered title.
const drawTitle = (doc, contract) => {
  // Pass explicit x + width so it centers across the FULL page, not within
  // whatever box the letterhead left the cursor in.
  doc.font('Helvetica-Bold').fontSize(20).fillColor(INK)
    .text((contract.title || 'Service Agreement').toUpperCase(), MARGIN, doc.y, { align: 'center', width: contentW(doc) });
  doc.moveDown(1.2);
};

// "This Agreement is made between … and …" preamble.
const drawParties = (doc, contract, provider, client) => {
  ensureSpace(doc, 90);
  const boxTop = doc.y;
  const pad = 14;
  doc.font('Times-Roman').fontSize(10.5).fillColor(INK);
  const text =
    `This Service Agreement (the "Agreement") is made and entered into as of ${fmtDate(contract.createdAt)} ` +
    `(the "Effective Date"), by and between ${provider.name} (the "Service Provider") ` +
    `and ${client.name} (the "Client"). The Service Provider and the Client may be referred ` +
    `to individually as a "Party" and collectively as the "Parties".`;
  const h = doc.heightOfString(text, { width: contentW(doc) - pad * 2, lineGap: 2 });
  doc.save().roundedRect(MARGIN, boxTop, contentW(doc), h + pad * 2, 6)
    .fillColor(SOFT).fill().restore();
  doc.fillColor(INK).text(text, MARGIN + pad, boxTop + pad, { width: contentW(doc) - pad * 2, lineGap: 2, align: 'justify' });
  doc.y = boxTop + h + pad * 2;
  doc.moveDown(1.1);
};

// Section heading: keep AI numbering if present, style strongly with a rule.
const drawHeading = (doc, text, level) => {
  ensureSpace(doc, 40);
  doc.moveDown(level <= 2 ? 0.6 : 0.3);
  if (level <= 2) {
    doc.font('Helvetica-Bold').fontSize(11.5).fillColor(ACCENT)
      .text(text.toUpperCase(), MARGIN, doc.y, { align: 'center', width: contentW(doc) });
    doc.moveDown(0.15);
    hr(doc);
    doc.moveDown(0.45);
  } else {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK)
      .text(text, MARGIN, doc.y, { align: 'center', width: contentW(doc) });
    doc.moveDown(0.25);
  }
};

const drawParagraph = (doc, text) => {
  ensureSpace(doc, 24);
  doc.font('Times-Roman').fontSize(10.5).fillColor(INK)
    .text(text, MARGIN, doc.y, { align: 'justify', width: contentW(doc), lineGap: 2.5 });
  doc.moveDown(0.5);
};

const drawList = (doc, list) => {
  doc.font('Times-Roman').fontSize(10.5).fillColor(INK);
  list.items.forEach((item, i) => {
    ensureSpace(doc, 22);
    const bullet = list.ordered ? `${i + 1}.` : '•';
    const x = MARGIN + 16;
    const y = doc.y;
    doc.text(bullet, x, y, { width: 16 });
    doc.text(item, x + 18, y, { width: contentW(doc) - 34, align: 'left', lineGap: 2 });
    doc.moveDown(0.35);
  });
  doc.moveDown(0.3);
};

// Pricing / milestone tables — real grid with shaded header, borders, wrapping.
const drawTable = (doc, table) => {
  const rows = table.rows;
  const cols = Math.max(...rows.map((r) => r.cells.length));
  const W = contentW(doc);
  // Weight first column wider for "Description | Amount"-style tables.
  let widths;
  if (cols === 2) widths = [W * 0.68, W * 0.32];
  else if (cols === 3) widths = [W * 0.5, W * 0.25, W * 0.25];
  else widths = Array(cols).fill(W / cols);
  const pad = 7;

  doc.moveDown(0.3);
  for (const row of rows) {
    const isHead = row.header;
    doc.font(isHead ? 'Helvetica-Bold' : 'Times-Roman').fontSize(isHead ? 9.5 : 10).fillColor(INK);
    // measure row height
    let rowH = 0;
    for (let c = 0; c < cols; c++) {
      const txt = row.cells[c] || '';
      const h = doc.heightOfString(txt, { width: widths[c] - pad * 2 });
      rowH = Math.max(rowH, h);
    }
    rowH += pad * 2;
    ensureSpace(doc, rowH);
    const y = doc.y;
    let x = MARGIN;
    for (let c = 0; c < cols; c++) {
      if (isHead) doc.save().rect(x, y, widths[c], rowH).fillColor(SOFT).fill().restore();
      doc.save().rect(x, y, widths[c], rowH).lineWidth(0.5).strokeColor(LINE).stroke().restore();
      const align = cols > 1 && c === cols - 1 && !isHead ? 'right' : 'left';
      doc.font(isHead ? 'Helvetica-Bold' : 'Times-Roman').fontSize(isHead ? 9.5 : 10).fillColor(INK)
        .text(row.cells[c] || '', x + pad, y + pad, { width: widths[c] - pad * 2, align });
      x += widths[c];
    }
    doc.y = y + rowH;
  }
  doc.moveDown(0.7);
};

// "IN WITNESS WHEREOF" + two-party execution block.
const drawExecution = (doc, contract, provider, client) => {
  ensureSpace(doc, 200);
  doc.moveDown(0.8);
  hr(doc);
  doc.moveDown(0.8);
  doc.font('Times-Italic').fontSize(10).fillColor(INK).text(
    'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the dates set forth below.',
    { align: 'justify' }
  );
  doc.moveDown(1.4);

  const colW = (contentW(doc) - 30) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 30;
  const top = doc.y;

  const block = (x, label, name, signed) => {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(label, x, top, { width: colW });
    let lineY = top + 48;
    // signature image (client) if available
    if (signed?.data) {
      try {
        const b64 = signed.data.split(',')[1] || signed.data;
        doc.image(Buffer.from(b64, 'base64'), x, top + 14, { fit: [colW - 10, 34] });
      } catch { /* ignore bad image */ }
    }
    doc.moveTo(x, lineY).lineTo(x + colW, lineY).lineWidth(0.75).strokeColor(INK).stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(name, x, lineY + 6, { width: colW });
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
      .text(`Signature${signed ? '' : ' / Date'}`, x, lineY + 22, { width: colW });
    if (signed?.signedAt) {
      doc.text(`Signed: ${new Date(signed.signedAt).toLocaleString('en-IN')}`, x, lineY + 34, { width: colW });
    }
  };

  block(leftX, 'SERVICE PROVIDER', provider.name, null);
  block(rightX, 'CLIENT', contract.signature?.signerName || client.name, contract.signature);
  doc.y = top + 110;
};

// Boxed electronic-signature certificate (tamper-evidence record).
const drawCertificate = (doc, sig) => {
  if (!sig?.data) return;
  ensureSpace(doc, 150);
  doc.moveDown(0.6);
  const top = doc.y;
  const pad = 14;
  const lines = [
    ['Signer', sig.signerName || 'Client'],
    ['Email', sig.signerEmail || '—'],
    ['Signed at', sig.signedAt ? new Date(sig.signedAt).toLocaleString('en-IN') : '—'],
    ['IP address', sig.ip || '—'],
    ['Device', (sig.userAgent || '—').slice(0, 90)],
    ['Content hash (SHA-256)', sig.contentHash || '—'],
  ];
  doc.font('Helvetica').fontSize(8.5);
  let bodyH = 22;
  for (const [, v] of lines) bodyH += doc.heightOfString(v, { width: contentW(doc) - pad * 2 - 120 }) + 4;

  doc.save().roundedRect(MARGIN, top, contentW(doc), bodyH + pad, 6)
    .lineWidth(0.75).strokeColor(LINE).stroke().restore();
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(ACCENT)
    .text('ELECTRONIC SIGNATURE CERTIFICATE', MARGIN + pad, top + pad);
  let y = top + pad + 18;
  for (const [k, v] of lines) {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(k, MARGIN + pad, y, { width: 116 });
    doc.font('Helvetica').fontSize(8.5).fillColor(INK)
      .text(v, MARGIN + pad + 120, y, { width: contentW(doc) - pad * 2 - 120 });
    y = doc.y + 4;
  }
  doc.y = top + bodyH + pad;
};

// Footer (page numbers + provider/title) on every page, added after layout.
const addFooters = (doc, contract, provider) => {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    // Writing in the bottom-margin band would otherwise make pdfkit think the
    // text overflows and spawn an extra page — so drop the bottom margin while
    // we render the footer, then restore it.
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - MARGIN + 8;
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text(`${provider.name} — ${contract.title || 'Service Agreement'}`,
      MARGIN, y, { width: contentW(doc) - 120, align: 'left', lineBreak: false });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`,
      doc.page.width - MARGIN - 120, y, { width: 120, align: 'right', lineBreak: false });
    doc.page.margins.bottom = savedBottom;
  }
};

// ── Public API ─────────────────────────────────────────────────────
const streamContractPdf = (contract, res) => {
  const doc = new PDFDocument({ size: 'A4', margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN }, bufferPages: true });

  res.setHeader('Content-Type', 'application/pdf');
  const safeTitle = (contract.title || 'contract').replace(/[^a-z0-9 _-]/gi, '').slice(0, 60).trim() || 'contract';
  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
  doc.pipe(res);

  // Parties (controllers populate these; fall back to generics otherwise)
  const provider = {
    name: contract.userId?.businessName || contract.userId?.name || 'Service Provider',
    email: contract.userId?.email || '',
    phone: contract.userId?.phone || '',
    website: contract.userId?.website || '',
  };
  const client = {
    name: contract.clientId?.company || contract.clientId?.name || 'Client',
    email: contract.clientId?.email || '',
  };

  drawLetterhead(doc, contract, provider);
  drawTitle(doc, contract);
  drawParties(doc, contract, provider, client);

  for (const block of parseBlocks(contract.content)) {
    if (block.type === 'heading') drawHeading(doc, block.text, block.level);
    else if (block.type === 'paragraph') drawParagraph(doc, block.text);
    else if (block.type === 'list') drawList(doc, block);
    else if (block.type === 'table') drawTable(doc, block);
  }

  drawExecution(doc, contract, provider, client);
  drawCertificate(doc, contract.signature);

  addFooters(doc, contract, provider);
  doc.end();
};

module.exports = { streamContractPdf };
