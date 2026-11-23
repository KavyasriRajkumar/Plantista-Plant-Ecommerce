import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PasswordInput from '../../components/auth/PasswordInput';
import { useAuth } from '../../context/AuthContext';

const EMAIL = /^\S+@\S+\.\S+$/;

/**
 * Admin sign-in: its own page at /admin/login, separate from the customer
 * Login. It calls POST /api/auth/admin/login, which only accepts admin
 * accounts, and nothing in the storefront links here.
 */
export default function AdminLogin() {
  const { adminLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const next = {};
    if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await adminLogin({ ...form, email: form.email.trim() });
      navigate('/admin', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.status === 400 ? err.errors : {});
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3 text-cream">
          <span className="rounded-xl bg-cream px-3 py-1.5"><img src="/logo.png" alt="Plantista" className="h-10 w-auto" /></span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage">Admin</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-3xl bg-paper p-7 shadow-card sm:p-9">
          <h1 className="font-display text-3xl font-medium">Admin sign in</h1>
          <p className="mt-2 text-sm text-ink/60">For Plantista staff only. Manage products, orders and customers.</p>

          {formError && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
          )}

          <div className="mt-6 space-y-5">
            <Input id="admin-email" type="email" label="Admin email" autoComplete="username" placeholder="admin@plantista.com"
              value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <PasswordInput id="admin-password" label="Password" autoComplete="current-password" placeholder="Your password"
              value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="accent-fern" />
              Keep me signed in on this device
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to admin'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-cream/60">
          <Link to="/" className="hover:text-cream hover:underline">← Back to the store</Link>
        </p>
      </div>
    </div>
  );
}
