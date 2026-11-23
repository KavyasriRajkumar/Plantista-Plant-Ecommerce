import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Testimonial from '../models/Testimonial.js';
import { recommendationData } from './recommendationData.js';

dotenv.config();

// Starter catalog, categories and testimonials. The frontend reads all of
// this from the API, so this file is the only place the sample data lives.
const products = [
  {
    name: 'Money Plant (Pothos)', category: 'indoor', price: 449, discount: 0, rating: 4.2, reviewCount: 40, stock: 55, bestSeller: true,
    images: ['/plants/money-plant-pothos.jpg'],
    description: 'Trailing heart-shaped leaves splashed with gold; thrives on shelves, hangers and in dim corners.',
    care: { water: 'Every 1-2 weeks, when top soil is dry', sunlight: 'Low to bright indirect light', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Snake Plant', category: 'indoor', price: 799, discount: 0, rating: 4.4, reviewCount: 93, stock: 40, bestSeller: true,
    images: ['/plants/snake-plant.jpg'],
    description: 'Nearly indestructible and air-purifying, with tall architectural leaves that thrive on neglect.',
    care: { water: 'Every 2-3 weeks', sunlight: 'Low to bright indirect light', fertilizer: 'Light feed every 2 months' },
  },
  {
    name: 'ZZ Plant', category: 'office', price: 999, discount: 0, rating: 4.6, reviewCount: 146, stock: 31, bestSeller: true,
    images: ['/plants/zz-plant.jpg'],
    description: 'Glossy, waxy leaves that tolerate low light and irregular watering — the desk plant that forgives you.',
    care: { water: 'Every 2-3 weeks', sunlight: 'Low to bright indirect light', fertilizer: 'Light feed every 3 months' },
  },
  {
    name: 'Spider Plant', category: 'indoor', price: 399, discount: 0, rating: 4.8, reviewCount: 199, stock: 48, bestSeller: false,
    images: ['/plants/spider-plant.jpg'],
    description: 'Arching striped leaves and cascading baby plantlets; cheerful, forgiving and pet-friendly.',
    care: { water: 'Weekly, let top soil dry slightly', sunlight: 'Indirect to bright indirect light', fertilizer: 'Every 6 weeks in growing season' },
  },
  {
    name: 'Areca Palm', category: 'indoor', price: 1499, discount: 0, rating: 4.3, reviewCount: 252, stock: 15, bestSeller: false,
    images: ['/plants/areca-palm.jpg'],
    description: 'Feathery golden-green fronds that give living rooms an instant tropical feel.',
    care: { water: 'Weekly, keep soil lightly moist', sunlight: 'Bright indirect light', fertilizer: 'Every 6 weeks in growing season' },
  },
  {
    name: 'Peace Lily', category: 'flowering', price: 1099, discount: 5, rating: 4.5, reviewCount: 305, stock: 22, bestSeller: false,
    images: ['/plants/peace-lily.jpg'],
    description: 'Glossy leaves and elegant white blooms; one of the best-known air-purifying flowering plants.',
    care: { water: 'Weekly, likes consistently moist soil', sunlight: 'Low to medium indirect light', fertilizer: 'Every 6 weeks in growing season' },
  },
  {
    name: 'Rubber Plant', category: 'indoor', price: 1299, discount: 10, rating: 4.7, reviewCount: 58, stock: 18, bestSeller: false,
    images: ['/plants/rubber-plant.jpg'],
    description: 'Thick, glossy burgundy-green leaves on a sturdy upright stem; a bold, easy floor plant.',
    care: { water: 'Every 1-2 weeks, let top soil dry', sunlight: 'Bright to medium indirect light', fertilizer: 'Monthly in spring and summer' },
  },
  {
    name: 'Heartleaf Philodendron', category: 'indoor', price: 399, discount: 0, rating: 4.2, reviewCount: 111, stock: 50, bestSeller: false,
    images: ['/plants/heartleaf-philodendron.jpg'],
    description: 'Soft, heart-shaped leaves on trailing vines that adapt to nearly any indoor light.',
    care: { water: 'Weekly, when top soil is dry', sunlight: 'Low to bright indirect light', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Syngonium', category: 'indoor', price: 349, discount: 0, rating: 4.4, reviewCount: 164, stock: 40, bestSeller: false,
    images: ['/plants/syngonium.jpg'],
    description: 'Arrow-shaped leaves in green, pink and cream; a fast, easy climber or trailer for shelves.',
    care: { water: 'Weekly, let top soil dry', sunlight: 'Low to bright indirect light', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Aglaonema (Chinese Evergreen)', category: 'indoor', price: 649, discount: 0, rating: 4.6, reviewCount: 217, stock: 36, bestSeller: false,
    images: ['/plants/aglaonema-chinese-evergreen.jpg'],
    description: 'Patterned silver-green leaves that tolerate dim rooms; a dependable, slow-growing floor or table plant.',
    care: { water: 'Every 1-2 weeks, let top soil dry', sunlight: 'Low to medium indirect light', fertilizer: 'Twice a year' },
  },
  {
    name: 'Lucky Bamboo', category: 'office', price: 299, discount: 0, rating: 4.8, reviewCount: 270, stock: 60, bestSeller: true,
    images: ['/plants/lucky-bamboo.jpg'],
    description: 'Elegant green stems that grow in water or soil; a simple desk plant for dim offices.',
    care: { water: 'Keep roots in fresh water, change weekly', sunlight: 'Low to indirect light', fertilizer: 'Rarely, a drop of liquid feed monthly' },
  },
  {
    name: 'Parlor Palm', category: 'indoor', price: 549, discount: 0, rating: 4.3, reviewCount: 323, stock: 30, bestSeller: false,
    images: ['/plants/parlor-palm.jpg'],
    description: 'A compact, graceful palm that handles low light and suits desks, shelves and corners.',
    care: { water: 'Weekly, keep soil lightly moist', sunlight: 'Low to indirect light', fertilizer: 'Every 2 months in growing season' },
  },
  {
    name: 'Boston Fern', category: 'indoor', price: 599, discount: 0, rating: 4.5, reviewCount: 76, stock: 26, bestSeller: false,
    images: ['/plants/boston-fern.jpg'],
    description: 'Lush, arching fronds that love humidity; a classic for bright bathrooms and shaded spots.',
    care: { water: '2-3 times a week, keep soil moist', sunlight: 'Indirect light', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Peperomia', category: 'office', price: 349, discount: 0, rating: 4.7, reviewCount: 129, stock: 45, bestSeller: false,
    images: ['/plants/peperomia.jpg'],
    description: 'Compact, rubbery-leaved plant in many patterns; stays small and forgiving on a desk.',
    care: { water: 'Every 1-2 weeks, let top soil dry', sunlight: 'Medium to bright indirect light', fertilizer: 'Light feed monthly in growing season' },
  },
  {
    name: 'Jade Plant', category: 'succulents', price: 449, discount: 0, rating: 4.2, reviewCount: 182, stock: 34, bestSeller: false,
    images: ['/plants/jade-plant-crassula.jpg'],
    description: 'Thick, glossy coin-like leaves on a tree-like stem; a long-lived symbol of good luck.',
    care: { water: 'Every 2-3 weeks, allow full drying', sunlight: 'Bright light to direct sun', fertilizer: 'Sparingly in spring' },
  },
  {
    name: 'Aloe Vera', category: 'succulents', price: 299, discount: 0, rating: 4.4, reviewCount: 235, stock: 70, bestSeller: true,
    images: ['/plants/aloe-vera.jpg'],
    description: 'Fleshy spiky leaves with soothing gel; sun-loving, drought-tolerant and easy.',
    care: { water: 'Every 2-3 weeks, allow full drying', sunlight: 'Bright light to some direct sun', fertilizer: 'Twice a year' },
  },
  {
    name: 'Dracaena (Corn Plant)', category: 'indoor', price: 799, discount: 0, rating: 4.6, reviewCount: 288, stock: 24, bestSeller: false,
    images: ['/plants/dracaena-corn-plant.jpg'],
    description: 'Arching, corn-like leaves striped in lime and green on a sturdy cane; a classic floor plant.',
    care: { water: 'Every 1-2 weeks, let top half dry', sunlight: 'Low to bright indirect light', fertilizer: 'Every 2 months in growing season' },
  },
  {
    name: 'Chinese Money Plant', category: 'office', price: 499, discount: 0, rating: 4.8, reviewCount: 41, stock: 33, bestSeller: false,
    images: ['/plants/chinese-money-plant-pilea.jpg'],
    description: 'Coin-shaped leaves on slender stems; a compact, easy desk plant that makes baby plants.',
    care: { water: 'Weekly, when top soil is dry', sunlight: 'Bright indirect light', fertilizer: 'Every 6 weeks in growing season' },
  },
  {
    name: 'Coleus', category: 'outdoor', price: 149, discount: 0, rating: 4.3, reviewCount: 94, stock: 70, bestSeller: false,
    images: ['/plants/coleus.jpg'],
    description: 'Velvety leaves in wild red, pink, yellow and green patterns that brighten pots and borders.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Bright light to partial sun', fertilizer: 'Every 2 weeks in growing season' },
  },
  {
    name: 'Inch Plant (Tradescantia)', category: 'indoor', price: 199, discount: 0, rating: 4.5, reviewCount: 147, stock: 55, bestSeller: false,
    images: ['/plants/inch-plant.jpg'],
    description: 'Fast-growing trailing stems with purple-silver striped leaves; great in hanging baskets.',
    care: { water: 'Weekly, let top soil dry slightly', sunlight: 'Bright indirect light', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Tulsi (Holy Basil)', category: 'outdoor', price: 129, discount: 0, rating: 4.7, reviewCount: 200, stock: 100, bestSeller: true,
    images: ['/plants/tulsi-holy-basil.jpg'],
    description: 'Sacred, aromatic herb used in teas and worship; a hardy, sun-loving balcony staple.',
    care: { water: 'Every 2 days, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Every 3 weeks in growing season' },
  },
  {
    name: 'Hibiscus', category: 'outdoor', price: 649, discount: 10, rating: 4.2, reviewCount: 253, stock: 24, bestSeller: false,
    images: ['/plants/hibiscus.jpg'],
    description: 'Large, showy trumpet blooms in the heat; thrives on sunny balconies and in gardens.',
    care: { water: 'Every 2-3 days in heat, keep moist', sunlight: 'Full sun', fertilizer: 'Every 2 weeks in growing season' },
  },
  {
    name: 'Jasmine (Mogra)', category: 'flowering', price: 549, discount: 5, rating: 4.4, reviewCount: 306, stock: 23, bestSeller: false,
    images: ['/plants/jasmine-mogra.jpg'],
    description: 'Fragrant white blooms on a twining climber; ideal for sunny balconies and garden walls.',
    care: { water: 'Every 2-3 days in heat, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Every 2-3 weeks in growing season' },
  },
  {
    name: 'Marigold', category: 'flowering', price: 99, discount: 0, rating: 4.6, reviewCount: 59, stock: 120, bestSeller: false,
    images: ['/plants/marigold.jpg'],
    description: 'Bright orange and gold blooms that flower for months; easy colour for sunny beds and pots.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Full sun', fertilizer: 'Light feed every 3 weeks' },
  },
  {
    name: 'Rose', category: 'flowering', price: 299, discount: 0, rating: 4.8, reviewCount: 112, stock: 45, bestSeller: true,
    images: ['/plants/rose.jpg'],
    description: 'Classic fragrant blooms on a thorny shrub; rewarding in sunny gardens with regular care.',
    care: { water: 'Deep watering 2-3 times a week', sunlight: 'Full sun, 6+ hours', fertilizer: 'Rose feed every 3-4 weeks' },
  },
  {
    name: 'Bougainvillea', category: 'outdoor', price: 499, discount: 0, rating: 4.3, reviewCount: 165, stock: 24, bestSeller: false,
    images: ['/plants/bougainvillea.jpg'],
    description: 'Papery magenta bracts that cover walls and balconies in colour; thrives on heat and sun.',
    care: { water: 'Weekly, let soil dry between waterings', sunlight: 'Full sun', fertilizer: 'Monthly in blooming season' },
  },
  {
    name: 'Periwinkle (Sadabahar)', category: 'flowering', price: 99, discount: 0, rating: 4.5, reviewCount: 218, stock: 110, bestSeller: false,
    images: ['/plants/periwinkle-sadabahar.jpg'],
    description: 'Glossy leaves and pink or white flowers all year; tough, heat-loving and drought-tolerant.',
    care: { water: 'Every 3-4 days, let top soil dry', sunlight: 'Full sun to bright light', fertilizer: 'Light feed monthly' },
  },
  {
    name: 'Ixora', category: 'outdoor', price: 249, discount: 0, rating: 4.7, reviewCount: 271, stock: 50, bestSeller: false,
    images: ['/plants/ixora.jpg'],
    description: 'Dense clusters of red-orange flowers on a neat evergreen shrub; thrives in tropical heat.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Acidic feed every 3-4 weeks' },
  },
  {
    name: 'Crossandra (Kanakambaram)', category: 'flowering', price: 199, discount: 0, rating: 4.2, reviewCount: 324, stock: 60, bestSeller: false,
    images: ['/plants/crossandra.jpg'],
    description: 'Fan-shaped orange blooms that flower almost all year; a favourite for garlands and balconies.',
    care: { water: 'Every 2 days, keep soil moist', sunlight: 'Bright light to partial sun', fertilizer: 'Every 2 weeks in growing season' },
  },
  {
    name: 'Chrysanthemum', category: 'flowering', price: 249, discount: 0, rating: 4.4, reviewCount: 77, stock: 48, bestSeller: false,
    images: ['/plants/chrysanthemum.jpg'],
    description: 'Pompom blooms in autumn colours; bring bright seasonal colour to pots and beds.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Every 2 weeks until buds form' },
  },
  {
    name: 'Desert Rose (Adenium)', category: 'succulents', price: 599, discount: 5, rating: 4.6, reviewCount: 130, stock: 18, bestSeller: false,
    images: ['/plants/desert-rose.jpg'],
    description: 'A swollen trunk topped with bright trumpet flowers; loves heat, sun and very little water.',
    care: { water: 'Every 1-2 weeks, let soil dry fully', sunlight: 'Full sun', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Portulaca (Moss Rose)', category: 'flowering', price: 99, discount: 0, rating: 4.8, reviewCount: 183, stock: 100, bestSeller: false,
    images: ['/plants/portulaca-moss-rose.jpg'],
    description: 'Low, juicy-leaved carpet of silky flowers that open in sun; tough and drought-proof.',
    care: { water: 'Every 3-4 days, let soil dry', sunlight: 'Full sun', fertilizer: 'Rarely' },
  },
  {
    name: 'Aparajita (Butterfly Pea)', category: 'flowering', price: 149, discount: 0, rating: 4.3, reviewCount: 236, stock: 65, bestSeller: false,
    images: ['/plants/aparajita-butterfly-pea.jpg'],
    description: 'A vigorous climber with deep-blue flowers used for tea and natural food colour.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Light feed monthly' },
  },
  {
    name: 'Rangoon Creeper', category: 'outdoor', price: 349, discount: 0, rating: 4.5, reviewCount: 289, stock: 22, bestSeller: false,
    images: ['/plants/rangoon-creeper.jpg'],
    description: 'A fast, woody climber whose flowers shift from white to pink to red; scents the evening air.',
    care: { water: 'Every 2-3 days, deep watering', sunlight: 'Full sun', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Butterfly Bush (Buddleja)', category: 'outdoor', price: 449, discount: 0, rating: 4.7, reviewCount: 42, stock: 26, bestSeller: false,
    images: ['/plants/butterfly-bush-buddleja.jpg'],
    description: 'Arching spikes of honey-scented flowers that draw butterflies; easy in sunny gardens.',
    care: { water: 'Weekly, let top soil dry', sunlight: 'Full sun', fertilizer: 'Light feed in spring' },
  },
  {
    name: 'Curry Leaf', category: 'outdoor', price: 299, discount: 0, rating: 4.2, reviewCount: 95, stock: 35, bestSeller: false,
    images: ['/plants/curry-leaf.jpg'],
    description: 'Aromatic leaves essential to South Indian cooking; a small tree that suits sunny pots.',
    care: { water: '2-3 times a week, let top soil dry', sunlight: 'Full sun', fertilizer: 'Monthly in growing season' },
  },
  {
    name: 'Mint (Pudina)', category: 'outdoor', price: 129, discount: 0, rating: 4.4, reviewCount: 148, stock: 90, bestSeller: false,
    images: ['/plants/mint-pudina.jpg'],
    description: 'Vigorous, fragrant culinary herb for pots on balconies; keep it contained.',
    care: { water: 'Every 1-2 days, keep soil moist', sunlight: 'Bright light to partial sun', fertilizer: 'Every 3-4 weeks' },
  },
  {
    name: 'Coriander (Kothamalli)', category: 'outdoor', price: 79, discount: 0, rating: 4.6, reviewCount: 201, stock: 150, bestSeller: false,
    images: ['/plants/coriander-kothamalli.jpg'],
    description: 'Quick, aromatic leaves for chutneys and curries; sow in pots and harvest in weeks.',
    care: { water: 'Every 1-2 days, keep soil moist', sunlight: 'Bright light to some sun', fertilizer: 'Light feed every 3 weeks' },
  },
  {
    name: 'Fenugreek (Methi)', category: 'outdoor', price: 79, discount: 0, rating: 4.8, reviewCount: 254, stock: 150, bestSeller: false,
    images: ['/plants/fenugreek-methi.jpg'],
    description: 'Fast-growing leafy herb for parathas and curries; thrives in cooler, sunny pots.',
    care: { water: 'Every 1-2 days, keep soil moist', sunlight: 'Bright light to some sun', fertilizer: 'Rarely' },
  },
  {
    name: 'Green Chilli', category: 'outdoor', price: 149, discount: 0, rating: 4.3, reviewCount: 307, stock: 90, bestSeller: false,
    images: ['/plants/green-chilli.jpg'],
    description: 'Productive pots of fiery chillies; loves heat and sun and fruits for months.',
    care: { water: 'Every 2 days, keep soil moist', sunlight: 'Full sun', fertilizer: 'Every 2 weeks while fruiting' },
  },
  {
    name: 'Tomato', category: 'outdoor', price: 149, discount: 0, rating: 4.5, reviewCount: 60, stock: 100, bestSeller: true,
    images: ['/plants/tomato.jpg'],
    description: 'Heavy-cropping staked plants with sun-ripened fruit; a rewarding kitchen-garden staple.',
    care: { water: 'Daily in heat, deep watering', sunlight: 'Full sun, 6+ hours', fertilizer: 'Tomato feed every 2 weeks' },
  },
  {
    name: 'Brinjal (Kathirikai)', category: 'outdoor', price: 149, discount: 0, rating: 4.7, reviewCount: 113, stock: 80, bestSeller: false,
    images: ['/plants/brinjal-kathirikai.jpg'],
    description: 'Glossy purple fruit on a sturdy bush; a staple vegetable for hot, sunny gardens.',
    care: { water: 'Every 2 days, keep soil moist', sunlight: 'Full sun', fertilizer: 'Every 2 weeks while fruiting' },
  },
  {
    name: 'Okra (Vendakkai)', category: 'outdoor', price: 129, discount: 0, rating: 4.2, reviewCount: 166, stock: 90, bestSeller: false,
    images: ['/plants/okra-vendakkai.jpg'],
    description: 'Tall, heat-loving vegetable with hibiscus-like flowers and tender green pods.',
    care: { water: 'Every 2-3 days, deep watering', sunlight: 'Full sun', fertilizer: 'Every 3 weeks' },
  },
  {
    name: 'Spinach (Palak)', category: 'outdoor', price: 79, discount: 0, rating: 4.4, reviewCount: 219, stock: 150, bestSeller: false,
    images: ['/plants/spinach-palak.jpg'],
    description: 'Tender, iron-rich leaves that grow quickly in cool, sunny spots and containers.',
    care: { water: 'Every 1-2 days, keep soil moist', sunlight: 'Bright light to some sun', fertilizer: 'Every 3 weeks' },
  },
  {
    name: 'Amaranth Greens (Arai Keerai)', category: 'outdoor', price: 79, discount: 0, rating: 4.6, reviewCount: 272, stock: 150, bestSeller: false,
    images: ['/plants/amaranth-arai-keerai.jpg'],
    description: 'Fast, nutritious leafy greens grown in pots or beds; ready to cut in 3-4 weeks.',
    care: { water: 'Every 2 days, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Light feed once' },
  },
  {
    name: 'Malabar Spinach (Pasalai Keerai)', category: 'outdoor', price: 149, discount: 0, rating: 4.8, reviewCount: 325, stock: 70, bestSeller: false,
    images: ['/plants/malabar-spinach-pasalai-keerai.jpg'],
    description: 'A heat-loving climber with thick, glossy leaves for stir-fries and curries.',
    care: { water: 'Every 2 days, keep soil moist', sunlight: 'Full sun to bright light', fertilizer: 'Every 3 weeks' },
  },
  {
    name: 'Moringa (Murungai)', category: 'outdoor', price: 299, discount: 0, rating: 4.3, reviewCount: 78, stock: 40, bestSeller: false,
    images: ['/plants/moringa-murungai.jpg'],
    description: 'A fast, drought-tolerant tree with edible leaves, flowers and pods; thrives in tropical sun.',
    care: { water: 'Weekly, let soil dry', sunlight: 'Full sun', fertilizer: 'Compost twice a year' },
  },
  {
    name: 'Lemon', category: 'outdoor', price: 499, discount: 5, rating: 4.5, reviewCount: 131, stock: 36, bestSeller: false,
    images: ['/plants/lemon.jpg'],
    description: 'A compact citrus with fragrant blossoms and fruit; grows well in large pots on sunny terraces.',
    care: { water: '2-3 times a week, deep watering', sunlight: 'Full sun, 6+ hours', fertilizer: 'Citrus feed monthly in growing season' },
  },
  {
    name: 'Ginger', category: 'outdoor', price: 199, discount: 0, rating: 4.7, reviewCount: 184, stock: 60, bestSeller: false,
    images: ['/plants/ginger.jpg'],
    description: 'Tropical rhizome with tall, fragrant leaves; grow in a wide pot and harvest after 8-10 months.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Bright indirect to partial shade', fertilizer: 'Compost monthly' },
  },
  {
    name: 'Turmeric', category: 'outdoor', price: 199, discount: 0, rating: 4.2, reviewCount: 237, stock: 60, bestSeller: false,
    images: ['/plants/turmeric.jpg'],
    description: 'Broad leaves and golden rhizomes; a monsoon-loving crop that suits pots and shaded beds.',
    care: { water: 'Every 2-3 days, keep soil moist', sunlight: 'Bright indirect to partial shade', fertilizer: 'Compost monthly' },
  },
];

const categories = [
  { slug: 'indoor', name: 'Indoor Plants', image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=400' },
  { slug: 'outdoor', name: 'Outdoor Plants', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400' },
  { slug: 'succulents', name: 'Succulents', image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=400' },
  { slug: 'flowering', name: 'Flowering Plants', image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=400' },
  { slug: 'office', name: 'Office Desk Plants', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=400' },
  { slug: 'planters', name: 'Planters & Pots', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400' },
].map((c, i) => ({ ...c, order: i }));

const testimonials = [
  { name: 'Ananya R.', role: 'Chennai', quote: 'My apartment finally feels alive. The plants arrived healthier than ones I have bought in stores.', rating: 5 },
  { name: 'Rohan K.', role: 'Bengaluru', quote: 'Care instructions on every product page took the guesswork out of keeping these plants happy.', rating: 5 },
  { name: 'Meera S.', role: 'Mumbai', quote: 'Packaging was careful and the snake plant is thriving on my office desk three months in.', rating: 4 },
];

const adminUser = {
  name: 'Plantista Admin',
  email: 'admin@plantista.com',
  password: process.env.ADMIN_PASSWORD || 'admin123', // set ADMIN_PASSWORD in .env; hashed automatically by the User model
  role: 'admin',
};

async function run() {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Product.deleteMany();
    await Category.deleteMany();
    await Testimonial.deleteMany();
    await User.deleteMany({ role: 'admin' });
    console.log('Destroyed seeded data');
    process.exit();
  }

  await Product.deleteMany();
  await Product.insertMany(
    products.map((p) => ({ ...p, recommendation: recommendationData[p.name] ? { ...recommendationData[p.name], dataSource: 'seed', reviewed: false } : undefined }))
  );

  await Category.deleteMany();
  await Category.insertMany(categories);
  await Testimonial.deleteMany();
  await Testimonial.insertMany(testimonials);

  const existingAdmin = await User.findOne({ email: adminUser.email });
  if (!existingAdmin) await User.create(adminUser);

  console.log(`Seeded ${products.length} products.`);
  console.log(`Admin login → email: ${adminUser.email}  password: ${adminUser.password}`);
  process.exit();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
