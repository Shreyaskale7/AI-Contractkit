import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getTemplates, deleteTemplate } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Web Development', 'Mobile Development', 'Design', 'Content Writing', 'Consulting', 'Other'];

const categoryColors = {
  'Web Development':    { bg: '#eef2ff', color: '#4f46e5' },
  'Mobile Development': { bg: '#fdf4ff', color: '#9333ea' },
  'Design':             { bg: '#fff7ed', color: '#ea580c' },
  'Content Writing':    { bg: '#f0fdf4', color: '#16a34a' },
  'Consulting':         { bg: '#fffbeb', color: '#f59e0b' },
  'Other':              { bg: '#f8fafc', color: '#64748b' },
};

const Templates = () => {
  const [templates, setTemplates]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [preview, setPreview]           = useState(null);
  const navigate                        = useNavigate();

  const fetchTemplates = async (category) => {
    try {
      const res = await getTemplates(category === 'All' ? '' : category);
      setTemplates(res.data);
    } catch { toast.error('Failed to load templates'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(activeCategory); }, [activeCategory]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteTemplate(id);
      toast.success('Template deleted!');
      fetchTemplates(activeCategory);
    } catch { toast.error('Failed to delete'); }
  };

  const handleUseTemplate = (template) => {
    // Navigate to generate contract with pre-filled prompt
    navigate('/contracts/generate', {
      state: {
        prefillPrompt: template.prompt || template.title,
        prefillTitle:  `${template.title} — Copy`,
        templateContent: template.content,
      }
    });
    toast.success('Template loaded! ✨');
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#f8fafc', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>📋 Contract Templates</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>{templates.length} templates saved</p>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                background: activeCategory === cat ? '#4f46e5' : 'white',
                color: activeCategory === cat ? 'white' : '#64748b',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
          <>
            {templates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: 'white', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p style={{ marginBottom: 8, fontWeight: 500 }}>No templates yet</p>
                <p style={{ fontSize: 13 }}>Go to Contracts → click "Save as Template" on any contract</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {templates.map(template => (
                  <div key={template._id}
                    style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Category Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
                        background: categoryColors[template.category]?.bg,
                        color: categoryColors[template.category]?.color
                      }}>
                        {template.category}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        Used {template.usageCount} times
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{template.title}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {new Date(template.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    {/* Prompt Preview */}
                    {template.prompt && (
                      <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', borderRadius: 6, padding: '8px 10px', lineHeight: 1.5 }}>
                        "{template.prompt.substring(0, 100)}{template.prompt.length > 100 ? '...' : ''}"
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => handleUseTemplate(template)}
                        style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        ✨ Use Template
                      </button>
                      <button onClick={() => setPreview(template)}
                        style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
                        👁 Preview
                      </button>
                      <button onClick={() => handleDelete(template._id)}
                        style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Preview Modal */}
        {preview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>{preview.title}</h2>
                <button onClick={() => setPreview(null)}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              </div>
              <div style={{ padding: 24, overflowY: 'auto', flex: 1, fontSize: 14, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: preview.content }} />
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
                <button onClick={() => { handleUseTemplate(preview); setPreview(null); }}
                  style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  ✨ Use This Template
                </button>
                <button onClick={() => setPreview(null)}
                  style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Templates;