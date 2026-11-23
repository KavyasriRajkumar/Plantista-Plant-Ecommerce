import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSun, FiDroplet, FiTruck, FiShield } from 'react-icons/fi';
import { getPlants, getCategories, getBestSellers, getTestimonials } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import ReviewCard from '../components/review/ReviewCard';
import SearchBar from '../components/common/SearchBar';
import BotanicalLine from '../components/common/BotanicalLine';
import Button, { getButtonClasses } from '../components/common/Button';
import { ProductCardSkeleton } from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';

const WHY_US = [
  { icon: FiTruck, title: 'Careful delivery', body: 'Every plant is boxed with custom bracing so it arrives upright and undamaged.' },
  { icon: FiShield, title: '30-day guarantee', body: 'If a plant does not settle in within 30 days, we replace it, no questions asked.' },
  { icon: FiSun, title: 'Grown for your light', body: 'Filter by sunlight needs so you only see plants that will actually thrive at home.' },
  { icon: FiDroplet, title: 'Care that travels with it', body: 'Every product page ships with watering, light, and feeding guidance.' },
];

const CARE_TIPS = [
  { title: 'Check soil before watering', body: 'Push a finger 2 inches into the soil — water only if it comes out dry.' },
  { title: 'Rotate for even growth', body: 'Turn pots a quarter turn every week so plants grow evenly toward light.' },
  { title: 'Wipe leaves monthly', body: 'Dust blocks light absorption — a damp cloth keeps leaves photosynthesizing well.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getPlants(), getBestSellers(), getTestimonials()])
      .then(([cats, plants, best, reviews]) => {
        if (!active) return;
        setCategories(cats);
        setFeatured(plants.slice(0, 4));
        setBestSellers(best);
        setTestimonials(reviews);
      })
      .catch(() => active && toast.error('Could not load the store. Is the API running?'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="container-page grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="eyebrow">Grown with intention</p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Bring the outside <span className="italic text-fern">in</span>.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink/70">
              Plantista sources and hand-checks healthy plants for homes and offices, then ships them with the exact
              care they need to keep thriving in yours.
            </p>

            <div className="mt-8 max-w-md">
              <SearchBar onSearch={(q) => navigate(`/shop${q ? `?search=${encodeURIComponent(q)}` : ''}`)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/shop" className={getButtonClasses('primary', 'lg')}>
                Shop the collection
              </Link>
              <Link to="/shop?category=indoor" className={getButtonClasses('secondary', 'lg')}>
                Indoor plants
              </Link>
            </div>

            <BotanicalLine className="mt-12 h-6 w-48 text-sage" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-organic shadow-lift">
              <img
                src="/images/rubber-plant.jpg"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1597055181300-e3633a442ac4?q=80&w=1000'; }}
                alt="A large fiddle leaf fig in a sunlit living room corner"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-paper p-4 shadow-lift sm:block">
              <p className="font-mono text-xs text-ink/50">Trusted by</p>
              <p className="font-display text-2xl font-semibold text-ink">12,000+ homes</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="mt-2 font-display text-3xl font-medium">Shop by category</h2>
          </div>
          <Link to="/shop" className="hidden text-sm font-medium text-fern hover:underline sm:inline">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ---------- Featured Plants ---------- */}
      <section className="bg-mist/50 py-16">
        <div className="container-page">
          <p className="eyebrow">Handpicked</p>
          <h2 className="mt-2 font-display text-3xl font-medium">Featured plants</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((plant) => <ProductCard key={plant.id} plant={plant} />)}
          </div>
        </div>
      </section>

      {/* ---------- Best Sellers ---------- */}
      <section className="container-page py-16">
        <p className="eyebrow">Customer favorites</p>
        <h2 className="mt-2 font-display text-3xl font-medium">Best sellers</h2>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map((plant) => <ProductCard key={plant.id} plant={plant} />)}
        </div>
      </section>

      {/* ---------- Why Choose Us ---------- */}
      <section className="bg-ink py-16 text-cream">
        <div className="container-page">
          <p className="eyebrow text-sage/70">The Plantista difference</p>
          <h2 className="mt-2 font-display text-3xl font-medium text-cream">Why choose us</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item) => (
              <div key={item.title}>
                <item.icon className="text-gold" size={24} />
                <h3 className="mt-4 font-display text-lg font-medium text-cream">{item.title}</h3>
                <p className="mt-2 text-sm text-cream/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Plant Care Tips ---------- */}
      <section className="container-page py-16">
        <p className="eyebrow">Keep them thriving</p>
        <h2 className="mt-2 font-display text-3xl font-medium">Plant care tips</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CARE_TIPS.map((tip, i) => (
            <div key={tip.title} className="rounded-2xl border border-ink/10 p-6">
              <span className="font-mono text-xs text-gold">0{i + 1}</span>
              <h3 className="mt-3 font-display text-lg font-medium">{tip.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="bg-mist/50 py-16">
        <div className="container-page">
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-2 font-display text-3xl font-medium">What our customers say</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Newsletter ---------- */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-organic bg-fern px-8 py-14 text-center text-cream sm:px-16">
          <BotanicalLine className="mx-auto mb-6 h-6 w-40 text-cream/40" />
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Get plant care tips in your inbox</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-cream/70">
            One email a month. Seasonal care notes, new arrivals, occasional discounts.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-full border-0 px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <Button type="submit" variant="gold" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
