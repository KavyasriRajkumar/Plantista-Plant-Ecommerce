/**
 * Input — shared text input for every form in the app (Login, Register,
 * Contact, Profile edit, Admin forms). Renders a label, optional error
 * message, and forwards any other prop (type, value, onChange…) to the
 * underlying <input>, so it behaves like a native input everywhere.
 */
export default function Input({ label, id, error, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none ${
          error ? 'border-red-400 focus:border-red-500' : 'border-ink/15 focus:border-fern'
        }`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
