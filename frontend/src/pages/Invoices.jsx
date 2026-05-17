import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice, getClients } from '../services/api';
import toast from 'react-hot-toast';

const statusMap = {
  unpaid:  { bg: '#fffbeb', color: '#d97706', label: 'Unpaid'  },
  paid:    { bg: '#f0fdf4', color: '#16a34a', label: 'Paid'    },
  overdue: { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [filter, setFilter]     = useState('All');
  const [form, setForm]         = useState({ clientId: '', dueDate: '', currency: 'INR', notes: '', items: [{ description: '', quantity: 1, rate: 0 }] });

  const fetchAll = async () => {
    try {
      const [inv, cli] = await Promise.all([getInvoices(), getClients()]);
      setInvoices(inv.data); setClients(cli.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem    = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, rate: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: field === 'description' ? val : Number(val) };
    setForm({ ...form, items });
  };

  const total = form.items.reduce((s, item) => s + (item.quantity * item.rate), 0);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createInvoice(form);
      toast.success('Invoice created!');
      setShowForm(false);
      setForm({ clientId: '', dueDate: '', currency: 'INR', notes: '', items: [{ description: '', quantity: 1, rate: 0 }] });
      fetchAll();
    } catch { toast.error('Failed to create invoice'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateInvoiceStatus(id, status); toast.success('Updated!'); fetchAll(); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete invoice?')) return;
    try { await deleteInvoice(id); toast.success('Deleted!'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = filter === 'All' ? invoices : invoices.filter(i => i.status === filter.toLowerCase());
  const inputStyle = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Invoices</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>{invoices.length} total invoices</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            + Create New Invoice
          </button>
        </div>

        {/* Create Invoice Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#0f172a' }}>New Invoice</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Client *</label>
                  <select required value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Due Date *</label>
                  <input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Line Items</label>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', padding: '8px 12px', background: '#f1f5f9' }}>
                    {['Description', 'Qty', 'Rate', 'Total', ''].map(h => (
                      <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>
                    ))}
                  </div>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', padding: '8px 12px', gap: 8, borderTop: i > 0 ? '1px solid #e2e8f0' : 'none', alignItems: 'center' }}>
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} required style={{ ...inputStyle }} />
                      <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{ ...inputStyle }} />
                      <input type="number" min={0} value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} style={{ ...inputStyle }} />
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>₹{(item.quantity * item.rate).toLocaleString()}</div>
                      <button type="button" onClick={() => removeItem(i)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} style={{ marginTop: 8, background: 'none', border: '1px dashed #e2e8f0', color: '#6366f1', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>+ Add Line Item</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Total Amount</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>₹{total.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Creating...' : 'Create Invoice'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['All', 'Unpaid', 'Paid', 'Overdue'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: filter === f ? '#6366f1' : 'white', color: filter === f ? 'white' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {f} {f !== 'All' && `(${invoices.filter(i => i.status === f.toLowerCase()).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1.5fr 1.5fr 1.5fr', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            {['Invoice #', 'Client', 'Total Amount', 'Due Date', 'Payment Status', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading invoices...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
              <p style={{ fontWeight: 500 }}>No invoices found</p>
            </div>
          ) : filtered.map((inv, i) => {
            const s = statusMap[inv.status] || statusMap.unpaid;
            return (
              <div key={inv._id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1.5fr 1.5fr 1.5fr', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>{inv.invoiceNumber}</div>
                <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{inv.clientId?.name || '—'}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>₹{inv.totalAmount?.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                <div><span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{s.label}</span></div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {inv.status !== 'paid' && (
                    <button onClick={() => handleStatus(inv._id, 'paid')}
                      style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Mark as Paid</button>
                  )}
                  <button onClick={() => handleDelete(inv._id)}
                    style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Invoices;