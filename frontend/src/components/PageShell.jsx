import Sidebar from './Sidebar';

const PageShell = ({ title, subtitle, actions, children, className = '' }) => (
  <div className="app-shell">
    <Sidebar />
    <main className={`page-main dash-main ${className}`.trim()}>
      {(title || actions) && (
        <header className="page-header page-enter">
          <div>
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="page-header-actions">{actions}</div>}
        </header>
      )}
      {children}
    </main>
  </div>
);

export default PageShell;
