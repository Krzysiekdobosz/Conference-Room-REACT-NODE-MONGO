import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { isDemo } from '../api';
import { DEMO_ACCOUNTS } from '../api/mock';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (email, password) => {
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/rooms', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(form.email, form.password);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section className="auth-card card">
      <h1>Welcome back</h1>
      <p className="muted">Log in to book rooms and manage your reservations.</p>

      {isDemo && (
        <div className="demo-accounts">
          <p>Try a test account:</p>
          <div className="demo-accounts__buttons">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={submitting}
                onClick={() => signIn(account.email, account.password)}
              >
                Log in as {account.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="current-password" required />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="auth-card__footer">
        Don&apos;t have an account? <Link to="/register">Sign up</Link>
      </p>
    </section>
  );
};
