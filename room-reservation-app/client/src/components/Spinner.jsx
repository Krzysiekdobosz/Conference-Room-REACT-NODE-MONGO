export const Spinner = ({ label = 'Loading…' }) => (
  <div className="spinner" role="status">
    <span className="spinner__circle" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </div>
);
