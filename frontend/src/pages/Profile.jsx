import { useState } from 'react';
import Sidebar from '../components/Sidebar';
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

  const inputStyle = {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: 'white',
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 500,
    color: '#374151', marginBottom: 6,
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#f8fafc', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>⚙️ Profile Settings</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Manage your account and business information.</p>
        </div>

        {/* Profile Avatar */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{user?.name}</div>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>{user?.email}</div>
            {user?.businessName && <div style={{ fontSize: 13, color: '#4f46e5', marginTop: 2 }}>⚡ {user.businessName}</div>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', borderRadius: 10, padding: 4, width: 'fit-content', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          {['profile', 'password'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 24px', borderRadius: 8, border: 'none', fontSize: 14,
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === tab ? '#4f46e5' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
                textTransform: 'capitalize',
              }}>
              {tab === 'profile' ? '👤 Profile' : '🔐 Password'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', maxWidth: 700 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#1e293b' }}>Personal & Business Information</h2>
            <form onSubmit={handleProfileSave}>

              {/* Name + Business Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Shreyas Kale" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Business Name</label>
                  <input value={profileForm.businessName}
                    onChange={e => setProfileForm({ ...profileForm, businessName: e.target.value })}
                    placeholder="Shreyas Studio" style={inputStyle} />
                </div>
              </div>

              {/* Phone + Website */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input value={profileForm.website}
                    onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                    placeholder="https://yourwebsite.com" style={inputStyle} />
                </div>
              </div>

              {/* Address */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Address</label>
                <input value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Mumbai, Maharashtra, India" style={inputStyle} />
              </div>

              {/* Currency */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Default Currency</label>
                <select value={profileForm.currency}
                  onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })}
                  style={{ ...inputStyle }}>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>
              </div>

              {/* Bio */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Professional Bio</label>
                <textarea value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3} placeholder="Full-stack developer with 3+ years of experience in React and Node.js..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={savingProfile}
                style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: savingProfile ? 0.7 : 1 }}>
                {savingProfile ? 'Saving...' : '✅ Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', maxWidth: 500 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>Change Password</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Make sure your new password is at least 6 characters.</p>

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Current Password</label>
                <input type="password" required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>New Password</label>
                <input type="password" required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••" style={inputStyle} />
              </div>

              {/* Password strength indicator */}
              {passwordForm.newPassword && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Password strength</div>
                  <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4 }}>
                    <div style={{
                      height: 4, borderRadius: 4, transition: 'all 0.3s',
                      width: passwordForm.newPassword.length < 6 ? '33%' : passwordForm.newPassword.length < 10 ? '66%' : '100%',
                      background: passwordForm.newPassword.length < 6 ? '#ef4444' : passwordForm.newPassword.length < 10 ? '#f59e0b' : '#22c55e',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: passwordForm.newPassword.length < 6 ? '#ef4444' : passwordForm.newPassword.length < 10 ? '#f59e0b' : '#22c55e', marginTop: 4 }}>
                    {passwordForm.newPassword.length < 6 ? 'Weak' : passwordForm.newPassword.length < 10 ? 'Medium' : 'Strong'}
                  </div>
                </div>
              )}

              <button type="submit" disabled={savingPassword}
                style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: savingPassword ? 0.7 : 1 }}>
                {savingPassword ? 'Changing...' : '🔐 Change Password'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};

export default Profile;