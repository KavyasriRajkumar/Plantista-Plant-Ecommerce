import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';
import BotanicalLine from '../common/BotanicalLine';

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'Indoor Plants', to: '/shop?category=indoor' },
      { label: 'Outdoor Plants', to: '/shop?category=outdoor' },
      { label: 'Succulents', to: '/shop?category=succulents' },
      { label: 'Planters & Pots', to: '/shop?category=planters' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'My Orders', to: '/orders' },
      { label: 'My Profile', to: '/profile' },
    ],
  },
];

/**
 * Footer — closes every page. Includes the botanical signature motif
 * once more so it bookends the page the same way the hero opens it.
 */
export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-cream/80">
      <div className="container-page py-16">
        <BotanicalLine className="mb-12 h-6 w-40 text-sage/50" />

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="inline-block rounded-2xl bg-cream px-3 py-2"><img src="/logo.png" alt="Plantista" className="h-12 w-auto" /></span>
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              Thoughtfully grown plants for homes and offices, delivered with the care instructions to keep them thriving.
            </p>
            <div className="mt-5 flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="rounded-full border border-cream/20 p-2 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="eyebrow text-sage/70">{col.heading}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-cream/70 transition-colors hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="eyebrow text-sage/70">Reach us</p>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li>hello@plantista.com</li>
              <li>+91 98765 43210</li>
              <li>Chennai, Tamil Nadu, IN</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Plantista. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold">Privacy Policy</a>
            <a href="#" className="hover:text-gold">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
