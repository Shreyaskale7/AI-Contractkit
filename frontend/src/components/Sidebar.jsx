import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Copy,
  FileText,
  LayoutGrid,
  Layers,
  Moon,
  Receipt,
  Sparkles,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';

const navItems = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/contracts', icon: FileText, label: 'Contracts' },
  { path: '/contracts/generate', icon: Sparkles, label: 'AI Contract' },
  { path: '/invoices', icon: Receipt, label: 'Invoices' },
  { path: '/proposals', icon: Layers, label: 'Proposals' },
  { path: '/proposals/generate', icon: Zap, label: 'AI Proposal' },
  { path: '/training', icon: Brain, label: 'AI Training' },
  { path: '/templates', icon: Copy, label: 'Templates' },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logoutUser } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();

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
    <aside className="sidebar" aria-label="Main navigation">
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
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="nav-item-icon" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
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
  );
};

export default Sidebar;
