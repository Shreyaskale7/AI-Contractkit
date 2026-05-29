import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getTemplates, deleteTemplate } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Web Development', 'Mobile Development', 'Design', 'Content Writing', 'Consulting', 'Other'];

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const fetchTemplates = async (category) => {
    try {
      const res = await getTemplates(category === 'All' ? '' : category);
      setTemplates(res.data);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(activeCategory);
  }, [activeCategory]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteTemplate(id);
      toast.success('Template deleted!');
      fetchTemplates(activeCategory);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUseTemplate = (template) => {
    navigate('/contracts/generate', {
      state: {
        prefillPrompt: template.prompt || template.title,
        prefillTitle: `${template.title} — Copy`,
        templateContent: template.content,
      },
    });
    toast.success('Template loaded!');
  };

  return (
    <PageShell title="Contract templates" subtitle={`${templates.length} templates saved`}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`filter-pill${activeCategory === cat ? ' active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-secondary">Loading…</p>
      ) : templates.length === 0 ? (
        <div className="card card-body empty-state">
          <div className="empty-state-icon" aria-hidden="true">📋</div>
          <div className="empty-state-title">No templates yet</div>
          <div className="empty-state-desc">Go to Contracts → click &quot;Save as Template&quot; on any contract</div>
        </div>
      ) : (
        <div className="template-grid">
          {templates.map((template) => (
            <div key={template._id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="category-tag">{template.category}</span>
                <span className="text-secondary" style={{ fontSize: 11 }}>
                  Used {template.usageCount} times
                </span>
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{template.title}</div>
                <div className="text-secondary" style={{ fontSize: 12 }}>
                  {new Date(template.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

              {template.prompt && (
                <div className="code-block" style={{ marginBottom: 0, fontFamily: 'inherit', fontSize: 12 }}>
                  &quot;{template.prompt.substring(0, 100)}{template.prompt.length > 100 ? '…' : ''}&quot;
                </div>
              )}

              <div className="table-actions" style={{ marginTop: 4 }}>
                <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleUseTemplate(template)}>
                  Use template
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreview(template)}>
                  Preview
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(template._id)} aria-label="Delete template">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="template-preview-title">
          <div className="modal-panel">
            <div className="modal-header">
              <h2 id="template-preview-title" style={{ fontSize: 16, fontWeight: 600 }}>{preview.title}</h2>
              <button type="button" className="modal-close" onClick={() => setPreview(null)} aria-label="Close preview">
                ✕
              </button>
            </div>
            <div className="modal-body" dangerouslySetInnerHTML={{ __html: preview.content }} />
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => { handleUseTemplate(preview); setPreview(null); }}>
                Use this template
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Templates;
