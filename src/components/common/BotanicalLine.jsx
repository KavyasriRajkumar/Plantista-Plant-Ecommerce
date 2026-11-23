/**
 * BotanicalLine — Plantista's signature element: a single continuous,
 * hand-drawn-style vine that threads through section dividers and the
 * hero. Reused (never duplicated ad hoc) so the motif stays consistent.
 * `flip` mirrors it horizontally for variation without a second asset.
 */
export default function BotanicalLine({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 600 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${flip ? 'scale-x-[-1]' : ''} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M2 30C60 5 100 55 160 30C220 5 260 55 320 30C380 5 420 55 480 30C520 15 560 40 598 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="160" cy="30" r="4" fill="currentColor" />
      <circle cx="320" cy="30" r="4" fill="currentColor" />
      <circle cx="480" cy="30" r="4" fill="currentColor" />
      <path d="M160 30C150 18 138 16 128 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M320 30C330 42 342 44 352 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M480 30C470 18 458 16 448 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
