import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordInput from '../components/auth/PasswordInput';
import { useAuth } from '../context/AuthContext';

const EMAIL = /^\S+@\S+\.\S+$/;

/** Sign in — validates, calls the API via AuthContext, then returns the user to where they were headed. */
export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const validate = () => {
    const next = {};
    if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    try {
      const user = await login({ ...form, email: form.email.trim() });
      navigate(user.role === 'admin' && !location.state?.from ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.status === 400 ? err.errors : {});
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-display text-3xl font-medium">Welcome back</h1>
      <p className="mt-2 text-sm text-ink/60">Sign in to find plants that fit your space.</p>

      {formError && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
      )}

      <div className="mt-6 space-y-5">
        <Input id="email" type="email" label="Email" autoComplete="email" placeholder="you@example.com"
          value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <PasswordInput id="password" label="Password" autoComplete="current-password" placeholder="Your password"
          value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="accent-fern" />
          Keep me signed in on this device
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>

      <p className="mt-7 text-center text-sm text-ink/60">
        New to Plantista?{' '}
        <Link to="/register" className="font-semibold text-fern hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
