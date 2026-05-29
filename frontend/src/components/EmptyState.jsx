import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, description, actionLabel, actionTo }) => (
  <div className="empty-state">
    <div className="empty-state-icon" aria-hidden="true">{icon}</div>
    <div className="empty-state-title">{title}</div>
    <div className="empty-state-desc">{description}</div>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn btn-primary empty-state-action">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
