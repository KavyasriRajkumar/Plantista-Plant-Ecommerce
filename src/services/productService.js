import api from './api';

// Product catalog, categories and storefront content, all served by the
// Express/MongoDB API. Pages import these functions and never talk to axios
// directly, so URLs and response shapes live in one place.

export const getPlants = async (filters = {}) => {
  const params = {};
  if (filters.category) params.category = filters.category;
  if (filters.search) params.search = filters.search;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.minRating) params.minRating = filters.minRating;
  if (filters.sort) params.sort = filters.sort;
  const { data } = await api.get('/products', { params });
  return data;
};

// Resolves to null for unknown or malformed ids so the page can show "not found".
export const getPlantById = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    if ([400, 404].includes(err.response?.status)) return null;
    throw err;
  }
};

export const getBestSellers = async () => (await api.get('/products/best-sellers')).data;

export const getRelatedPlants = async (plant) => (await api.get(`/products/${plant.id}/related`)).data;

export const getCategories = async () => (await api.get('/categories')).data;

export const getTestimonials = async () => (await api.get('/testimonials')).data;
