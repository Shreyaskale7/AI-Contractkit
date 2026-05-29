import { useState } from 'react';
import PageShell from '../components/PageShell';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, loginUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name:         user?.name         || '',
    businessName: user?.businessName || '',
    phone:        user?.phone        || '',
    address:      user?.address      || '',
    website:      user?.website      || '',
    bio:          user?.bio          || '',
    currency:     user?.currency     || 'INR',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [savingProfile,   setSavingProfile]   = useState(false);
  const [savingPassword,  setSavingPassword]  = useState(false);
  const [activeTab,       setActiveTab]       = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      // Update auth context with new user data
      loginUser(res.data, localStorage.getItem('token'));
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match!');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      toast.success('Password changed! ✅');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  return (
    <PageShell title="Profile settings" subtitle="Manage your account and business information.">
        <div className="card card-body" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="sidebar-avatar" style={{ width: 72, height: 72, fontSize: 28 }} aria-hidden="true">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user?.name}</div>
            <div className="text-secondary" style={{ fontSize: 14 }}>{user?.email}</div>
            {user?.businessName && <div className="text-primary-accent" style={{ fontSize: 13, marginTop: 2 }}>{user.businessName}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', padding: 4, width: 'fit-content', border: '1px solid var(--color-border-default)' }}>
          {['profile', 'password'].map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`filter-pill${activeTab === tab ? ' active' : ''}`}
              style={{ minHeight: 36, padding: '8px 24px' }}>
              {tab === 'profile' ? 'Profile' : 'Password'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="card card-body" style={{ maxWidth: 700 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Personal & business information</h2>
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="input-label">Full name *</label>
                  <input required className="input-field" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="input-label">Business name</label>
                  <input className="input-field" value={profileForm.businessName} onChange={e => setProfileForm({ ...profileForm, businessName: e.target.value })} placeholder="Your studio" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="input-label">Phone</label>
                  <input className="input-field" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="input-label">Website</label>
                  <input className="input-field" value={profileForm.website} onChange={e => setProfileForm({ ...profileForm, website: e.target.value })} placeholder="https://yourwebsite.com" />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Address</label>
                <input className="input-field" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="City, State, Country" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Default currency</label>
                <select className="input-field" value={profileForm.currency} onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })}>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Professional bio</label>
                <textarea className="input-field" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} placeholder="Brief professional summary…" style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className={`btn btn-primary${savingProfile ? ' loading' : ''}`} disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="card card-body" style={{ maxWidth: 500 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Change password</h2>
            <p className="text-secondary" style={{ fontSize: 13, marginBottom: 24 }}>Make sure your new password is at least 6 characters.</p>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Current password</label>
                <input type="password" required className="input-field" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="••••••••" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">New password</label>
                <input type="password" required className="input-field" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="••••••••" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Confirm new password</label>
                <input type="password" required className="input-field" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="••••••••" />
              </div>
              {passwordForm.newPassword && (
                <div style={{ marginBottom: 20 }}>
                  <div className="text-secondary" style={{ fontSize: 12, marginBottom: 6 }}>Password strength</div>
                  <div style={{ height: 4, background: 'var(--color-border-subtle)', borderRadius: 4 }}>
                    <div style={{
                      height: 4, borderRadius: 4, transition: 'all 0.3s',
                      width: passwordForm.newPassword.length < 6 ? '33%' : passwordForm.newPassword.length < 10 ? '66%' : '100%',
                      background: passwordForm.newPassword.length < 6 ? 'var(--color-status-danger)' : passwordForm.newPassword.length < 10 ? 'var(--color-status-warning)' : 'var(--color-status-success)',
                    }} />
                  </div>
                </div>
              )}
              <button type="submit" className={`btn btn-primary${savingPassword ? ' loading' : ''}`} disabled={savingPassword}>
                {savingPassword ? 'Changing…' : 'Change password'}
              </button>
            </form>
          </div>
        )}

    </PageShell>
  );
};

export default Profile;