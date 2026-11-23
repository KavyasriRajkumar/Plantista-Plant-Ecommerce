# Plantista API

Express + MongoDB backend for Plantista.

## Setup

```bash
cd server
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run seed            # populates products + a default admin user
npm run dev              # starts the API on http://localhost:5000
```

Seeded admin login (use the admin page, `/admin/login` in the app): `admin@plantista.com` / `admin123` — change this password immediately in any real deployment.

You'll need a MongoDB instance — either install MongoDB locally, or create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) and paste its connection string into `MONGO_URI`.

## Connecting the frontend

The React app already talks to this API (`src/services/*.js`, base URL from `VITE_API_URL`, default `http://localhost:5000/api`). Run `npm run seed` once so the catalog, categories, testimonials and admin user exist, then start both servers. Set `CLIENT_ORIGIN` in `.env` if the frontend is not on `http://localhost:5173`.

## API reference

### Auth
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ name, email, phone, password }` |
| POST | `/api/auth/login` | Public | `{ email, password }` |
| GET | `/api/auth/me` | Logged in | — |

### Products
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/products` | Public | Query: `category, search, minPrice, maxPrice, minRating, sort` |
| GET | `/api/products/best-sellers` | Public | |
| GET | `/api/products/:id` | Public | |
| GET | `/api/products/:id/related` | Public | |
| POST | `/api/products` | Admin | |
| PUT | `/api/products/:id` | Admin | |
| DELETE | `/api/products/:id` | Admin | |

### Orders
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/orders` | Logged in | `{ items: [{productId, quantity}], shippingAddress, couponCode }` — server re-prices from DB, decrements stock |
| GET | `/api/orders/mine` | Logged in | |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | `{ status }` |

### Sign-in doors
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Customers only; admin accounts get 403 |
| POST | `/api/auth/admin/login` | Public | Admins only; customers get the same 401 as a wrong password |

### Catalog content, coupons and stats
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/categories` | Public | `[{ id, name, image }]` |
| GET | `/api/testimonials` | Public | |
| POST | `/api/coupons/validate` | Public | `{ code }` -> `{ code, type, value }` or 404 |
| GET | `/api/stats` | Admin | Revenue, counts, last 7 days of sales, recent orders |

### Users
| Method | Route | Access | Notes |
|---|---|---|---|
| PUT | `/api/users/me` | Logged in | Update own profile/address |
| GET | `/api/users` | Admin | Customers, each with an `orders` count |
| PATCH | `/api/users/:id/status` | Admin | `{ status: 'Active' \| 'Blocked' }` |

## Notes

- Passwords are hashed with bcrypt; never stored or returned in plaintext.
- Coupon codes live in `utils/coupons.js`: `PLANT10` is 10% off and `GREEN50` is ₹50 off. The Cart page validates against the API and checkout applies the same rules. Move them to a `Coupon` model if you need admin-managed discounts.
- Order pricing is recalculated server-side from the current product price/discount/stock, never trusted from the client, so a tampered checkout request can't buy at an altered price.


## Authentication (sign up / sign in)

- `POST /api/auth/register` - name, email, phone (10 digits, optional), password (8-72 chars with a letter and a number). Always creates a `customer`; role/status in the body are ignored.
- `POST /api/auth/login` - email + password. Wrong email and wrong password return the same 401 message.
- `GET /api/auth/me` - current user (Bearer token).
- Login and register are rate limited to 10 attempts per 15 minutes per IP (in memory; use a shared store if you run several servers).
- Set `JWT_SECRET` in `.env`; the server refuses to start without it.
- Create an admin by changing a user's `role` to `admin` in MongoDB (the seed script also creates one).
