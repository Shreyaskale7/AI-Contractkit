import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ContractCustomizer from '../components/ContractCustomizer';
import { generateContract, getClients, refineContract } from '../services/api';
import toast from 'react-hot-toast';

const GenerateContract = () => {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [form, setForm]         = useState({ prompt: '', clientId: '', title: '' });
  const [refineInput, setRefineInput]     = useState('');
  const [refining, setRefining]           = useState(false);
  const [refineHistory, setRefineHistory] = useState([]);
  const [contractStyle, setContractStyle] = useState({
    font: 'Georgia, serif', theme: 'white',
    themeBg: '#ffffff', themeColor: '#1a1a1a',
    themeBorder: '#e2e8f0', size: 14, spacing: 1.8,
  });
  const location = useLocation();

  useEffect(() => {
    getClients().then(res => setClients(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.prefillPrompt) {
      setForm(prev => ({
        ...prev,
        prompt: location.state.prefillPrompt,
        title:  location.state.prefillTitle || '',
      }));
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.clientId) return toast.error('Please select a client');
    setLoading(true); setResult(null);
    try {
      const res = await generateContract(form);
      setResult(res.data);
      toast.success('Contract generated! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally { setLoading(false); }
  };

  const handleRefine = async () => {
    if (!refineInput.trim() || !result?._id) return;
    setRefining(true);
    try {
      const res = await refineContract(result._id, { instruction: refineInput });
      setResult(prev => ({ ...prev, content: res.data.content }));
      setRefineHistory(prev => [...prev, refineInput]);
      setRefineInput('');
      toast.success('Contract updated! ✅');
    } catch {
      toast.error('Failed to refine');
    } finally { setRefining(false); }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>${result.title}</title>
      <style>
        body { font-family: ${contractStyle.font}; max-width: 800px; margin: 40px auto; padding: 40px; color: ${contractStyle.themeColor}; background: ${contractStyle.themeBg}; font-size: ${contractStyle.size}px; line-height: ${contractStyle.spacing}; }
        h2 { text-transform: uppercase; font-size: 14px; letter-spacing: 1px; border-bottom: 2px solid #4f46e5; padding-bottom: 6px; margin-top: 24px; }
        p { line-height: ${contractStyle.spacing}; text-align: justify; }
      </style>
    </head><body>${result.content}</body></html>`);
    win.document.close();
    win.print();
  };

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  const quickSuggestions = [
    'Add a late payment penalty of 2% per month',
    'Make revision policy stricter — max 1 round',
    'Add a force majeure clause',
    'Increase notice period to 30 days',
    'Add a non-disclosure clause',
    'Change payment to 50% upfront',
  ];

  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40 }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>✨ Generate AI Contract</h1>
          <p style={{ color:'#94a3b8', marginTop:4 }}>Describe your project and let AI create a professional contract.</p>
        </div>

        {/* Form */}
        <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', marginBottom:24, maxWidth:700 }}>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Select Client</label>
              <select required value={form.clientId} onChange={e => setForm({...form, clientId:e.target.value})}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', background:'white' }}>
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name} — {c.company || c.email}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Contract Title</label>
              <input value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                placeholder="e.g. E-Commerce App Development Contract"
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }}
              />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Describe Your Project</label>
              <textarea required value={form.prompt} onChange={e => setForm({...form, prompt:e.target.value})}
                rows={4} placeholder="e.g. Create a freelance app development contract for ₹75,000 with 3 milestones and 2 revisions for an e-commerce mobile app..."
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical' }}
              />
            </div>

            <ContractCustomizer
              style={contractStyle}
              onChange={setContractStyle}
              contractType={result?.category || 'other'}
            />

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:600, cursor:'pointer', opacity: loading ? 0.7 : 1, boxShadow:'0 4px 14px rgba(99,102,241,0.3)' }}>
              {loading ? '⏳ Generating contract...' : '✨ Generate Contract'}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', maxWidth:700 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'#1e293b' }}>✅ {result.title}</h2>
              <span style={{ background:'#f0fdf4', color:'#16a34a', fontSize:12, padding:'4px 12px', borderRadius:20, fontWeight:500 }}>Generated</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <button
                onClick={() => {
                  const win = window.open('', '_blank');
                  win.document.write(`<html><head><title>${result.title}</title>
                    <style>
                      body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #1a1a1a; }
                      h2 { text-transform: uppercase; font-size: 14px; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 24px; }
                      p { line-height: 1.8; text-align: justify; }
                      ul li { line-height: 1.8; }
                    </style>
                  </head><body>${result.content}</body></html>`);
                  win.document.close();
                  win.print();
                }}
                style={{ background:'#1e293b', color:'white', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                🖨️ Print / Save PDF
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.content);
                  toast.success('Contract HTML copied!');
                }}
                style={{ background:'white', border:'1px solid #e2e8f0', color:'#374151', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                📋 Copy HTML
              </button>
            </div>

            {/* Risk Flags */}
            {result.riskFlags?.length > 0 && (
              <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:8, padding:16, marginBottom:20 }}>
                <div style={{ fontWeight:600, color:'#ea580c', marginBottom:8, fontSize:14 }}>⚠️ AI Risk Detector Found {result.riskFlags.length} Issues:</div>
                {result.riskFlags.map((flag, i) => (
                  <div key={i} style={{ fontSize:13, color:'#9a3412', padding:'4px 0' }}>• {flag}</div>
                ))}
              </div>
            )}

            {/* Contract Content */}
            <style>{`
              .contract-wrapper { font-family: 'Georgia', serif; color: #1a1a1a; }
              .contract-wrapper .contract-header { text-align: center; border-bottom: 3px double #1a1a1a; padding-bottom: 20px; margin-bottom: 24px; }
              .contract-wrapper .contract-header h1 { font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
              .contract-wrapper .contract-meta { text-align: center; font-size: 13px; color: #555; margin-bottom: 8px; }
              .contract-wrapper h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 10px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
              .contract-wrapper p { font-size: 14px; line-height: 1.8; margin-bottom: 12px; text-align: justify; }
              .contract-wrapper ul { margin: 10px 0 10px 20px; }
              .contract-wrapper ul li { font-size: 14px; line-height: 1.8; margin-bottom: 6px; }
              .contract-wrapper .signature-block { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-top: 2px solid #1a1a1a; padding-top: 24px; }
              .contract-wrapper .signature-block .sig-party { font-size: 13px; }
              .contract-wrapper .signature-block .sig-line { border-bottom: 1px solid #333; margin: 24px 0 6px; }
              .contract-wrapper .clause { font-size: 14px; line-height: 1.8; }
            `}</style>
            <div
              className="contract-wrapper"
              style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:40, maxHeight:600, overflowY:'auto', background:'#fffef9', boxShadow:'inset 0 0 0 1px #f0ede0' }}
              dangerouslySetInnerHTML={{ __html: result.content }}
            />

            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', marginTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#0f172a' }}>🤖 Refine Contract</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Tell the AI what to change — it updates only that part.</p>

              {refineHistory.length > 0 && (
                <div style={{ marginBottom: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  {refineHistory.map((h, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#64748b', padding: '2px 0' }}>✅ {h}</div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {quickSuggestions.map(s => (
                  <button key={s} type="button" onClick={() => setRefineInput(s)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <input value={refineInput} onChange={e => setRefineInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRefine()}
                  placeholder='e.g. "Add a penalty clause" or "Make payment terms stricter"'
                  style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none' }}
                />
                <button onClick={handleRefine} disabled={refining || !refineInput.trim()} type="button"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: refining || !refineInput.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                  {refining ? '⏳' : '✏️ Apply'}
                </button>
              </div>
            </div>

            <div style={{ marginTop:16, padding:12, background:'#f8fafc', borderRadius:8, fontSize:12, color:'#94a3b8' }}>
              🔗 Public Link: <span style={{ fontFamily:'monospace', color:'#4f46e5' }}>localhost:5000/api/contracts/public/{result.publicToken}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GenerateContract;