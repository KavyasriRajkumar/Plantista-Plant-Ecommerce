import api from './api';

// Admin-only endpoints. The API checks the role on every call; the route
// guards in the UI only keep customers from seeing empty pages.

export const getDashboardStats = async () => (await api.get('/stats')).data;

export const getAllOrders = async () => (await api.get('/orders')).data;
export const setOrderStatus = async (id, status) => (await api.patch(`/orders/${id}/status`, { status })).data;

export const getUsers = async () => (await api.get('/users')).data;
export const setUserStatus = async (id, status) => (await api.patch(`/users/${id}/status`, { status })).data;

export const createProduct = async (product) => (await api.post('/products', product)).data;
export const updateProduct = async (id, product) => (await api.put(`/products/${id}`, product)).data;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;
