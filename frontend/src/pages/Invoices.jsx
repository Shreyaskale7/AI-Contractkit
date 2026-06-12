import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice, getClients } from '../services/api';
import toast from 'react-hot-toast';

const statusClass = { unpaid: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue' };
const statusLabel = { unpaid: 'Unpaid', paid: 'Paid', overdue: 'Overdue' };

const currencySymbols = { INR: '₹', USD: '$', EUR: '€' };
const symbolFor = (currency) => currencySymbols[currency] || `${currency} `;

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState({ clientId: '', dueDate: '', currency: 'INR', notes: '', items: [{ description: '', quantity: 1, rate: 0 }] });

  const fetchAll = async () => {
    try {
      const [inv, cli] = await Promise.all([getInvoices(), getClients()]);
      setInvoices(inv.data);
      setClients(cli.data);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, rate: 0 }] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: field === 'description' ? value : Number(value) };
    setForm({ ...form, items });
  };

  const total = form.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const handleCreate = async (e) => {
    e?.preventDefault();
    if (saving) return; // guard against double submission
    if (!form.clientId) return toast.error('Please select a client');
    if (!form.dueDate) return toast.error('Please set a due date');
    if (form.items.length === 0 || form.items.some((i) => !i.description.trim())) {
      return toast.error('Every line item needs a description');
    }
    setSaving(true);
    try {
      await createInvoice(form);
      toast.success('Invoice created!');
      setShowForm(false);
      setForm({ clientId: '', dueDate: '', currency: 'INR', notes: '', items: [{ description: '', quantity: 1, rate: 0 }] });
      fetchAll();
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateInvoiceStatus(id, status);
      toast.success('Updated!');
      fetchAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteInvoice(id);
      toast.success('Deleted!');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = filter === 'All' ? invoices : invoices.filter((invoice) => invoice.status === filter.toLowerCase());

  return (
    <PageShell
      title="Invoices"
      subtitle="Track payment status, send links, and handle paid invoices quickly."
      actions={
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + Create invoice
        </button>
      }
    >
      {showForm && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <div className="page-header" style={{ marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>New invoice</h2>
              <p className="text-secondary" style={{ fontSize: 13 }}>Create a new invoice and send it to your client in one click.</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="input-label" htmlFor="inv-client">Client *</label>
              <select id="inv-client" className="input-field" required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Select client…</option>
                {clients.map((client) => <option key={client._id} value={client._id}>{client.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="inv-due">Due date *</label>
              <input id="inv-due" className="input-field" required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="input-label" htmlFor="inv-currency">Currency</label>
              <select id="inv-currency" className="input-field" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
              </select>
            </div>
          </form>
          <div className="card card-body" style={{ background: 'var(--color-surface-muted)', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 12, padding: '12px 0', fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <div>Description</div><div>Qty</div><div>Rate</div><div>Total</div><div />
            </div>
            {form.items.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border-subtle)' }}>
                <input className="input-field" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Description" />
                <input className="input-field" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                <input className="input-field" type="number" min={0} value={item.rate} onChange={(e) => updateItem(index, 'rate', e.target.value)} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-surface-strong)' }}>{symbolFor(form.currency)}{(item.quantity * item.rate).toLocaleString()}</div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)} aria-label="Remove item">✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 16, border: '1px dashed var(--color-border-default)', width: '100%' }} onClick={addItem}>+ Add item</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-default)', marginBottom: 20 }}>
            <div className="text-secondary" style={{ fontWeight: 500 }}>Total amount</div>
            <div style={{ color: 'var(--color-surface-strong)', fontSize: 24, fontWeight: 600 }}>{symbolFor(form.currency)}{total.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="button" className={`btn btn-primary${saving ? ' loading' : ''}`} disabled={saving} onClick={handleCreate}>{saving ? 'Creating…' : 'Create invoice'}</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {['All', 'Unpaid', 'Paid', 'Overdue'].map((tab) => (
          <button key={tab} type="button" className={`filter-pill${filter === tab ? ' active' : ''}`} onClick={() => setFilter(tab)}>{tab}</button>
        ))}
      </div>

      <div className="table-shell">
        <div className="table-head table-cols-invoices">
          {['Invoice #', 'Client', 'Amount', 'Due date', 'Status', 'Actions'].map((h) => <div key={h}>{h}</div>)}
        </div>
        {loading ? (
          <div className="table-empty">Loading invoices…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="▦"
            title="No invoices found"
            description={filter === 'All' ? 'Create your first invoice with the button above.' : `No ${filter.toLowerCase()} invoices right now.`}
          />
        ) : (
          filtered.map((invoice) => (
            <div key={invoice._id} className="table-row table-cols-invoices">
              <div className="table-primary-text text-primary-accent">{invoice.invoiceNumber}</div>
              <div className="table-primary-text">{invoice.clientId?.name || '—'}</div>
              <div className="table-primary-text">{symbolFor(invoice.currency)}{invoice.totalAmount?.toLocaleString()}</div>
              <div className="table-secondary-text">
                {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </div>
              <div>
                <span className={`status-badge ${statusClass[invoice.status] || 'badge-sent'}`}>
                  {statusLabel[invoice.status] || invoice.status}
                </span>
              </div>
              <div className="table-actions">
                {invoice.status !== 'paid' && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleStatus(invoice._id, 'paid')}>Mark paid</button>
                )}
                {invoice.status === 'unpaid' && new Date(invoice.dueDate) < new Date() && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleStatus(invoice._id, 'overdue')}>Mark overdue</button>
                )}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setPendingDelete(invoice._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete invoice?"
        message="This permanently removes the invoice. This cannot be undone."
        confirmLabel="Delete invoice"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </PageShell>
  );
};

export default Invoices;
