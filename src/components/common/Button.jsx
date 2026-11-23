import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-fern text-paper hover:bg-moss',
  secondary: 'bg-transparent border border-ink/20 text-ink hover:border-ink',
  gold: 'bg-gold text-paper hover:bg-clay',
  ghost: 'bg-transparent text-ink hover:bg-mist',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

/**
 * Button — the single source of button styling for the whole app.
 * `as="link"` isn't handled here; wrap Button's className logic via
 * `getButtonClasses` if a Link needs identical styling (see Navbar CTA).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...rest
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

// Shared class builder so non-<button> elements (e.g. <Link>) can look
// identical to Button without duplicating the variant/size maps.
export function getButtonClasses(variant = 'primary', size = 'md', className = '') {
  return `inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}
