import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
] as const;

const ContractKitNav = () => (
  <header className="landing-nav">
    <div className="landing-container landing-nav-inner">
      <Link to="/" className="landing-nav-logo">
        AI ContractKit
      </Link>

      <nav className="landing-nav-links" aria-label="Main navigation">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} className="landing-nav-link">
            {label}
          </a>
        ))}
        <Link to="/login" className="landing-nav-link inline-flex items-center gap-1.5">
          Sign in
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  </header>
);

export default ContractKitNav;
