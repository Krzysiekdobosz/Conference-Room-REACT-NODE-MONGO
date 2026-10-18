import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="card not-found">
    <h1>Page not found</h1>
    <p className="muted">The page you are looking for does not exist.</p>
    <Link to="/rooms" className="btn btn--primary">Go to rooms</Link>
  </section>
);
