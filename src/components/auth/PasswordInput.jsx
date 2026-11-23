import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Password field with a show/hide toggle. Same look as the shared Input.
export default function PasswordInput({ label, id, error, autoComplete, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-paper px-4 py-3 pr-12 text-sm text-ink placeholder:text-ink/35 focus:outline-none ${error ? 'border-red-400 focus:border-red-500' : 'border-ink/15 focus:border-fern'}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/50 hover:text-ink"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// 0-4 score used by the sign-up strength meter.
export function passwordStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw))) s += 1;
  return s;
}
