import { Link } from 'react-router-dom';
import { getButtonClasses } from '../components/common/Button';

/**
 * NotFound — custom 404 with a small hand-drawn potted-plant SVG
 * instead of a stock illustration, keeping it consistent with the
 * botanical line motif used across the rest of the site.
 */
export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M55 140h50l-6-45H61l-6 45Z" fill="#E3EBDE" stroke="#16311F" strokeWidth="2" />
        <path d="M80 95C80 95 55 85 55 55C55 35 70 25 80 35C90 25 105 35 105 55C105 85 80 95 80 95Z" fill="#9AB498" stroke="#16311F" strokeWidth="2" />
        <path d="M80 95V45" stroke="#16311F" strokeWidth="2" strokeLinecap="round" />
        <circle cx="80" cy="30" r="4" fill="#B8924A" />
      </svg>
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-ink sm:text-5xl">This one wasn't potted.</h1>
      <p className="mt-4 max-w-sm text-ink/60">
        The page you're looking for doesn't exist, or it's been moved. Let's get you back to solid ground.
      </p>
      <Link to="/" className={getButtonClasses('primary', 'lg', 'mt-8')}>
        Back to home
      </Link>
    </div>
  );
}
