import Product from '../models/Product.js';

// GET /api/products?category=&search=&minPrice=&maxPrice=&minRating=&sort=
// Query params mirror the shape the frontend already sends via
// productService.js, so swapping that file's fetch target to this
// endpoint requires no reshaping on the client.
export async function getProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice, minRating, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };

    let query = Product.find(filter);
    if (sort === 'price-asc') query = query.sort({ price: 1 });
    if (sort === 'price-desc') query = query.sort({ price: -1 });
    if (sort === 'rating') query = query.sort({ rating: -1 });

    const products = await query;
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/best-sellers
export async function getBestSellers(req, res, next) {
  try {
    const products = await Product.find({ bestSeller: true });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id/related
export async function getRelatedProducts(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.json(related);
  } catch (err) {
    next(err);
  }
}

// POST /api/products — admin only
export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id — admin only
export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id — admin only
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}
