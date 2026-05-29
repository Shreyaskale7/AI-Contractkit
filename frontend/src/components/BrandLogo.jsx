import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const BrandLogo = ({ variant = 'dark', size = 'md', linkToHome = false, layout = 'inline' }) => {
  const iconSize = size === 'lg' ? 'brand-icon-box--lg' : 'brand-icon-box--sm';
  const textSize = size === 'lg' ? 'text-xl' : 'text-base';

  const inner = (
    <>
      <div className={`brand-icon-box ${iconSize}`} aria-hidden="true">
        <Zap className={`${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} fill-[var(--saas-accent)] text-[var(--saas-accent)]`} />
      </div>
      {layout === 'stack' ? (
        <div className={`brand-logo-text ${textSize}`}>AI ContractKit</div>
      ) : (
        <span className={`brand-logo-text ${textSize}`}>AI ContractKit</span>
      )}
    </>
  );

  const className = 'flex items-center gap-3';

  if (linkToHome) {
    return (
      <Link to="/" className={`${className} transition-opacity duration-150 hover:opacity-85`}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
};

export default BrandLogo;
