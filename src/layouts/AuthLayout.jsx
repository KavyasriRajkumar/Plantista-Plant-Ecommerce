import { Link, Outlet } from 'react-router-dom';

const PHOTOS = ['money-plant-pothos', 'snake-plant', 'rose', 'tulsi-holy-basil', 'peace-lily', 'hibiscus'];
const POINTS = ['Plant Finder matches plants to your light, space and care style', '50 plants with honest care notes and warnings', 'Wishlist, cart and order tracking in one place'];

/**
 * AuthLayout — full-screen split page for Sign in / Create account, reached
 * from the navbar buttons or when checkout / account pages need a sign-in.
 */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1f4a2c] via-[#2f5a32] to-[#4c7a4f] p-12 text-cream lg:flex lg:flex-col lg:justify-between" aria-hidden="false">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-white/5" />
        <Link to="/login" className="relative inline-block self-start rounded-2xl bg-cream px-4 py-2" aria-label="Plantista">
          <img src="/logo.png" alt="Plantista" className="h-14 w-auto" />
        </Link>
        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-medium leading-tight">Find your green. Grow your world.</h2>
          <ul className="mt-6 max-w-md space-y-3 text-sm text-cream/85">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-cream/20 text-xs">✓</span>{p}</li>
            ))}
          </ul>
          <div className="mt-8 grid max-w-md grid-cols-6 gap-2">
            {PHOTOS.map((s) => (
              <img key={s} src={`/plants/${s}.jpg`} alt="" loading="lazy" className="aspect-square rounded-xl object-cover ring-2 ring-cream/30" />
            ))}
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-6 inline-block lg:hidden" aria-label="Plantista">
            <img src="/logo.png" alt="Plantista" className="h-16 w-auto" />
          </Link>
          <div className="rounded-3xl border border-ink/5 bg-paper p-7 shadow-card sm:p-9">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
