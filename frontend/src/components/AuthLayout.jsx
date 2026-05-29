import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const AuthLayout = ({ title, subtitle, children, perks }) => (
  <div className="auth-shell">
    <aside className="auth-panel-left">
      <div className="auth-panel-inner">
        <BrandLogo variant="saas" size="lg" linkToHome layout="inline" />

        <div className="auth-panel-copy">
          <h2 className="auth-panel-title">{title}</h2>
          <p className="auth-panel-subtitle">{subtitle}</p>
        </div>

        <ul className="auth-perk-list">
          {perks.map(({ title: perkTitle, desc }) => (
            <li key={perkTitle} className="auth-perk-item">
              <span className="auth-perk-dot" aria-hidden="true" />
              <div>
                <p className="auth-perk-title">{perkTitle}</p>
                {desc && <p className="auth-perk-desc">{desc}</p>}
              </div>
            </li>
          ))}
        </ul>

        <p className="auth-panel-footnote">
          <Link to="/" className="auth-link-muted">← Back to home</Link>
        </p>
      </div>
    </aside>

    <main className="auth-panel-right">
      <div className="auth-form-wrap">{children}</div>
    </main>
  </div>
);

export default AuthLayout;
