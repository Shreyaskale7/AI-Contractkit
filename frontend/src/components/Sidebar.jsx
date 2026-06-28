import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Copy,
  FileText,
  LayoutGrid,
  Layers,
  Menu,
  Moon,
  Receipt,
  Sparkles,
  Sun,
  Users,
  X,
  Zap,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';

const navSections = [
  {
    title: 'Workspace',
    items: [
      { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
      { path: '/clients', icon: Users, label: 'Clients' },
      { path: '/contracts', icon: FileText, label: 'Contracts' },
      { path: '/proposals', icon: Layers, label: 'Proposals' },
      { path: '/invoices', icon: Receipt, label: 'Invoices' },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { path: '/contracts/generate', icon: Sparkles, label: 'AI Contract' },
      { path: '/proposals/generate', icon: Zap, label: 'AI Proposal' },
      { path: '/defender', icon: Shield, label: 'Scope Defender' },
      { path: '/training', icon: Brain, label: 'AI Training' },
      { path: '/templates', icon: Copy, label: 'Templates' },
    ],
  },
];

const allNavPaths = navSections.flatMap((s) => s.items.map((i) => i.path));

// Highlight the LONGEST nav path that matches the current URL, so
// /contracts/123 highlights "Contracts" and /contracts/generate
// highlights "AI Contract" (not both).
const findActivePath = (pathname) =>
  allNavPaths
    .filter((p) => pathname === p || pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logoutUser } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <>
      {/* Mobile-only hamburger to open the nav drawer */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

    <aside className={`sidebar${mobileOpen ? ' open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-logo">
        <BrandLogo variant="saas" layout="stack" />
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-inner">
          <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name">{user?.name || initials}</div>
            <div className="sidebar-user-role">{user?.businessName || 'Operator'}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard">
        {navSections.map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.55, padding: '8px 12px 4px', fontWeight: 600 }}>
              {title}
            </div>
            {items.map(({ path, icon: Icon, label }) => {
              const isActive = findActivePath(pathname) === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="nav-item-icon" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-action"
          onClick={toggleDark}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <button type="button" className="sidebar-action danger" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
