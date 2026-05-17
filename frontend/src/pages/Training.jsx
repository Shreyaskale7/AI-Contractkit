import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { indexAllContracts } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const Training = () => {
  const [indexing,  setIndexing]  = useState(false);
  const [indexed,   setIndexed]   = useState(null);
  const [stats,     setStats]     = useState(null);
  const [contracts, setContracts] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await axios.get(
          `${import.meta.env.VITE_API_URL}/rag/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch {}
    };
    fetchStats();
  }, [indexed]);

  const handleIndexAll = async () => {
    setIndexing(true);
    try {
      const res = await indexAllContracts();
      setIndexed(res.data.count);
      toast.success(`Indexed ${res.data.count} contracts! 🧠`);
    } catch { toast.error('Indexing failed'); }
    finally { setIndexing(false); }
  };

  return (
    <div style={{ display:'flex', background:'#f8fafc', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ marginLeft:220, flex:1, padding:'32px 40px' }}>

        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:4 }}>🧠 AI Training Center</h1>
          <p style={{ fontSize:14, color:'#64748b' }}>Train your AI on your contract library for smarter, more personalized generation.</p>
        </div>

        {stats && (
          <div style={{ background:'white', borderRadius:12, padding:24, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:'#0f172a', marginBottom:16 }}>📊 Learning Library Status</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {Object.entries(stats).map(([cat, count]) => (
                <div key={cat} style={{ background:'#f8fafc', borderRadius:8, padding:14, textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:700, color: count > 0 ? '#6366f1' : '#94a3b8' }}>{count}</div>
                  <div style={{ fontSize:11, color:'#64748b', textTransform:'capitalize', marginTop:4 }}>
                    {cat.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize:10, color: count >= 10 ? '#16a34a' : count >= 3 ? '#f59e0b' : '#94a3b8', marginTop:2, fontWeight:500 }}>
                    {count >= 10 ? '🟢 Well trained' : count >= 3 ? '🟡 Learning' : '⚪ Not trained'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:12, color:'#94a3b8' }}>
              💡 Tip: Each category needs 10+ contracts to be "well trained". Keep generating contracts to improve accuracy.
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{ background:'white', borderRadius:12, padding:24, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:24 }}>
          <h2 style={{ fontSize:15, fontWeight:600, color:'#0f172a', marginBottom:16 }}>How Smart Learning Works</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { step:'01', icon:'📤', title:'Upload Contracts', desc:'Add thousands of real contracts to train on. The more the better.' },
              { step:'02', icon:'🔍', title:'AI Learns Patterns', desc:'System analyzes clause patterns, payment terms, and your writing style.' },
              { step:'03', icon:'⚡', title:'Better Generation', desc:'Every new contract uses your library as reference for personalized output.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ padding:16, background:'#f8fafc', borderRadius:10, textAlign:'center' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#6366f1', marginBottom:8 }}>STEP {step}</div>
                <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Index existing */}
        <div style={{ background:'white', borderRadius:12, padding:24, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:24 }}>
          <h2 style={{ fontSize:15, fontWeight:600, color:'#0f172a', marginBottom:4 }}>Step 1 — Index Your Existing Contracts</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Index all contracts you've already generated so the AI can learn from them.</p>
          <button onClick={handleIndexAll} disabled={indexing}
            style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:600, cursor:'pointer', opacity: indexing ? 0.7 : 1 }}>
            {indexing ? '⏳ Indexing...' : '🧠 Index All My Contracts'}
          </button>
          {indexed !== null && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'#f0fdf4', borderRadius:8, fontSize:13, color:'#16a34a', fontWeight:500 }}>
              ✅ Successfully indexed {indexed} contracts into the learning model!
            </div>
          )}
        </div>

        {/* Bulk upload */}
        <div style={{ background:'white', borderRadius:12, padding:24, border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize:15, fontWeight:600, color:'#0f172a', marginBottom:4 }}>Step 2 — Upload Training Contracts (JSON)</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Paste thousands of contracts as JSON to train the model. Format: array of objects with title and content fields.</p>
          <div style={{ background:'#f8fafc', borderRadius:8, padding:12, marginBottom:12, fontSize:12, color:'#64748b', fontFamily:'monospace' }}>
            {`[
  { "title": "Web Dev Contract", "content": "CONTRACT TEXT HERE..." },
  { "title": "Design Contract",  "content": "CONTRACT TEXT HERE..." }
]`}
          </div>
          <textarea value={contracts} onChange={e => setContracts(e.target.value)}
            rows={8} placeholder="Paste your JSON array of contracts here..."
            style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'monospace', resize:'vertical', marginBottom:12 }} />
          <button
            disabled={uploading || !contracts}
            onClick={async () => {
              setUploading(true);
              try {
                const parsed = JSON.parse(contracts);
                const { uploadContracts } = await import('../services/api');
                const res = await uploadContracts({ contracts: parsed });
                toast.success(`Uploaded ${res.data.count} contracts! 🧠`);
                setContracts('');
              } catch(e) {
                toast.error('Invalid JSON or upload failed');
              } finally { setUploading(false); }
            }}
            style={{ background:'#0f172a', color:'white', border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:600, cursor:'pointer', opacity: uploading || !contracts ? 0.5 : 1 }}>
            {uploading ? '⏳ Uploading...' : '📤 Upload & Train'}
          </button>
        </div>

      </main>
    </div>
  );
};

export default Training;
