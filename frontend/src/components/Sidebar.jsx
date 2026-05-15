import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',          emoji: '🏠', label: 'Dashboard' },
  { path: '/clients',            emoji: '👥', label: 'Clients' },
  { path: '/contracts',          emoji: '📄', label: 'Contracts' },
  { path: '/contracts/generate', emoji: '✨', label: 'Generate Contract' },
  { path: '/invoices',           emoji: '🧾', label: 'Invoices' },
];

const Sidebar = () => {
  const { pathname }           = useLocation();
  const { user, logoutUser }   = useAuth();
  const navigate               = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{
      width: 240, background: 'white', height: '100vh',
      boxShadow: '1px 0 8px rgba(0,0,0,0.06)', display: 'flex',
      flexDirection: 'column', position: 'fixed', left: 0, top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>⚡ AI ContractKit</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{user?.businessName || user?.name}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ path, emoji, label }) => (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              background: pathname === path ? '#eef2ff' : 'transparent',
              color: pathname === path ? '#4f46e5' : '#64748b',
            }}>
              <span>{emoji}</span>{label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 8, width: '100%',
          fontSize: 14, fontWeight: 500, color: '#ef4444',
          background: 'none', border: 'none', cursor: 'pointer'
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;