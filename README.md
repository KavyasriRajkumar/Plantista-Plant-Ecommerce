# Plantista

Premium plant e-commerce frontend — React 19 + Vite + Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

## Build progress

**Build history (batch 1 — foundation):**
- Project scaffold, Tailwind design tokens, fonts
- Cart / Wishlist / Auth context (global state)
- Product service layer (`src/services/productService.js`) — swap in real API calls here later
- Reusable components: Button, Rating, Loader/Skeleton, SearchBar, BotanicalLine (signature motif), ProductCard, CategoryCard, ReviewCard
- Navbar, Footer, MainLayout
- Home page (all sections)
- 404 page

**Done (batch 2 — shop):**
- Shop page: product grid, search, category/price/rating filters (desktop rail + mobile drawer), sorting, pagination
- Product Details page: image gallery, care info, quantity selector, add to cart/wishlist, related products
- Reusable Breadcrumb, Pagination, FilterSidebar components

**Done (batch 3 — accounts & cart):**
- Login page: email/password, remember me, forgot-password link, Google UI (visual only)
- Register page: name/email/mobile/password with full validation
- Cart page: quantity controls, remove item, coupon code (try `PLANT10` or `GREEN50`), free shipping threshold, checkout flow
- Wishlist page: saved plants with move-to-cart
- New reusable Input component; CartItem row component

**Done (batch 4 — account pages):**
- Profile page: account details, address, inline edit mode, quick links to Orders/Wishlist, logout
- Orders page: order history table with status badges, click-through details modal
- Contact page: validated contact form, map placeholder, social links, email/phone
- New reusable Modal component

**Done (batch 5 — admin dashboard):**
- AdminLayout + Sidebar (separate chrome from the storefront, mounted at `/admin`)
- Dashboard: analytics cards, weekly sales chart (CSS bars), recent orders
- Products: table + add/edit/delete via Modal-driven ProductForm
- Orders: table with editable status per order
- Users: table with block/unblock toggle

## Project status: full MERN app

Plantista is a MERN application: **MongoDB** (Mongoose) + **Express** + **React** + **Node**. Every page reads and writes real data through the API; there is no mock data left.

| Area | Where the data comes from |
|---|---|
| Sign in / register / profile | `/api/auth/*`, `PUT /api/users/me` |
| Shop, product details, Home | `/api/products`, `/api/categories`, `/api/testimonials` |
| Plant Finder | `POST /api/recommendations/plants` |
| Cart coupons and checkout | `POST /api/coupons/validate`, `POST /api/orders` (server re-prices and decrements stock) |
| My Orders | `GET /api/orders/mine` |
| Admin dashboard, products, orders, users | `/api/stats`, `/api/products`, `/api/orders`, `/api/users` |

Still client-side only: the cart and wishlist live in React state and are cleared on refresh.

### Run it

```bash
# 1. API (needs MongoDB running locally or an Atlas URI)
cd server && npm install && cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm run seed && npm run dev                          # http://localhost:5000

# 2. Frontend (in a second terminal, from the project root)
cp .env.example .env                                 # optional: only if the API is not on localhost:5000
npm install && npm run dev                           # http://localhost:5173
```

Admins sign in on their own page, `/admin/login` (not linked from the storefront), with the seeded account `admin@plantista.com` and the password from `ADMIN_PASSWORD` in `server/.env`. Customers use `/login`; an admin account is refused there, and a customer account is refused on the admin page. The storefront (Home, Shop, Plant Finder, product pages, cart) is public; **Sign in / Sign up** are in the navbar, and checkout, Profile and My Orders ask for a sign-in. Customers must save a delivery address in **Profile** before checkout.

## Design tokens

| Token | Hex | Use |
|---|---|---|
| `ink` | `#16311F` | Primary text, nav |
| `fern` | `#2F5A32` | Primary buttons/links |
| `moss` | `#4C7A4F` | Hover state |
| `sage` | `#9AB498` | Borders, tags |
| `mist` | `#E3EBDE` | Section tint |
| `cream` | `#F6F1E7` | Page background |
| `paper` | `#FFFDF8` | Card background |
| `gold` | `#B8924A` | Accent / CTA / price |
| `clay` | `#8A6E4B` | Secondary accent |

Fonts: `Fraunces` (display), `Manrope` (body), `IBM Plex Mono` (labels/prices).
