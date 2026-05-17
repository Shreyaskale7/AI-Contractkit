import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',          icon: '⊞', label: 'Dashboard' },
  { path: '/clients',            icon: '👥', label: 'Clients' },
  { path: '/contracts',          icon: '📄', label: 'Contracts' },
  { path: '/contracts/generate', icon: '✨', label: 'AI Contract' },
  { path: '/invoices',           icon: '🧾', label: 'Invoices' },
  { path: '/proposals',          icon: '📋', label: 'Proposals' },
  { path: '/proposals/generate', icon: '🤖', label: 'AI Proposal' },
  { path: '/training',           icon: '🧠', label: 'AI Training' },
  { path: '/templates',          icon: '🗂️', label: 'Templates' },
  { path: '/analytics',          icon: '📊', label: 'Analytics' },
  { path: '/profile',            icon: '⚙️', label: 'Settings' },
];

const Sidebar = () => {
  const { pathname }         = useLocation();
  const { user, logoutUser } = useAuth();
  const navigate             = useNavigate();

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <div style={{
      width: 220, background: '#0f172a', height: '100vh',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>AI ContractKit</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Business OS</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.businessName || 'Freelancer'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(({ path, icon, label }) => {
          const isActive = pathname === path;
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#a5b4fc' : '#94a3b8',
                borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1e293b' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, width: '100%',
          fontSize: 13, color: '#ef4444',
          background: 'none', border: 'none', cursor: 'pointer',
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;