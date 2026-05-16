import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { generateProposal, getClients } from '../services/api';
import toast from 'react-hot-toast';

const GenerateProposal = () => {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [form, setForm]         = useState({
    prompt: '', clientId: '', title: '', budget: '', timeline: ''
  });

  useEffect(() => {
    getClients().then(res => setClients(res.data)).catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.clientId) return toast.error('Please select a client');
    setLoading(true);
    setResult(null);
    try {
      const res = await generateProposal(form);
      setResult(res.data);
      toast.success('Proposal generated! 🎉');
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
            h1 { color: #4f46e5; font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #4f46e5; padding-bottom: 6px; margin-top: 28px; color: #4f46e5; }
            p { line-height: 1.8; text-align: justify; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #4f46e5; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>⚡ ${result.title}</h1>
          <p style="color:#94a3b8;margin-bottom:24px;">Prepared for: ${clients.find(c => c._id === form.clientId)?.name || 'Client'}</p>
          ${result.content}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const inputStyle = {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#f8fafc', minHeight: '100vh' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>🤖 AI Proposal Generator</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Generate a winning project proposal in seconds.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.5fr' : '1fr', gap: 24 }}>

          {/* Form */}
          <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', height: 'fit-content' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1e293b' }}>Project Details</h2>
            <form onSubmit={handleGenerate}>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Client *</label>
                <select required value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}
                  style={{ ...inputStyle, background: 'white' }}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} — {c.company || c.email}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Proposal Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. E-Commerce Website Development Proposal"
                  style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Budget</label>
                  <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g. ₹75,000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Timeline</label>
                  <input value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}
                    placeholder="e.g. 6 weeks" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Describe the Project *</label>
                <textarea required value={form.prompt}
                  onChange={e => setForm({ ...form, prompt: e.target.value })}
                  rows={5} placeholder="e.g. Build a full-stack e-commerce website with React frontend, Node.js backend, payment integration, admin dashboard, and mobile responsive design for a clothing brand..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Generating proposal...' : '🤖 Generate Proposal'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{result.title}</h2>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                    {form.budget && `Budget: ${form.budget}`} {form.timeline && `· Timeline: ${form.timeline}`}
                  </p>
                </div>
                <button onClick={handlePrint}
                  style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  🖨️ Export PDF
                </button>
              </div>

              <div
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 28, maxHeight: 600, overflowY: 'auto', fontSize: 14, lineHeight: 1.8, color: '#374151' }}
                dangerouslySetInnerHTML={{ __html: result.content }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GenerateProposal;