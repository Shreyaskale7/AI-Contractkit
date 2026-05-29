import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import { generateProposal, getClients } from '../services/api';
import toast from 'react-hot-toast';

const GenerateProposal = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    prompt: '', clientId: '', title: '', budget: '', timeline: '',
  });

  useEffect(() => {
    getClients().then((res) => setClients(res.data)).catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.clientId) return toast.error('Please select a client');
    setLoading(true);
    setResult(null);
    try {
      const res = await generateProposal(form);
      setResult(res.data);
      toast.success('Proposal generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>${result.title}</title>
          <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #1a1a1a; }
            h1 { color: #3b82f6; font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 28px; color: #3b82f6; }
            p { line-height: 1.8; text-align: justify; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #3b82f6; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${result.title}</h1>
          <p style="color:#94a3b8;margin-bottom:24px;">Prepared for: ${clients.find((c) => c._id === form.clientId)?.name || 'Client'}</p>
          ${result.content}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <PageShell
      title="AI proposal generator"
      subtitle="Generate a winning project proposal in seconds."
    >
      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.5fr' : '1fr', gap: 24 }}>
        <div className="card card-body" style={{ height: 'fit-content' }}>
          <h2 className="section-title section-title--sm">Project details</h2>
          <form onSubmit={handleGenerate} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="prop-client">Client *</label>
              <select
                id="prop-client"
                className="input-select"
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.company || c.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="prop-title">Proposal title</label>
              <input
                id="prop-title"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. E-Commerce Website Development Proposal"
              />
            </div>

            <div className="form-grid-2">
              <div>
                <label className="input-label" htmlFor="prop-budget">Budget</label>
                <input
                  id="prop-budget"
                  className="input-field"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="e.g. ₹75,000"
                />
              </div>
              <div>
                <label className="input-label" htmlFor="prop-timeline">Timeline</label>
                <input
                  id="prop-timeline"
                  className="input-field"
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                  placeholder="e.g. 6 weeks"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="prop-prompt">Describe the project *</label>
              <textarea
                id="prop-prompt"
                className="textarea-field"
                required
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                rows={5}
                placeholder="Describe scope, deliverables, and goals..."
              />
            </div>

            <button type="submit" disabled={loading} className={`btn btn-primary${loading ? ' loading' : ''}`}>
              {loading ? 'Generating proposal…' : 'Generate proposal'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card card-body">
            <div className="page-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="section-title section-title--sm">{result.title}</h2>
                <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                  {form.budget && `Budget: ${form.budget}`} {form.timeline && `· Timeline: ${form.timeline}`}
                </p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
                Export PDF
              </button>
            </div>

            <div
              className="card card-body"
              style={{ maxHeight: 600, overflowY: 'auto', fontSize: 14, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: result.content }}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default GenerateProposal;
