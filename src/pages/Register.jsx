import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordInput, { passwordStrength } from '../components/auth/PasswordInput';
import { useAuth } from '../context/AuthContext';

const LEVELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
const COLORS = ['bg-red-400', 'bg-red-400', 'bg-gold', 'bg-moss', 'bg-fern'];

/** Create account — same rules as the API (8+ chars with a letter and a number; 10-digit mobile). */
export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const strength = passwordStrength(form.password);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!/^\d{10}$/.test(form.phone)) next.phone = 'Enter a valid 10-digit mobile number';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Include at least one letter and one number';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    try {
      const user = await register({ name: form.name, email: form.email.trim(), phone: form.phone, password: form.password });
      toast.success(`Welcome to Plantista, ${user.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-display text-3xl font-medium">Create your account</h1>
      <p className="mt-2 text-sm text-ink/60">Join Plantista for personalised plant picks and faster checkout.</p>

      {formError && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
      )}

      <div className="mt-6 space-y-4">
        <Input id="name" label="Full name" autoComplete="name" placeholder="Ananya Rao" value={form.name} error={errors.name} onChange={set('name')} />
        <Input id="email" type="email" label="Email" autoComplete="email" placeholder="you@example.com" value={form.email} error={errors.email} onChange={set('email')} />
        <Input id="phone" type="tel" inputMode="numeric" label="Mobile number" autoComplete="tel-national" placeholder="9876543210" maxLength={10}
          value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} />
        <div>
          <PasswordInput id="password" label="Password" autoComplete="new-password" placeholder="8+ characters, letters and numbers"
            value={form.password} error={errors.password} onChange={set('password')} />
          {form.password && (
            <div className="mt-2" aria-live="polite">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? COLORS[strength] : 'bg-ink/10'}`} />)}
              </div>
              <p className="mt-1 text-xs text-ink/60">Strength: {LEVELS[strength]}</p>
            </div>
          )}
        </div>
        <PasswordInput id="confirmPassword" label="Confirm password" autoComplete="new-password" placeholder="Re-enter your password"
          value={form.confirmPassword} error={errors.confirmPassword} onChange={set('confirmPassword')} />

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </div>

      <p className="mt-7 text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-fern hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
