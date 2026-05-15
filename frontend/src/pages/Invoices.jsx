import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice, getClients } from '../services/api';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ clientId:'', dueDate:'', currency:'INR', notes:'', items:[{ description:'', quantity:1, rate:0 }] });

  const fetchAll = async () => {
    try {
      const [inv, cli] = await Promise.all([getInvoices(), getClients()]);
      setInvoices(inv.data); setClients(cli.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem    = () => setForm({...form, items:[...form.items, { description:'', quantity:1, rate:0 }]});
  const removeItem = (i) => setForm({...form, items: form.items.filter((_,idx) => idx !== i)});
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = {...items[i], [field]: field === 'description' ? val : Number(val)};
    setForm({...form, items});
  };

  const total = form.items.reduce((s, item) => s + (item.quantity * item.rate), 0);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createInvoice(form);
      toast.success('Invoice created!');
      setShowForm(false);
      setForm({ clientId:'', dueDate:'', currency:'INR', notes:'', items:[{ description:'', quantity:1, rate:0 }] });
      fetchAll();
    } catch { toast.error('Failed to create invoice'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateInvoiceStatus(id, status); toast.success('Status updated!'); fetchAll(); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete invoice?')) return;
    try { await deleteInvoice(id); toast.success('Deleted!'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const statusColor = { unpaid:'#f59e0b', paid:'#16a34a', overdue:'#dc2626' };
  const statusBg    = { unpaid:'#fffbeb', paid:'#f0fdf4',  overdue:'#fef2f2' };
  const inputStyle  = { border:'1px solid #e2e8f0', borderRadius:6, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box' };

  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>Invoices</h1>
            <p style={{ color:'#94a3b8', marginTop:4 }}>{invoices.length} total invoices</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            + Create Invoice
          </button>
        </div>

        {/* Create Invoice Form */}
        {showForm && (
          <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', marginBottom:24 }}>
            <h2 style={{ fontSize:16, fontWeight:600, marginBottom:20 }}>New Invoice</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#374151', marginBottom:4 }}>Client</label>
                  <select required value={form.clientId} onChange={e => setForm({...form, clientId:e.target.value})}
                    style={{ ...inputStyle, width:'100%', background:'white' }}>
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#374151', marginBottom:4 }}>Due Date</label>
                  <input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate:e.target.value})}
                    style={{ ...inputStyle, width:'100%' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#374151', marginBottom:4 }}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({...form, currency:e.target.value})}
                    style={{ ...inputStyle, width:'100%', background:'white' }}>
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:8 }}>Line Items</label>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr auto', gap:8, marginBottom:8, alignItems:'center' }}>
                    <input placeholder="Description" value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      style={{ ...inputStyle }} required />
                    <input type="number" placeholder="Qty" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                      style={{ ...inputStyle }} min={1} required />
                    <input type="number" placeholder="Rate" value={item.rate}
                      onChange={e => updateItem(i, 'rate', e.target.value)}
                      style={{ ...inputStyle }} min={0} required />
                    <button type="button" onClick={() => removeItem(i)}
                      style={{ background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:6, padding:'8px 10px', cursor:'pointer' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={addItem}
                  style={{ background:'#f8fafc', border:'1px dashed #e2e8f0', color:'#64748b', borderRadius:8, padding:'8px 16px', fontSize:13, cursor:'pointer', marginTop:4 }}>
                  + Add Item
                </button>
              </div>

              <div style={{ background:'#f8fafc', borderRadius:8, padding:16, marginBottom:16, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:600 }}>Total Amount</span>
                <span style={{ fontWeight:700, fontSize:18, color:'#4f46e5' }}>₹{total.toLocaleString()}</span>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" disabled={saving}
                  style={{ background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background:'white', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:8, padding:'10px 24px', fontSize:14, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoices List */}
        {loading ? <p style={{ color:'#94a3b8' }}>Loading...</p> : (
          <div style={{ display:'grid', gap:12 }}>
            {invoices.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🧾</div>
                <p>No invoices yet. Create your first invoice!</p>
              </div>
            ) : invoices.map(inv => (
              <div key={inv._id} style={{ background:'white', borderRadius:12, padding:20, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600, color:'#1e293b', marginBottom:4 }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize:13, color:'#94a3b8' }}>
                    {inv.clientId?.name} · Due {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#4f46e5', marginTop:4 }}>₹{inv.totalAmount?.toLocaleString()}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ background: statusBg[inv.status], color: statusColor[inv.status], fontSize:12, padding:'4px 10px', borderRadius:20, fontWeight:500, textTransform:'capitalize' }}>
                    {inv.status}
                  </span>
                  {inv.status !== 'paid' && (
                    <button onClick={() => handleStatus(inv._id, 'paid')}
                      style={{ background:'#f0fdf4', color:'#16a34a', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:500 }}>
                      ✓ Mark Paid
                    </button>
                  )}
                  <button onClick={() => handleDelete(inv._id)}
                    style={{ background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12 }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Invoices;