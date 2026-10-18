import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/rooms', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card card">
      <h1>Create an account</h1>
      <p className="muted">It takes less than a minute.</p>
      <form className="form" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <label className="field">
          <span>Full name</span>
          <input name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" minLength={6} required />
        </label>
        <label className="field">
          <span>Repeat password</span>
          <input type="password" name="confirm" value={form.confirm} onChange={handleChange} autoComplete="new-password" minLength={6} required />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="auth-card__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
};
